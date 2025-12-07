import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'Полное имя' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  fullName?: string;

  @ApiPropertyOptional({ description: 'Род деятельности' })
  @IsOptional()
  @IsString()
  occupation?: string;

  @ApiPropertyOptional({ description: 'Место работы' })
  @IsOptional()
  @IsString()
  workplace?: string;

  @ApiPropertyOptional({ description: 'Должность' })
  @IsOptional()
  @IsString()
  position?: string;
}

