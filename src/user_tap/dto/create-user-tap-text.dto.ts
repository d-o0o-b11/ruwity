import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateUserTapTextDto {
  @IsString()
  @ApiProperty({
    description: "제목",
    example: "텍스트 제목제목",
  })
  title: string;

  @IsString()
  @ApiProperty({
    description: "내용",
    example: "텍스트 내용내용",
  })
  context: string;
}
