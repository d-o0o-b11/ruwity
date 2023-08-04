import { Module } from "@nestjs/common";
import { UserTapService } from "./user_tap-text.service";
import { UserTapController } from "./user_tap.controller";
import { EntitiesModule } from "src/entity.module";
import { JwtConfigModule } from "src/jwt-service/jwt.module";
import { UserTapLinkService } from "./user_tap-link.service";

@Module({
  imports: [EntitiesModule, JwtConfigModule],
  controllers: [UserTapController],
  providers: [UserTapService, UserTapLinkService],
  exports: [UserTapService, UserTapLinkService],
})
export class UserTapModule {}
