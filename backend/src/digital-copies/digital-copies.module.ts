import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DigitalCopiesService } from './digital-copies.service';
import { DigitalCopiesController } from './digital-copies.controller';
import { DigitalCopy } from './entities/digital-copy.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DigitalCopy])],
  controllers: [DigitalCopiesController],
  providers: [DigitalCopiesService],
  exports: [DigitalCopiesService],
})
export class DigitalCopiesModule {}

