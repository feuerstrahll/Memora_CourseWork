import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Record as RecordEntity } from './entities/record.entity';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { SearchRecordsDto } from './dto/search-records.dto';
import { Request } from '../requests/entities/request.entity';
import { RequestStatus } from '../common/enums/request-status.enum';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class RecordsService {
  constructor(
    @InjectRepository(RecordEntity)
    private recordsRepository: Repository<RecordEntity>,
    @InjectRepository(Request)
    private requestsRepository: Repository<Request>,
  ) {}

  async create(createRecordDto: CreateRecordDto): Promise<RecordEntity> {
    // Валидация дат: dateTo должна быть >= dateFrom
    if (createRecordDto.dateFrom && createRecordDto.dateTo) {
      const dateFrom = new Date(createRecordDto.dateFrom);
      const dateTo = new Date(createRecordDto.dateTo);
      if (dateTo < dateFrom) {
        throw new BadRequestException('Дата "до" не может быть раньше даты "от"');
      }
    }

    const record = this.recordsRepository.create({
      inventoryId: createRecordDto.inventoryId,
      refCode: createRecordDto.refCode,
      title: createRecordDto.title,
      annotation: createRecordDto.annotation,
      dateFrom: createRecordDto.dateFrom ? new Date(createRecordDto.dateFrom) : null,
      dateTo: createRecordDto.dateTo ? new Date(createRecordDto.dateTo) : null,
      extent: createRecordDto.extent,
      accessLevel: createRecordDto.accessLevel,
    });

    const savedRecord = await this.recordsRepository.save(record);

    if (createRecordDto.keywordIds && createRecordDto.keywordIds.length > 0) {
      savedRecord.keywords = createRecordDto.keywordIds.map((id) => ({ id } as any));
      await this.recordsRepository.save(savedRecord);
    }

    return this.findOne(savedRecord.id);
  }

  async search(searchDto: SearchRecordsDto) {
    const {
      search,
      fondId,
      inventoryId,
      keywordIds,
      accessLevel,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20,
      sortBy = 'id',
      sortOrder = 'ASC',
    } = searchDto;

    // Логирование для отладки
    console.log('Search params:', { search, fondId, inventoryId, page, limit });

    const query = this.recordsRepository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.inventory', 'inventory')
      .leftJoinAndSelect('inventory.fond', 'fond')
      .leftJoinAndSelect('record.keywords', 'keywords')
      .leftJoinAndSelect('record.digitalCopies', 'digitalCopies');

    if (search) {
      query.andWhere(
        '(record.title ILIKE :search OR record.annotation ILIKE :search OR record.refCode ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (fondId) {
      // Фильтруем по ID фонда через связь record -> inventory -> fond
      // Используем прямой доступ к полю fondId в таблице inventories
      query.andWhere('inventory.fondId = :fondId', { fondId });
    }

    if (inventoryId) {
      query.andWhere('inventory.id = :inventoryId', { inventoryId });
    }

    if (keywordIds && keywordIds.length > 0) {
      query.andWhere('keywords.id IN (:...keywordIds)', { keywordIds });
    }

    if (accessLevel) {
      query.andWhere('record.accessLevel = :accessLevel', { accessLevel });
    }

    if (dateFrom) {
      query.andWhere('record.dateFrom >= :dateFrom', {
        dateFrom: new Date(dateFrom),
      });
    }

    if (dateTo) {
      query.andWhere('record.dateTo <= :dateTo', {
        dateTo: new Date(dateTo),
      });
    }

    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    if (sortBy && sortOrder) {
      // Map sortBy field to actual database column
      const orderByMap: { [key: string]: string } = {
        id: 'record.id',
        title: 'record.title',
        refCode: 'record.refCode',
        dateFrom: 'record.dateFrom',
        dateTo: 'record.dateTo',
      };
      const sortField = orderByMap[sortBy] || 'record.id';
      query.orderBy(sortField, sortOrder);
    }

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAll(inventoryId?: number): Promise<RecordEntity[]> {
    const where = inventoryId ? { inventoryId } : {};
    return this.recordsRepository.find({
      where,
      relations: ['inventory', 'inventory.fond', 'keywords', 'digitalCopies'],
      order: { refCode: 'ASC' },
    });
  }

  async findOne(id: number): Promise<RecordEntity> {
    const record = await this.recordsRepository.findOne({
      where: { id },
      relations: ['inventory', 'inventory.fond', 'keywords', 'digitalCopies'],
    });
    if (!record) {
      throw new NotFoundException(`Record with ID ${id} not found`);
    }
    return record;
  }

  async update(id: number, updateRecordDto: UpdateRecordDto): Promise<RecordEntity> {
    const record = await this.findOne(id);
    
    // Валидация дат: dateTo должна быть >= dateFrom
    const dateFrom = updateRecordDto.dateFrom ? new Date(updateRecordDto.dateFrom) : record.dateFrom;
    const dateTo = updateRecordDto.dateTo ? new Date(updateRecordDto.dateTo) : record.dateTo;
    
    if (dateFrom && dateTo && dateTo < dateFrom) {
      throw new BadRequestException('Дата "до" не может быть раньше даты "от"');
    }
    
    Object.assign(record, {
      ...updateRecordDto,
      dateFrom,
      dateTo,
    });

    if (updateRecordDto.keywordIds !== undefined) {
      record.keywords = updateRecordDto.keywordIds.map((id) => ({ id } as any));
    }

    await this.recordsRepository.save(record);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const record = await this.findOne(id);
    
    // Удаляем файл, если он есть
    if (record.filePath) {
      await this.deleteFileFromDisk(record.filePath);
    }
    
    await this.recordsRepository.remove(record);
  }

  async uploadFile(id: number, file: Express.Multer.File): Promise<RecordEntity> {
    const record = await this.findOne(id);

    // Удаляем старый файл, если он есть
    if (record.filePath) {
      await this.deleteFileFromDisk(record.filePath);
    }

    // Сохраняем информацию о новом файле
    record.filePath = file.path;
    record.fileName = file.originalname;
    record.fileSize = file.size;

    await this.recordsRepository.save(record);
    return this.findOne(id);
  }

  async removeFile(id: number): Promise<RecordEntity> {
    const record = await this.findOne(id);

    if (!record.filePath) {
      throw new NotFoundException('У данной единицы хранения нет прикрепленного файла');
    }

    // Удаляем файл с диска
    await this.deleteFileFromDisk(record.filePath);

    // Очищаем информацию о файле в БД
    record.filePath = null;
    record.fileName = null;
    record.fileSize = null;

    await this.recordsRepository.save(record);
    return this.findOne(id);
  }

  private async deleteFileFromDisk(filePath: string): Promise<void> {
    try {
      const fullPath = join(process.cwd(), filePath);
      if (existsSync(fullPath)) {
        await unlink(fullPath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      // Не пробрасываем ошибку дальше, чтобы не блокировать удаление записи
    }
  }

  async checkUserHasApprovedRequest(recordId: number, userId: number): Promise<boolean> {
    // Проверяем наличие одобренной или выполненной заявки
    const approvedRequest = await this.requestsRepository.findOne({
      where: [
        {
          recordId,
          userId,
          status: RequestStatus.APPROVED,
        },
        {
          recordId,
          userId,
          status: RequestStatus.COMPLETED,
        },
      ],
    });
    
    return !!approvedRequest;
  }
}

