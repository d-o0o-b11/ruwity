import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtKakaoStrategy } from "./jwt-kakao.strategy";
import { KakaoLoginController } from "./kakao-login.controller";
import { KakaoLoginService } from "./kakao-login.service";
import { UserUserModule } from "src/user_user/user_user.module";
import { JwtConfigModule } from "src/jwt-service/jwt.module";

@Module({
  imports: [PassportModule, JwtConfigModule, UserUserModule],
  controllers: [KakaoLoginController],
  providers: [JwtKakaoStrategy, KakaoLoginService],
})
export class KakaoLoginModule {}
