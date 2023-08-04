import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export enum CATEGORY {
  여성 = 'female',
  남성 = 'male',
}

export class UserReportDto {
  @IsString()
  @ApiProperty({
    description: '페이지 url',
    example: 'hiurl',
  })
  page_url: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: '성별(남자 male, 여자 female, 표시안함 null',
    example: 'male',
    type: 'enum',
    enum: CATEGORY,
  })
  @IsEnum(CATEGORY)
  gender?: CATEGORY;

  @IsNumber()
  @ApiProperty({
    description: '나이',
    example: '20',
  })
  age: number;
}
