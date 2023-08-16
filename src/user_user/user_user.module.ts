import { Module } from '@nestjs/common';
import { UserUserService } from './user_user.service';
import { UserUserController } from './user_user.controller';
import { EntitiesModule } from 'src/entity.module';
import { JsonWebTokenModule } from 'src/jwt.module';
import { UserTapModule } from 'src/user_tap/user_tap.module';
import { UserUrlModule } from 'src/user_url/user_url.module';

@Module({
  imports: [EntitiesModule, JsonWebTokenModule, UserTapModule, UserUrlModule],
  controllers: [UserUserController],
  providers: [UserUserService],
  exports: [UserUserService],
})
export class UserUserModule {}
