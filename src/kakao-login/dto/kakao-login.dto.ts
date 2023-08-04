import { IsNumber, IsString } from 'class-validator';

export class KakaoLoginUserDto {
  @IsNumber()
  kakao_id: number;

  @IsString()
  nickname: string;

  @IsString()
  profile_image: string;

  @IsString()
  email?: string;
}
