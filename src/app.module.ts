import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { KakaoLoginModule } from "./kakao-login/kakao-login.module";
import { UserUserModule } from "./user_user/user_user.module";
import { EntitiesModule } from "./entity.module";
import { SettingModule } from "./config/config.module";
import { UserUrlModule } from "./user_url/user_url.module";
import { UserTapModule } from "./user_tap/user_tap.module";
import { LoggerModule } from "./winston/winston.module";
import { JwtConfigModule } from "./jwt-service/jwt.module";

@Module({
  imports: [
    KakaoLoginModule,
    UserUserModule,
    EntitiesModule,
    SettingModule,
    UserUrlModule,
    UserTapModule,
    LoggerModule,
    JwtConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
