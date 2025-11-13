import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('stats')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  @ApiOperation({ summary: 'Get general statistics' })
  getGeneralStats(@CurrentUser() user: User) {
    return this.statsService.getGeneralStats(user.role);
  }

  @Get('requests')
  @ApiOperation({ summary: 'Get requests statistics' })
  getRequestsStats() {
    return this.statsService.getRequestsStats();
  }

  @Get('records-by-fond')
  @ApiOperation({ summary: 'Get records count by fond' })
  getRecordsByFond() {
    return this.statsService.getRecordsByFond();
  }

  @Get('records-by-year')
  @ApiOperation({ summary: 'Get records count by year' })
  getRecordsByYear() {
    return this.statsService.getRecordsByYear();
  }
}

