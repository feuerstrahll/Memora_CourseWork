import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Injectable()
export class InventoriesService {
  constructor(
    @InjectRepository(Inventory)
    private inventoriesRepository: Repository<Inventory>,
  ) {}

  async create(createInventoryDto: CreateInventoryDto): Promise<Inventory> {
    const inventory = this.inventoriesRepository.create(createInventoryDto);
    return this.inventoriesRepository.save(inventory);
  }

  async findAll(fondId?: number): Promise<Inventory[]> {
    const where = fondId ? { fondId } : {};
    return this.inventoriesRepository.find({
      where,
      relations: ['fond'],
      order: { number: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Inventory> {
    const inventory = await this.inventoriesRepository.findOne({
      where: { id },
      relations: ['fond', 'records'],
    });
    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${id} not found`);
    }
    return inventory;
  }

  async update(
    id: number,
    updateInventoryDto: UpdateInventoryDto,
  ): Promise<Inventory> {
    const inventory = await this.findOne(id);
    Object.assign(inventory, updateInventoryDto);
    return this.inventoriesRepository.save(inventory);
  }

  async remove(id: number): Promise<void> {
    const inventory = await this.findOne(id);
    await this.inventoriesRepository.remove(inventory);
  }
}

