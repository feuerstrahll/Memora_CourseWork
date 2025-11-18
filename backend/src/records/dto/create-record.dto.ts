import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsEnum,
  IsDateString,
  ValidateIf,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AccessLevel } from '../../common/enums/access-level.enum';

export class CreateRecordDto {
  @ApiProperty()
  @IsNumber()
  inventoryId: number;

  @ApiProperty()
  @IsString()
  refCode: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  annotation?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  @ValidateIf((o) => o.dateFrom && o.dateTo)
  dateTo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Matches(/^(?!.*-\d+).*$/, {
    message: 'Объём не может содержать отрицательные числа',
  })
  extent?: string;

  @ApiProperty({ enum: AccessLevel, required: false })
  @IsOptional()
  @IsEnum(AccessLevel)
  accessLevel?: AccessLevel;

  @ApiProperty({ required: false, type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  keywordIds?: number[];
}

