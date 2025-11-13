import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FondsService } from './fonds.service';
import { FondsController } from './fonds.controller';
import { Fond } from './entities/fond.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Fond])],
  controllers: [FondsController],
  providers: [FondsService],
  exports: [FondsService],
})
export class FondsModule {}

