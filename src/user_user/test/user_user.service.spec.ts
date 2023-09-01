import { Test, TestingModule } from "@nestjs/testing";
import { UserUserService } from "../services/user_user.service";
import { Repository } from "typeorm";
import { UserEntity } from "../entities/user_user.entity";
import { UserTokenEntity } from "../entities/user_token.entity";
import { JwtService } from "@nestjs/jwt";
import { UserActiveService } from "../services/user-active.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { mockRepository } from "src/mock/mock.repository";
import { mockJwtService } from "src/mock/mock.jwt-service";
import { CreateUserUserDto } from "../dto/create-user_user.dto";
import { plainToInstance } from "class-transformer";
import { NotFoundException, UnauthorizedException } from "@nestjs/common";
import { CATEGORY } from "../dto/save-user-report.dto";

describe("UserUserService", () => {
  let service: UserUserService;
  let userRepository: Repository<UserEntity>;
  let userTokenRepository: Repository<UserTokenEntity>;
  let jwtService: JwtService;
  let userActiveService: UserActiveService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserUserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(UserTokenEntity),
          useValue: mockRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService(),
        },
        {
          provide: UserActiveService,
          useValue: {
            getPreSignedUrl: jest.fn(),
            findOneUserTodayLink: jest.fn(),
            findOneUserPage: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserUserService>(UserUserService);
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity)
    );
    userTokenRepository = module.get<Repository<UserTokenEntity>>(
      getRepositoryToken(UserTokenEntity)
    );
    jwtService = module.get<JwtService>(JwtService);
    userActiveService = module.get<UserActiveService>(UserActiveService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findOAuthUser", () => {
    const findOneResultDummyData = {
      id: 1,
      kakao_id: 123,
      nickname: "test",
    } as any;

    const kakao_id = 123;

    it("카카오 유저 존재 여부 확인", async () => {
      const findOneResult = jest
        .spyOn(userRepository, "findOne")
        .mockResolvedValue(findOneResultDummyData);

      await service.findOAuthUser(kakao_id);

      expect(findOneResult).toBeCalledTimes(1);
      expect(findOneResult).toBeCalledWith({
        where: {
          kakao_id: kakao_id,
        },
      });
    });
  });

  describe("saveUser", () => {
    const createUserUserDto = {
      kakao_id: 123,
      nickname: "test",
      profile: "test.img",
      user_email: "test@naver.com",
    } as CreateUserUserDto;

    const saveResultDummyData = {
      id: 1,
      kakao_id: 123,
      nickname: "test",
    } as any;

    it("유저 디비에 저장", async () => {
      const createUserDtoToEntity = plainToInstance(
        UserEntity,
        createUserUserDto
      );

      const saveResult = jest
        .spyOn(userRepository, "save")
        .mockResolvedValue(saveResultDummyData);

      await service.saveUser(createUserUserDto);

      expect(saveResult).toBeCalledTimes(1);
      expect(saveResult).toBeCalledWith(createUserDtoToEntity);
    });
  });

  describe("generateAccessToken", () => {
    const id = 1;
    const mockToken = "TEST_ACCESS_TOKEN";

    it("access_token 발급", async () => {
      const signAsync = jest
        .spyOn(jwtService, "signAsync")
        .mockResolvedValue(mockToken);

      await service.generateAccessToken(id);

      expect(signAsync).toBeCalledTimes(1);
      expect(signAsync).toBeCalledWith(
        { id: id },
        {
          secret: process.env.JWT_ACCESS_SECRET,
          expiresIn: "12h",
        }
      );
    });
  });

  describe("generateRefreshToken", () => {
    const id = 1;
    const mockToken = "TEST_REFRESH_TOKEN";

    it("refresh_token 발급", async () => {
      const signAsync = jest
        .spyOn(jwtService, "signAsync")
        .mockResolvedValue(mockToken);

      await service.generateRefreshToken(id);

      expect(signAsync).toBeCalledTimes(1);
      expect(signAsync).toBeCalledWith(
        { id: id },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: "30d",
        }
      );
    });
  });

  describe("defaultToken", () => {
    const user_id = 1;
    it("토큰 초기화", async () => {
      const saveResult = jest.spyOn(userTokenRepository, "save");

      await service.defaultToken(user_id);

      expect(saveResult).toBeCalledTimes(1);
      expect(saveResult).toBeCalledWith({
        user_id: user_id,
        access_token: undefined,
        refresh_token: undefined,
      });
    });
  });

  describe("setCurrentRefreshToken", () => {
    const user_id = 1;
    const refresh_token = "TEST_REFRESH_TOKEN";

    it("현재 refresh_token 디비에 저장", async () => {
      const updateResult = jest.spyOn(userTokenRepository, "update");

      await service.setCurrentRefreshToken(refresh_token, user_id);

      expect(updateResult).toBeCalledTimes(1);
      expect(updateResult).toBeCalledWith(user_id, {
        refresh_token: refresh_token,
      });
    });
  });

  describe("setKaKaoCurrentAccessToken", () => {
    const user_id = 1;
    const access_token = "TEST_ACCESS_TOKEN";

    it("카카오 access_token 저장", async () => {
      const updateResult = jest.spyOn(userTokenRepository, "update");

      await service.setKaKaoCurrentAccessToken(access_token, user_id);

      expect(updateResult).toBeCalledTimes(1);
      expect(updateResult).toBeCalledWith(user_id, {
        access_token: access_token,
      });
    });
  });

  describe("refreshTokenCheck", () => {
    const findOneResultDummyData = {
      id: 1,
      refresh_token: "TEST_REFRESH_TOKEN",
    } as any;

    const verifyAsyncResult = {
      id: 1,
    };

    const refreshToken = "FINISH_REFRESH_TOKEN";
    const refreshToken2 = "TEST_REFRESH_TOKEN";

    const access_token = "ACCESS_TOKEN";

    it("refresh_token 만료된 경우", async () => {
      const decodedRefreshToken = jest
        .spyOn(jwtService, "verifyAsync")
        .mockResolvedValue(verifyAsyncResult);

      const userFindResult = jest
        .spyOn(userTokenRepository, "findOne")
        .mockResolvedValue(findOneResultDummyData);

      await expect(
        async () => await service.refreshTokenCheck(refreshToken)
      ).rejects.toThrowError(
        new UnauthorizedException("refreshToken이 만료되었습니다.")
      );

      expect(decodedRefreshToken).toBeCalledTimes(1);
      expect(decodedRefreshToken).toBeCalledWith(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      expect(userFindResult).toBeCalledTimes(1);
      expect(userFindResult).toBeCalledWith({
        where: {
          user_id: findOneResultDummyData.id,
        },
      });
    });

    it("refresh_token 마료 되기 전 , access_token 재 발급", async () => {
      const decodedRefreshToken = jest
        .spyOn(jwtService, "verifyAsync")
        .mockResolvedValue(verifyAsyncResult);

      const userFindResult = jest
        .spyOn(userTokenRepository, "findOne")
        .mockResolvedValue(findOneResultDummyData);

      const accessToken = jest
        .spyOn(service, "generateAccessToken")
        .mockResolvedValue(access_token);

      const setKaKaoCurrentAccessToken = jest.spyOn(
        service,
        "setKaKaoCurrentAccessToken"
      );

      await service.refreshTokenCheck(refreshToken2);

      expect(decodedRefreshToken).toBeCalledTimes(1);
      expect(decodedRefreshToken).toBeCalledWith(refreshToken2, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      expect(userFindResult).toBeCalledTimes(1);
      expect(userFindResult).toBeCalledWith({
        where: {
          user_id: findOneResultDummyData.id,
        },
      });

      expect(accessToken).toBeCalledTimes(1);
      expect(accessToken).toBeCalledWith(findOneResultDummyData.id);

      expect(setKaKaoCurrentAccessToken).toBeCalledTimes(1);
      expect(setKaKaoCurrentAccessToken).toBeCalledWith(
        access_token,
        findOneResultDummyData.id
      );
    });
  });

  describe("getUserInfo", () => {
    const findOneResultDummyData = {
      id: 1,
      profile: "image.png",
      nickname: "TEST_NICKNAME",
      explanation: "TEST_EXPLANATION",
      user_email: "TEST_EMAIL",
    } as any;

    const findTodayLinkDummyData = {
      url_id: 1,
      today_link: "날씨 좋다",
      created_at: new Date("2023-08-31"),
    } as any;

    const id = 1;

    it("유저 정보 없는 경우", async () => {
      const findResult = jest.spyOn(userRepository, "findOne");

      await expect(
        async () => await service.getUserInfo(id)
      ).rejects.toThrowError(
        new NotFoundException("존재하지 않는 유저 id 입니다.")
      );

      expect(findResult).toBeCalledTimes(1);
      expect(findResult).toBeCalledWith({
        where: {
          id: id,
        },
      });
    });

    it("유저 정보 있는 경우", async () => {
      const findResult = jest
        .spyOn(userRepository, "findOne")
        .mockResolvedValue(findOneResultDummyData);

      const getPreSignedUrl = jest
        .spyOn(userActiveService, "getPreSignedUrl")
        .mockResolvedValue("S3_IMAGE");

      const findTodayLink = jest
        .spyOn(userActiveService, "findOneUserTodayLink")
        .mockResolvedValue(findTodayLinkDummyData);

      const findPageUrl = jest
        .spyOn(userActiveService, "findOneUserPage")
        .mockResolvedValue({ page_url: "TEST_PAGE_URL" } as any);

      await service.getUserInfo(id);

      expect(findResult).toBeCalledTimes(1);
      expect(findResult).toBeCalledWith({
        where: {
          id: id,
        },
      });

      expect(getPreSignedUrl).toBeCalledTimes(1);
      expect(getPreSignedUrl).toBeCalledWith(findOneResultDummyData.profile);

      expect(findTodayLink).toBeCalledTimes(1);
      expect(findTodayLink).toBeCalledWith(id);

      expect(findPageUrl).toBeCalledTimes(1);
      expect(findPageUrl).toBeCalledWith(id);
    });
  });

  describe("setNullProfileImg", () => {
    const userId = 1;

    it("유저 이미지 삭제 실패", async () => {
      const updateResult = jest
        .spyOn(userRepository, "update")
        .mockResolvedValue({
          affected: 0,
          raw: [],
          generatedMaps: [],
        } as any);

      await expect(
        async () => await service.setNullProfileImg(userId)
      ).rejects.toThrowError(new Error("이미지 삭제 실패"));

      expect(updateResult).toBeCalledTimes(1);
      expect(updateResult).toBeCalledWith(userId, {
        profile: "",
      });
    });

    it("유저 이미지 삭제 성공", async () => {
      const updateResult = jest
        .spyOn(userRepository, "update")
        .mockResolvedValue({
          affected: 1,
          raw: [],
          generatedMaps: [],
        } as any);

      await service.setNullProfileImg(userId);

      expect(updateResult).toBeCalledTimes(1);
      expect(updateResult).toBeCalledWith(userId, {
        profile: "",
      });
    });
  });

  describe("updateUserName", () => {
    const findOneResultDummyData = {
      id: 1,
      kakao_id: 123,
      nickname: "TEST_NICKNAME",
      profile: "",
      explanation: "TODAY_LINK",
    } as any;

    const id = 1;

    const nickname = "TEST_NICKNAME";

    it("유저 닉네임 저장", async () => {
      const findResult = jest.spyOn(userRepository, "findOne");

      const saveResult = jest
        .spyOn(userRepository, "save")
        .mockResolvedValue(findOneResultDummyData);

      await service.updateUserName(id, nickname);

      expect(findResult).toBeCalledTimes(1);
      expect(findResult).toBeCalledWith({
        where: {
          id: id,
        },
      });

      expect(saveResult).toBeCalledTimes(1);
      expect(saveResult).toBeCalledWith(
        new UserEntity({
          id: id,
          nickname: nickname,
        })
      );
    });

    it("유저 닉네임 업데이트", async () => {
      const findResult = jest
        .spyOn(userRepository, "findOne")
        .mockResolvedValue(findOneResultDummyData);

      const updateResult = jest
        .spyOn(userRepository, "update")
        .mockResolvedValue({
          raw: [],
          affected: 1,
          generatedMaps: [],
        });

      await service.updateUserName(id, "UPDATE_NICKNAME");

      expect(findResult).toBeCalledTimes(1);
      expect(findResult).toBeCalledWith({
        where: {
          id: id,
        },
      });

      expect(updateResult).toBeCalledTimes(1);
      expect(updateResult).toBeCalledWith(id, {
        nickname: "UPDATE_NICKNAME",
      });
    });
  });

  describe("upsertUserExplanation", () => {
    const id = 1;
    const explanation = "날씨 좋다";

    const findOneResultDummyData = {
      id: 1,
      kakao_id: 123,
      nickname: "TEST_NICKNAME",
      profile: "",
      explanation: "TODAY_LINK",
    } as any;

    it("유저 한줄 소개 저장", async () => {
      const findResult = jest.spyOn(userRepository, "findOne");

      const saveResult = jest
        .spyOn(userRepository, "save")
        .mockResolvedValue(findOneResultDummyData);

      await service.upsertUserExplanation(id, explanation);

      expect(findResult).toBeCalledTimes(1);
      expect(findResult).toBeCalledWith({
        where: {
          id: id,
        },
      });

      expect(saveResult).toBeCalledTimes(1);
      expect(saveResult).toBeCalledWith(
        new UserEntity({
          id: id,
          explanation: explanation,
        })
      );
    });

    it("유저 한줄 소개 업데이트", async () => {
      const findResult = jest
        .spyOn(userRepository, "findOne")
        .mockResolvedValue(findOneResultDummyData);

      const updateResult = jest
        .spyOn(userRepository, "update")
        .mockResolvedValue({
          raw: [],
          affected: 1,
          generatedMaps: [],
        });

      await service.upsertUserExplanation(id, explanation);

      expect(findResult).toBeCalledTimes(1);
      expect(findResult).toBeCalledWith({
        where: {
          id: id,
        },
      });

      expect(updateResult).toBeCalledTimes(1);
      expect(updateResult).toBeCalledWith(id, {
        explanation: explanation,
      });
    });
  });

  describe("logoutTokenNull", () => {
    const user_id = 1;

    it("로그아웃 => 토큰 제거 실패", async () => {
      const removeResult = jest
        .spyOn(userTokenRepository, "update")
        .mockResolvedValue({
          raw: [],
          affected: 0,
          generatedMaps: [],
        });

      await expect(
        async () => await service.logoutTokenNull(user_id)
      ).rejects.toThrowError("로그아웃에 실패하였습니다.");

      expect(removeResult).toBeCalledTimes(1);
      expect(removeResult).toBeCalledWith(user_id, {
        access_token: "",
        refresh_token: "",
      });
    });

    it("로그아웃 => 토큰 제거 성공", async () => {
      const removeResult = jest
        .spyOn(userTokenRepository, "update")
        .mockResolvedValue({
          raw: [],
          affected: 1,
          generatedMaps: [],
        });

      await service.logoutTokenNull(user_id);

      expect(removeResult).toBeCalledTimes(1);
      expect(removeResult).toBeCalledWith(user_id, {
        access_token: "",
        refresh_token: "",
      });
    });
  });

  describe("userWithdraw", () => {
    const user_id = 1;

    it("회원탈퇴 실패", async () => {
      const updateResult = jest
        .spyOn(userRepository, "update")
        .mockResolvedValue({
          raw: [],
          affected: 0,
          generatedMaps: [],
        });

      await expect(
        async () => await service.userWithdraw(user_id)
      ).rejects.toThrowError(new Error("계정 탈퇴에 실패하였습니다."));

      expect(updateResult).toBeCalledTimes(1);
      expect(updateResult).toBeCalledWith(user_id, {
        kakao_id: -1,
      });
    });

    it("회원탈퇴 성공", async () => {
      const updateResult = jest
        .spyOn(userRepository, "update")
        .mockResolvedValue({
          raw: [],
          affected: 1,
          generatedMaps: [],
        });

      await service.userWithdraw(user_id);

      expect(updateResult).toBeCalledTimes(1);
      expect(updateResult).toBeCalledWith(user_id, {
        kakao_id: -1,
      });
    });
  });

  describe("userTypeCheck", () => {
    const findOneResultDummyData = {
      id: 1,
      kakao_id: 123,
      nickname: "TEST_NICKNAME",
      profile: "",
      explanation: "TODAY_LINK",
      user_type: true,
    } as any;

    const user_id = 1;

    it("기존/신규 유저인지 확인", async () => {
      const findResult = jest
        .spyOn(userRepository, "findOne")
        .mockResolvedValue(findOneResultDummyData);

      await service.userTypeCheck(user_id);

      expect(findResult).toBeCalledTimes(1);
      expect(findResult).toBeCalledWith({
        where: {
          id: user_id,
        },
      });
    });
  });

  describe("userUpdateInfo", () => {
    const id = 1;
    const nickname = "NICKNAME";
    const explanation = "오늘 날씨 좋다";

    it("유저 닉네임, 한 줄 소개 수정", async () => {
      const updateResult = jest
        .spyOn(userRepository, "update")
        .mockResolvedValue({
          raw: [],
          affected: 1,
          generatedMaps: [],
        });

      await service.userUpdateInfo(id, nickname, explanation);

      expect(updateResult).toBeCalledTimes(1);
      expect(updateResult).toBeCalledWith(id, {
        nickname: nickname,
        explanation: explanation,
      });
    });
  });

  describe("userUpdateProfile", () => {
    const id = 1;
    const key = "TEST_KEY";

    it("유저 프로필 이미지 변경", async () => {
      const updateResult = jest
        .spyOn(userRepository, "update")
        .mockResolvedValue({
          raw: [],
          affected: 1,
          generatedMaps: [],
        });

      await service.userUpdateProfile(id, key);

      expect(updateResult).toBeCalledTimes(1);
      expect(updateResult).toBeCalledWith(id, {
        profile: key,
      });
    });
  });

  describe("userUpdateStartReport", () => {
    const id = 1;
    const age = 24;
    const gender = "female" as CATEGORY;

    it("유저 리포트 제출", async () => {
      const updateResult = jest
        .spyOn(userRepository, "update")
        .mockResolvedValue({
          raw: [],
          affected: 1,
          generatedMaps: [],
        });

      await service.userUpdateStartReport(id, age, gender);

      expect(updateResult).toBeCalledTimes(1);
      expect(updateResult).toBeCalledWith(id, {
        gender: gender || undefined,
        age: age,
        user_type: true,
      });
    });
  });
});
