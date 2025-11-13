import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Keyword } from './entities/keyword.entity';
import { CreateKeywordDto } from './dto/create-keyword.dto';
import { UpdateKeywordDto } from './dto/update-keyword.dto';

@Injectable()
export class KeywordsService {
  constructor(
    @InjectRepository(Keyword)
    private keywordsRepository: Repository<Keyword>,
  ) {}

  async create(createKeywordDto: CreateKeywordDto): Promise<Keyword> {
    const keyword = this.keywordsRepository.create(createKeywordDto);
    return this.keywordsRepository.save(keyword);
  }

  async findAll(): Promise<Keyword[]> {
    return this.keywordsRepository.find({
      order: { value: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Keyword> {
    const keyword = await this.keywordsRepository.findOne({
      where: { id },
      relations: ['records'],
    });
    if (!keyword) {
      throw new NotFoundException(`Keyword with ID ${id} not found`);
    }
    return keyword;
  }

  async findByValue(value: string): Promise<Keyword | null> {
    return this.keywordsRepository.findOne({ where: { value } });
  }

  async update(id: number, updateKeywordDto: UpdateKeywordDto): Promise<Keyword> {
    const keyword = await this.findOne(id);
    Object.assign(keyword, updateKeywordDto);
    return this.keywordsRepository.save(keyword);
  }

  async remove(id: number): Promise<void> {
    const keyword = await this.findOne(id);
    await this.keywordsRepository.remove(keyword);
  }
}

