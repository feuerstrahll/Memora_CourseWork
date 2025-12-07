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
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { Role } from '../common/enums/role.enum';

@ApiTags('requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @ApiOperation({ summary: 'Create request' })
  create(@Body() createRequestDto: CreateRequestDto, @CurrentUser() user: User) {
    return this.requestsService.create(createRequestDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all requests' })
  findAll(@CurrentUser() user: User) {
    return this.requestsService.findAll(user.id, user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get request by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.requestsService.findOne(+id, user.id, user.role);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.ARCHIVIST)
  @ApiOperation({ summary: 'Update request status (Admin/Archivist only)' })
  update(
    @Param('id') id: string, 
    @Body() updateRequestDto: UpdateRequestDto,
    @CurrentUser() user: User,
  ) {
    return this.requestsService.update(+id, updateRequestDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete request' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    // Only admins/archivists can delete any request, users can delete their own
    return this.requestsService.remove(+id);
  }
}

