import { Module } from '@nestjs/common';
import { UserUrlService } from './user_url.service';
import { UserUrlController } from './user_url.controller';
import { EntitiesModule } from 'src/entity.module';
import { UserUserModule } from 'src/user_user/user_user.module';

@Module({
  imports: [EntitiesModule, UserUserModule],
  controllers: [UserUrlController],
  providers: [UserUrlService],
})
export class UserUrlModule {}
