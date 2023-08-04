import { Module } from "@nestjs/common";
import { UserUserService } from "./user_user.service";
import { UserUserController } from "./user_user.controller";
import { EntitiesModule } from "src/entity.module";
import { JwtConfigModule } from "src/jwt-service/jwt.module";
import { UserUrlModule } from "src/user_url/user_url.module";
import { UserTapModule } from "src/user_tap/user_tap.module";

@Module({
  imports: [EntitiesModule, JwtConfigModule, UserUrlModule, UserTapModule],
  controllers: [UserUserController],
  providers: [UserUserService],
  exports: [UserUserService],
})
export class UserUserModule {}
