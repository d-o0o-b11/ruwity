import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber } from 'class-validator';

export class UpdateUserTapToggle {
  @IsNumber()
  @ApiProperty({
    description: '수정 tap id',
    example: 1,
  })
  tap_id: number;

  @IsBoolean()
  @ApiProperty({
    description: 'toggle 공개 true, 비공개 false',
    example: false,
  })
  toggle_state: boolean;
}
