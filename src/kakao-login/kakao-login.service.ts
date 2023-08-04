import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserUserDto } from 'src/user_user/dto/create-user_user.dto';
import { UserEntity } from 'src/user_user/entities/user_user.entity';
import { UserUserService } from 'src/user_user/user_user.service';
import { KakaoLoginUserDto } from './dto/kakao-login.dto';

@Injectable()
export class KakaoLoginService {
  constructor(private readonly userService: UserUserService) {}

  async kakaoLogin(kakao_user: KakaoLoginUserDto) {
    const { kakao_id, nickname, profile_image, email } = kakao_user;

    const findResult = await this.userService.findOAuthUser(kakao_id);

    let saveResult: UserEntity;
    //최초 회원가입
    if (!findResult) {
      const data = new CreateUserUserDto({
        kakao_id: kakao_id,
        user_email: email,
        // nickname: nickname,
        // profile: profile_image,
      });

      saveResult = await this.userService.saveUser(data);

      await this.userService.defaultToken(saveResult.id);
    }
    const access_token = await this.userService.generateAccessToken(
      findResult?.id || saveResult.id,
    );

    const refresh_token = await this.userService.generateRefreshToken(
      findResult?.id || saveResult.id,
    );

    await this.userService.setCurrentRefreshToken(
      refresh_token,
      findResult?.id || saveResult.id,
    );

    await this.userService.setKaKaoCurrentAccessToken(
      access_token,
      findResult?.id || saveResult.id,
    );

    return { access_token: access_token, refresh_token: refresh_token };
  }

  //finish---------
  async refreshTokencheck(refresh_token: string) {
    return await this.userService.refreshTokenCheck(refresh_token);
  }
}
