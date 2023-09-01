import { Module } from "@nestjs/common";
import { UserUserService } from "./services/user_user.service";
import { UserUserController } from "./user_user.controller";
import { EntitiesModule } from "src/entity.module";
import { JsonWebTokenModule } from "src/jwt.module";
import { UserTapModule } from "src/user_tap/user_tap.module";
import { UserUrlModule } from "src/user_url/user_url.module";
import { UserActiveService } from "./services/user-active.service";
import { USER_USER_SERVICE_TOKEN } from "./interfaces/user_user.interface";

@Module({
  imports: [EntitiesModule, JsonWebTokenModule, UserTapModule, UserUrlModule],
  controllers: [UserUserController],
  providers: [
    { provide: USER_USER_SERVICE_TOKEN, useClass: UserUserService },
    UserActiveService,
  ],
  exports: [USER_USER_SERVICE_TOKEN, UserActiveService],
})
export class UserUserModule {}
