import { Module } from "@nestjs/common";
import { UserUrlService } from "./user_url.service";
import { UserUrlController } from "./user_url.controller";
import { EntitiesModule } from "src/entity.module";
import { JwtConfigModule } from "src/jwt-service/jwt.module";

@Module({
  imports: [EntitiesModule, JwtConfigModule],
  controllers: [UserUrlController],
  providers: [UserUrlService],
})
export class UserUrlModule {}
