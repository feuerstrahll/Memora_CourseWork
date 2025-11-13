import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { KeywordsService } from './keywords.service';
import { CreateKeywordDto } from './dto/create-keyword.dto';
import { UpdateKeywordDto } from './dto/update-keyword.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('keywords')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('keywords')
export class KeywordsController {
  constructor(private readonly keywordsService: KeywordsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.ARCHIVIST)
  @ApiOperation({ summary: 'Create keyword (Admin/Archivist only)' })
  create(@Body() createKeywordDto: CreateKeywordDto) {
    return this.keywordsService.create(createKeywordDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all keywords' })
  findAll() {
    return this.keywordsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get keyword by ID' })
  findOne(@Param('id') id: string) {
    return this.keywordsService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.ARCHIVIST)
  @ApiOperation({ summary: 'Update keyword (Admin/Archivist only)' })
  update(@Param('id') id: string, @Body() updateKeywordDto: UpdateKeywordDto) {
    return this.keywordsService.update(+id, updateKeywordDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.ARCHIVIST)
  @ApiOperation({ summary: 'Delete keyword (Admin/Archivist only)' })
  remove(@Param('id') id: string) {
    return this.keywordsService.remove(+id);
  }
}

