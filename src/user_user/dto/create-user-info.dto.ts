import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ActionTapDto } from './tap-delete.dto';
import { Type } from 'class-transformer';

export class CreateUserInfoDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'nickname',
    example: '지민',
  })
  nickname?: string;

  @IsOptional()
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'profile',
    example: 'image.png',
  })
  profile?: Express.Multer.File;

  @IsOptional()
  @ApiPropertyOptional({
    type: 'array', // 기존의 type: 'string' 대신 type: 'string', format: 'binary' 사용
    items: {
      type: 'string',
      format: 'binary',
    },
    description: '링크 이미지',
    example: ['dfdf/img1', 'dfdf/img2'],
  })
  link_img?: Express.Multer.File[];

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: '한줄 표현',
    example: '산 좋고 물 좋은 곳',
  })
  explanation?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: '오늘의 링크',
    example: 'https...',
  })
  today_link?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: '링크 이미지',
    example: 'dfdf/img',
  })
  img?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: '링크 제목',
    example: '고라니 날다',
  })
  title?: string;

  @IsOptional()
  @ApiPropertyOptional({
    type: [ActionTapDto], // ActionTapDto 배열 타입으로 설정
    description:
      '프로필, TAP[text, link] 수정 ->> 탭 삭제하는 것 제외하고는 method생략 ',
    example: [
      [{ column: 'profile' }], // 프로필 이미지 삭제 <<update로 들어감
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionTapDto)
  actions?: ActionTapDto[];

  constructor(data: Partial<CreateUserInfoDto>) {
    Object.assign(this, data);
  }
}
