import { Module } from '@nestjs/common';
import { UserUrlService } from './user_url.service';
import { UserUrlController } from './user_url.controller';
import { EntitiesModule } from 'src/entity.module';
import { JsonWebTokenModule } from 'src/jwt.module';

@Module({
  imports: [EntitiesModule, JsonWebTokenModule],
  controllers: [UserUrlController],
  providers: [UserUrlService],
  exports: [UserUrlService],
})
export class UserUrlModule {}
