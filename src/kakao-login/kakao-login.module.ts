import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtKakaoStrategy } from './jwt-kakao.strategy';
import { KakaoLoginController } from './kakao-login.controller';
import { KakaoLoginService } from './kakao-login.service';
import { UserUserModule } from 'src/user_user/user_user.module';

@Module({
  imports: [PassportModule, UserUserModule],
  controllers: [KakaoLoginController],
  providers: [JwtKakaoStrategy, KakaoLoginService],
})
export class KakaoLoginModule {}
