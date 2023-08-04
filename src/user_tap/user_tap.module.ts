import { Module } from "@nestjs/common";
import { UserTapService } from "./user_tap.service";
import { UserTapController } from "./user_tap.controller";
import { EntitiesModule } from "src/entity.module";
import { JwtConfigModule } from "src/jwt-service/jwt.module";

@Module({
  imports: [EntitiesModule, JwtConfigModule],
  controllers: [UserTapController],
  providers: [UserTapService],
})
export class UserTapModule {}
