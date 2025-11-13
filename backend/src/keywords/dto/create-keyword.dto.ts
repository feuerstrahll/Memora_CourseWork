import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateKeywordDto {
  @ApiProperty()
  @IsString()
  value: string;
}

