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
import { FondsService } from './fonds.service';
import { CreateFondDto } from './dto/create-fond.dto';
import { UpdateFondDto } from './dto/update-fond.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('fonds')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('fonds')
export class FondsController {
  constructor(private readonly fondsService: FondsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.ARCHIVIST)
  @ApiOperation({ summary: 'Create fond (Admin/Archivist only)' })
  create(@Body() createFondDto: CreateFondDto) {
    return this.fondsService.create(createFondDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all fonds' })
  findAll() {
    return this.fondsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get fond by ID' })
  findOne(@Param('id') id: string) {
    return this.fondsService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.ARCHIVIST)
  @ApiOperation({ summary: 'Update fond (Admin/Archivist only)' })
  update(@Param('id') id: string, @Body() updateFondDto: UpdateFondDto) {
    return this.fondsService.update(+id, updateFondDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.ARCHIVIST)
  @ApiOperation({ summary: 'Delete fond (Admin/Archivist only)' })
  remove(@Param('id') id: string) {
    return this.fondsService.remove(+id);
  }
}

