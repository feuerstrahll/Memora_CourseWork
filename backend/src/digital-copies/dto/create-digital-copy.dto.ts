import { IsString, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDigitalCopyDto {
  @ApiProperty()
  @IsNumber()
  recordId: number;

  @ApiProperty()
  @IsString()
  uri: string;

  @ApiProperty()
  @IsString()
  mimeType: string;

  @ApiProperty()
  @IsNumber()
  filesize: number;
}

