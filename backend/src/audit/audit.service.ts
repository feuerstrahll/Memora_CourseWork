import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogsRepository: Repository<AuditLog>,
  ) {}

  async log(
    userId: number | null,
    action: string,
    entity: string,
    entityId: number | null,
    metadata?: any,
  ): Promise<void> {
    const log = this.auditLogsRepository.create({
      userId,
      action,
      entity,
      entityId,
      metadata,
    });
    await this.auditLogsRepository.save(log);
  }

  async findAll(
    page: number = 1,
    limit: number = 50,
    userId?: number,
  ): Promise<{ data: AuditLog[]; total: number; page: number; limit: number }> {
    const where = userId ? { userId } : {};
    const skip = (page - 1) * limit;

    const [data, total] = await this.auditLogsRepository.findAndCount({
      where,
      relations: ['user'],
      order: { at: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total, page, limit };
  }
}

