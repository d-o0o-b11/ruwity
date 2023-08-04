import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class ActionTapDto {
  @IsOptional()
  @ApiPropertyOptional({
    description: 'delete할애들만 넣기',
    example: 'text',
  })
  @IsString()
  method?: string;

  @ApiProperty({
    description: '탭 text,link,profile 인지 ',
    example: 'text',
  })
  @IsString()
  column: string;

  @IsOptional()
  @ApiPropertyOptional({
    description: '삭제할 tap id',
    example: 1,
  })
  @IsNumber()
  tap_id?: number;

  @IsOptional()
  @ApiPropertyOptional({
    description: '수정할 제목',
    example: 'title',
  })
  @IsString()
  title?: string;

  @IsOptional()
  @ApiPropertyOptional({
    description: '수정할 내용',
    example: 'title',
  })
  @IsString()
  context?: string;

  @IsOptional()
  @ApiPropertyOptional({
    description: '공개 true, 비공개 false',
    example: true,
  })
  @IsBoolean()
  toggle_state?: boolean;

  @IsOptional()
  @ApiPropertyOptional({
    description: '링크 이미지 삭제 true',
    example: true,
  })
  @IsBoolean()
  img_delete?: boolean;

  @IsOptional()
  @ApiPropertyOptional({
    description: '링크 이미지 삭제를 하려면 true',
    example: true,
  })
  @IsBoolean()
  link_img_delete?: boolean;

  @IsOptional()
  @ApiPropertyOptional({
    description: '펼친 상태 true, 접은 상태 false',
    example: true,
  })
  @IsBoolean()
  folded_state?: boolean;

  constructor(data: Partial<ActionTapDto>) {
    Object.assign(this, data);
  }
}
