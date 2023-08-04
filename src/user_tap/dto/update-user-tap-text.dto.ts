import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateUserTapTextDto {
  @IsNumber()
  @ApiProperty({
    description: "수정 tap id",
    example: 1,
  })
  tap_id: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: "수정 내용",
    example: "텍스트 수정내용",
  })
  context?: string;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    description: "공개 true, 비공개 false",
    example: true,
  })
  toggle_state?: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    description: "펼친 상태 true, 접은 상태 false",
    example: true,
  })
  folded_state?: boolean;
}
