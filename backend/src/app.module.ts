import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FondsModule } from './fonds/fonds.module';
import { InventoriesModule } from './inventories/inventories.module';
import { RecordsModule } from './records/records.module';
import { KeywordsModule } from './keywords/keywords.module';
import { DigitalCopiesModule } from './digital-copies/digital-copies.module';
import { RequestsModule } from './requests/requests.module';
import { AuditModule } from './audit/audit.module';
import { StatsModule } from './stats/stats.module';
import { typeOrmConfig } from './config/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: typeOrmConfig,
    }),
    AuthModule,
    UsersModule,
    FondsModule,
    InventoriesModule,
    RecordsModule,
    KeywordsModule,
    DigitalCopiesModule,
    RequestsModule,
    AuditModule,
    StatsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

