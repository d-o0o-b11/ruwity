import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { CreateUserUserDto } from "src/user_user/dto/create-user_user.dto";
import { UserEntity } from "src/user_user/entities/user_user.entity";
import { KakaoLoginUserDto } from "./dto/kakao-login.dto";
import {
  USER_USER_SERVICE_TOKEN,
  UserUserInterface,
} from "src/user_user/interfaces/user_user.interface";

@Injectable()
export class KakaoLoginService {
  constructor(
    @Inject(forwardRef(() => USER_USER_SERVICE_TOKEN))
    private readonly userUserInterface: UserUserInterface
  ) {}

  async kakaoLogin(kakao_user: KakaoLoginUserDto) {
    const { kakao_id, email } = kakao_user;

    const findResult = await this.userUserInterface.findOAuthUser(kakao_id);

    let saveResult: UserEntity;
    //최초 회원가입
    if (!findResult) {
      const data = new CreateUserUserDto({
        kakao_id: kakao_id,
        user_email: email,
      });

      saveResult = await this.userUserInterface.saveUser(data);

      await this.userUserInterface.defaultToken(saveResult.id);
    }
    const access_token = await this.userUserInterface.generateAccessToken(
      findResult?.id || saveResult.id
    );

    const refresh_token = await this.userUserInterface.generateRefreshToken(
      findResult?.id || saveResult.id
    );

    await this.userUserInterface.setCurrentRefreshToken(
      refresh_token,
      findResult?.id || saveResult.id
    );

    await this.userUserInterface.setKaKaoCurrentAccessToken(
      access_token,
      findResult?.id || saveResult.id
    );

    return { access_token: access_token, refresh_token: refresh_token };
  }

  async refreshTokencheck(refresh_token: string) {
    return await this.userUserInterface.refreshTokenCheck(refresh_token);
  }
}
