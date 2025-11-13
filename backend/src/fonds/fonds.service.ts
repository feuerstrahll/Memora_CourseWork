import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fond } from './entities/fond.entity';
import { CreateFondDto } from './dto/create-fond.dto';
import { UpdateFondDto } from './dto/update-fond.dto';

@Injectable()
export class FondsService {
  constructor(
    @InjectRepository(Fond)
    private fondsRepository: Repository<Fond>,
  ) {}

  async create(createFondDto: CreateFondDto): Promise<Fond> {
    const fond = this.fondsRepository.create(createFondDto);
    return this.fondsRepository.save(fond);
  }

  async findAll(): Promise<Fond[]> {
    return this.fondsRepository.find({
      relations: ['inventories'],
      order: { code: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Fond> {
    const fond = await this.fondsRepository.findOne({
      where: { id },
      relations: ['inventories'],
    });
    if (!fond) {
      throw new NotFoundException(`Fond with ID ${id} not found`);
    }
    return fond;
  }

  async update(id: number, updateFondDto: UpdateFondDto): Promise<Fond> {
    const fond = await this.findOne(id);
    Object.assign(fond, updateFondDto);
    return this.fondsRepository.save(fond);
  }

  async remove(id: number): Promise<void> {
    const fond = await this.findOne(id);
    await this.fondsRepository.remove(fond);
  }
}

