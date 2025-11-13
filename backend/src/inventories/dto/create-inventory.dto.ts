import { IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInventoryDto {
  @ApiProperty()
  @IsNumber()
  fondId: number;

  @ApiProperty()
  @IsString()
  number: string;

  @ApiProperty()
  @IsString()
  title: string;
}

