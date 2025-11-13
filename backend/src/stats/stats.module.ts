import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { Fond } from '../fonds/entities/fond.entity';
import { Inventory } from '../inventories/entities/inventory.entity';
import { Record } from '../records/entities/record.entity';
import { Request } from '../requests/entities/request.entity';
import { User } from '../users/entities/user.entity';
import { DigitalCopy } from '../digital-copies/entities/digital-copy.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Fond,
      Inventory,
      Record,
      Request,
      User,
      DigitalCopy,
    ]),
  ],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}

