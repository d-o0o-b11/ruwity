import { Module } from "@nestjs/common";
import { UserTapService } from "./user_tap.service";
import { UserTapController } from "./user_tap.controller";
import { EntitiesModule } from "src/entity.module";
import { UserUserModule } from "src/user_user/user_user.module";

@Module({
  imports: [EntitiesModule, UserUserModule],
  controllers: [UserTapController],
  providers: [UserTapService],
})
export class UserTapModule {}
