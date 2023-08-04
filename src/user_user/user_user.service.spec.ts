import { Test, TestingModule } from '@nestjs/testing';
import { UserUserService } from './user_user.service';

describe('UserUserService', () => {
  let service: UserUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserUserService],
    }).compile();

    service = module.get<UserUserService>(UserUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
