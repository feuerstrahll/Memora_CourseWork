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
import { DigitalCopiesService } from './digital-copies.service';
import { CreateDigitalCopyDto } from './dto/create-digital-copy.dto';
import { UpdateDigitalCopyDto } from './dto/update-digital-copy.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('digital-copies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('digital-copies')
export class DigitalCopiesController {
  constructor(private readonly digitalCopiesService: DigitalCopiesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.ARCHIVIST)
  @ApiOperation({ summary: 'Create digital copy (Admin/Archivist only)' })
  create(@Body() createDigitalCopyDto: CreateDigitalCopyDto) {
    return this.digitalCopiesService.create(createDigitalCopyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all digital copies' })
  findAll(@Query('recordId') recordId?: string) {
    return this.digitalCopiesService.findAll(recordId ? +recordId : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get digital copy by ID' })
  findOne(@Param('id') id: string) {
    return this.digitalCopiesService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.ARCHIVIST)
  @ApiOperation({ summary: 'Update digital copy (Admin/Archivist only)' })
  update(
    @Param('id') id: string,
    @Body() updateDigitalCopyDto: UpdateDigitalCopyDto,
  ) {
    return this.digitalCopiesService.update(+id, updateDigitalCopyDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.ARCHIVIST)
  @ApiOperation({ summary: 'Delete digital copy (Admin/Archivist only)' })
  remove(@Param('id') id: string) {
    return this.digitalCopiesService.remove(+id);
  }
}

