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
  UseInterceptors,
  UploadedFile,
  Res,
  NotFoundException,
  StreamableFile,
  ForbiddenException,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { Response } from 'express';
import { createReadStream, existsSync } from 'fs';
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

  @Post(':id/upload')
  @Roles(Role.ADMIN, Role.ARCHIVIST)
  @ApiOperation({ summary: 'Upload file for record (Admin/Archivist only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/records',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `record-${req.params.id}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.pdf', '.docx'];
        const ext = extname(file.originalname).toLowerCase();
        if (!allowedExtensions.includes(ext)) {
          return cb(new Error('Только PDF и DOCX файлы разрешены'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  uploadFile(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.recordsService.uploadFile(+id, file);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download file for record' })
  async downloadFile(
    @Param('id') id: string, 
    @Res({ passthrough: true }) res: Response,
    @Req() req: any,
  ) {
    const record = await this.recordsService.findOne(+id);
    const user = req.user;
    
    if (!record.filePath) {
      throw new NotFoundException('У данной единицы хранения нет прикрепленного файла');
    }

    // Researcher может скачивать файлы ТОЛЬКО через одобренные заявки
    if (user.role === Role.RESEARCHER) {
      const hasApprovedRequest = await this.recordsService.checkUserHasApprovedRequest(+id, user.id);
      
      if (!hasApprovedRequest) {
        throw new ForbiddenException(
          'Для доступа к файлу необходимо подать заявку и дождаться её одобрения.'
        );
      }
    }

    const filePath = join(process.cwd(), record.filePath);
    
    if (!existsSync(filePath)) {
      throw new NotFoundException('Файл не найден на сервере');
    }

    const file = createReadStream(filePath);
    
    res.set({
      'Content-Type': record.filePath.endsWith('.pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(record.fileName)}"`,
    });

    return new StreamableFile(file);
  }

  @Delete(':id/file')
  @Roles(Role.ADMIN, Role.ARCHIVIST)
  @ApiOperation({ summary: 'Delete file from record (Admin/Archivist only)' })
  removeFile(@Param('id') id: string) {
    return this.recordsService.removeFile(+id);
  }
}

