import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from './entities/request.entity';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { Role } from '../common/enums/role.enum';

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
      .leftJoinAndSelect('record.inventory', 'inventory')
      .leftJoinAndSelect('inventory.fond', 'fond');

    // Researchers can only see their own requests
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

    // Researchers can only see their own requests
    if (userRole === Role.RESEARCHER && request.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return request;
  }

  async update(
    id: number,
    updateRequestDto: UpdateRequestDto,
  ): Promise<Request> {
    const request = await this.findOne(id);
    Object.assign(request, updateRequestDto);
    return this.requestsRepository.save(request);
  }

  async remove(id: number): Promise<void> {
    const request = await this.findOne(id);
    await this.requestsRepository.remove(request);
  }
}

