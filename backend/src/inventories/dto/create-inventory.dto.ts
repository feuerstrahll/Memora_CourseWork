import { IsString, IsNumber, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInventoryDto {
  @ApiProperty()
  @IsNumber()
  fondId: number;

  @ApiProperty()
  @IsString()
  @Matches(/^[1-9]\d*$/, {
    message: 'Номер описи должен быть положительным числом (начиная с 1)',
  })
  number: string;

  @ApiProperty()
  @IsString()
  title: string;
}

