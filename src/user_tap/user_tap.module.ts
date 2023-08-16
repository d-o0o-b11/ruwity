import { Module } from '@nestjs/common';
import { UserTapTextService } from './service/user_tap_text.service';
import { UserTapController } from './user_tap.controller';
import { EntitiesModule } from 'src/entity.module';
import { JsonWebTokenModule } from 'src/jwt.module';
import { UserTapLinkService } from './service/user_tap_link.service';

@Module({
  imports: [EntitiesModule, JsonWebTokenModule],
  controllers: [UserTapController],
  providers: [UserTapTextService, UserTapLinkService],
  exports: [UserTapTextService, UserTapLinkService],
})
export class UserTapModule {}
