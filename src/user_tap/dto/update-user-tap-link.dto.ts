import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateUserTapLinkDto {
  @IsNumber()
  @ApiProperty({
    description: '수정 tap id',
    example: 1,
  })
  tap_id: number;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: '제목 수정 또는 제목 추가',
    example: '링크 제목제목',
  })
  title?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: '링크 수정',
    example: 'http...',
  })
  url?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: '링크 이미지',
    example: 'http...',
  })
  link_img?: string;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    description: '공개 true, 비공개 false',
    example: true,
  })
  toggle_state?: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    description: '펼친 상태 true, 접은 상태 false',
    example: true,
  })
  folded_state?: boolean;
}
