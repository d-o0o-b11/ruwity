import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CreateUserTapLinkDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: "img 썸네일",
    example: ".../png",
  })
  img: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: "제목",
    example: "고라니가 수영함",
  })
  title: string;

  @IsString()
  @ApiProperty({
    description: "url",
    example: "https://www.naver.com",
  })
  url: string;
}
