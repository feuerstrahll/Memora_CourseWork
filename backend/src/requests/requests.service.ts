import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from './entities/request.entity';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { Role } from '../common/enums/role.enum';
import { RequestStatus } from '../common/enums/request-status.enum';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private requestsRepository: Repository<Request>,
  ) {}

  async create(createRequestDto: CreateRequestDto, userId: number): Promise<Request> {
    const request = this.requestsRepository.create({
      ...createRequestDto,
      userId,
    });
    return this.requestsRepository.save(request);
  }

  async findAll(userId?: number, userRole?: Role): Promise<Request[]> {
    const query = this.requestsRepository.createQueryBuilder('request')
      .leftJoinAndSelect('request.record', 'record')
      .leftJoinAndSelect('request.user', 'user')
      .leftJoinAndSelect('request.processedBy', 'processedBy')
      .leftJoinAndSelect('record.inventory', 'inventory')
      .leftJoinAndSelect('inventory.fond', 'fond');

    // Исследователи могут видеть только свои заявки
    if (userRole === Role.RESEARCHER && userId) {
      query.where('request.userId = :userId', { userId });
    }

    return query.orderBy('request.createdAt', 'DESC').getMany();
  }

  async findOne(id: number, userId?: number, userRole?: Role): Promise<Request> {
    const request = await this.requestsRepository.findOne({
      where: { id },
      relations: ['record', 'user', 'record.inventory', 'record.inventory.fond'],
    });

    if (!request) {
      throw new NotFoundException(`Request with ID ${id} not found`);
    }

    // Исследователи могут видеть только свои заявки
    if (userRole === Role.RESEARCHER && request.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return request;
  }

  async update(
    id: number,
    updateRequestDto: UpdateRequestDto,
    processedById?: number,
  ): Promise<Request> {
    const request = await this.findOne(id);
    
    // При отклонении требуется указать причину
    if (updateRequestDto.status === RequestStatus.REJECTED && !updateRequestDto.rejectionReason) {
      throw new BadRequestException('Необходимо указать причину отклонения');
    }
    
    // Записываем информацию о том, кто обработал заявку
    if (updateRequestDto.status === RequestStatus.APPROVED || 
        updateRequestDto.status === RequestStatus.REJECTED) {
      request.processedById = processedById;
      request.processedAt = new Date();
    }
    
    Object.assign(request, updateRequestDto);
    return this.requestsRepository.save(request);
  }

  async remove(id: number): Promise<void> {
    const request = await this.findOne(id);
    await this.requestsRepository.remove(request);
  }
}

