import { Test, TestingModule } from "@nestjs/testing";
import { UserTapService } from "./user_tap-text.service";

describe("UserTapService", () => {
  let service: UserTapService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserTapService],
    }).compile();

    service = module.get<UserTapService>(UserTapService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
