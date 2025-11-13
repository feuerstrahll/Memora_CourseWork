import { IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RequestType } from '../../common/enums/request-type.enum';

export class CreateRequestDto {
  @ApiProperty()
  @IsNumber()
  recordId: number;

  @ApiProperty({ enum: RequestType })
  @IsEnum(RequestType)
  type: RequestType;
}

