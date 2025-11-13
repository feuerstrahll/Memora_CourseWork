import { PartialType } from '@nestjs/swagger';
import { CreateDigitalCopyDto } from './create-digital-copy.dto';

export class UpdateDigitalCopyDto extends PartialType(CreateDigitalCopyDto) {}

