import { PickType } from '@nestjs/swagger';
import { UserEntity } from '../entities/user_user.entity';

export class CreateUserUserDto extends PickType(UserEntity, [
  'kakao_id',
  'nickname',
  'profile',
  'user_email',
]) {
  constructor(data: Partial<CreateUserUserDto>) {
    super();
    Object.assign(this, data);
  }
}
