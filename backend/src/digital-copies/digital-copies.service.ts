import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DigitalCopy } from './entities/digital-copy.entity';
import { CreateDigitalCopyDto } from './dto/create-digital-copy.dto';
import { UpdateDigitalCopyDto } from './dto/update-digital-copy.dto';

@Injectable()
export class DigitalCopiesService {
  constructor(
    @InjectRepository(DigitalCopy)
    private digitalCopiesRepository: Repository<DigitalCopy>,
  ) {}

  async create(createDigitalCopyDto: CreateDigitalCopyDto): Promise<DigitalCopy> {
    const digitalCopy = this.digitalCopiesRepository.create(createDigitalCopyDto);
    return this.digitalCopiesRepository.save(digitalCopy);
  }

  async findAll(recordId?: number): Promise<DigitalCopy[]> {
    const where = recordId ? { recordId } : {};
    return this.digitalCopiesRepository.find({
      where,
      relations: ['record'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<DigitalCopy> {
    const digitalCopy = await this.digitalCopiesRepository.findOne({
      where: { id },
      relations: ['record'],
    });
    if (!digitalCopy) {
      throw new NotFoundException(`DigitalCopy with ID ${id} not found`);
    }
    return digitalCopy;
  }

  async update(
    id: number,
    updateDigitalCopyDto: UpdateDigitalCopyDto,
  ): Promise<DigitalCopy> {
    const digitalCopy = await this.findOne(id);
    Object.assign(digitalCopy, updateDigitalCopyDto);
    return this.digitalCopiesRepository.save(digitalCopy);
  }

  async remove(id: number): Promise<void> {
    const digitalCopy = await this.findOne(id);
    await this.digitalCopiesRepository.remove(digitalCopy);
  }
}

