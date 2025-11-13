import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RecordsService } from './records.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { SearchRecordsDto } from './dto/search-records.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('records')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.ARCHIVIST)
  @ApiOperation({ summary: 'Create record (Admin/Archivist only)' })
  create(@Body() createRecordDto: CreateRecordDto) {
    return this.recordsService.create(createRecordDto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search records with filters' })
  search(@Query() searchDto: SearchRecordsDto) {
    return this.recordsService.search(searchDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all records' })
  findAll(@Query('inventoryId') inventoryId?: string) {
    return this.recordsService.findAll(inventoryId ? +inventoryId : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get record by ID' })
  findOne(@Param('id') id: string) {
    return this.recordsService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.ARCHIVIST)
  @ApiOperation({ summary: 'Update record (Admin/Archivist only)' })
  update(@Param('id') id: string, @Body() updateRecordDto: UpdateRecordDto) {
    return this.recordsService.update(+id, updateRecordDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.ARCHIVIST)
  @ApiOperation({ summary: 'Delete record (Admin/Archivist only)' })
  remove(@Param('id') id: string) {
    return this.recordsService.remove(+id);
  }
}

