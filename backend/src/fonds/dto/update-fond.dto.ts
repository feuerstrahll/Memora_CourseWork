import { PartialType } from '@nestjs/swagger';
import { CreateFondDto } from './create-fond.dto';

export class UpdateFondDto extends PartialType(CreateFondDto) {}

