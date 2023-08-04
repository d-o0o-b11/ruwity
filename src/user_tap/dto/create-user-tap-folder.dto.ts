import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber } from "class-validator";

export class UpdateUserTapFolderStateDto {
  @IsNumber()
  @ApiProperty({
    description: "수정 tap id",
    example: 1,
  })
  tap_id: number;

  @IsBoolean()
  @ApiProperty({
    description: "펼친 상태 true, 접은 상태 false",
    example: false,
  })
  folded_state: boolean;
}
