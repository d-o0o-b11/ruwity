import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  forwardRef,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../entities/user_user.entity";
import { Repository, UpdateResult } from "typeorm";
import { UserTokenEntity } from "../entities/user_token.entity";
import { CreateUserUserDto } from "../dto/create-user_user.dto";
import { plainToInstance } from "class-transformer";
import { JwtService } from "@nestjs/jwt";
import { UserActiveService } from "./user-active.service";
import { CATEGORY } from "../dto/save-user-report.dto";
import { UserProfile } from "../dto/user-profile.interface";
import { UserUserInterface } from "../interfaces/user_user.interface";

@Injectable()
export class UserUserService implements UserUserInterface {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(UserTokenEntity)
    private readonly userTokenRepository: Repository<UserTokenEntity>,

    private readonly jwtService: JwtService,

    @Inject(forwardRef(() => UserActiveService))
    private readonly userActiveService: UserActiveService
  ) {}

  async findOAuthUser(kakao_id: number): Promise<UserEntity> {
    const findOneResult = await this.userRepository.findOne({
      where: {
        kakao_id: kakao_id,
      },
    });

    return findOneResult;
  }

  async saveUser(dto: CreateUserUserDto): Promise<UserEntity> {
    const createUserDtoToEntity = plainToInstance(UserEntity, dto);

    const saveResult = await this.userRepository.save(createUserDtoToEntity);

    return saveResult;
  }

  async generateAccessToken(id: number): Promise<string> {
    const payload = {
      id: id,
    };
    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: "12h",
    });
  }

  async generateRefreshToken(id: number): Promise<string> {
    const payload = {
      id: id,
    };
    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: "30d",
    });
  }

  async defaultToken(user_id: number): Promise<void> {
    await this.userTokenRepository.save({
      user_id: user_id,
      access_token: undefined,
      refresh_token: undefined,
    });
  }

  async setCurrentRefreshToken(
    refreshToken: string,
    userId: number
  ): Promise<void> {
    await this.userTokenRepository.update(userId, {
      refresh_token: refreshToken,
    });
  }

  async setKaKaoCurrentAccessToken(
    accessToken: string,
    userId: number
  ): Promise<void> {
    await this.userTokenRepository.update(userId, {
      access_token: accessToken,
    });
  }

  async refreshTokenCheck(refreshTokenDto: string): Promise<{
    accessToken: string;
  }> {
    const decodedRefreshToken = await this.jwtService.verifyAsync(
      refreshTokenDto,
      { secret: process.env.JWT_REFRESH_SECRET }
    );

    // Check if user exists
    const userId = decodedRefreshToken.id;

    const userFindResult = await this.userTokenRepository.findOne({
      where: {
        user_id: userId,
      },
    });

    if (userFindResult.refresh_token !== refreshTokenDto)
      throw new UnauthorizedException("refreshToken이 만료되었습니다.");

    const accessToken = await this.generateAccessToken(userId);

    await this.setKaKaoCurrentAccessToken(accessToken, userId);

    return { accessToken };
  }

  async getUserInfo(id: number): Promise<UserProfile> {
    const findResult = await this.userRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!findResult) {
      throw new NotFoundException("존재하지 않는 유저 id 입니다.");
    }

    let img_key: string;
    if (findResult?.profile) {
      img_key = await this.userActiveService.getPreSignedUrl(
        findResult?.profile
      );
    }

    const findTodayLink = await this.userActiveService.findOneUserTodayLink(id);

    const findPageUrl = await this.userActiveService.findOneUserPage(id);

    return {
      profile: img_key || null,
      nickname: findResult?.nickname || null,
      explanation: findResult?.explanation || null,
      today_link: findTodayLink ? findTodayLink?.today_link : null,
      page_url: findPageUrl.page_url || null,
      url_id: findTodayLink?.url_id,
      today_link_created_at: findTodayLink ? findTodayLink?.created_at : null,
      user_email: findResult?.user_email || null,
    };
  }

  async setNullProfileImg(user_id: number): Promise<boolean> {
    const updateResult = await this.userRepository.update(user_id, {
      profile: "",
    });

    if (!updateResult.affected) throw new Error("이미지 삭제 실패");

    return true;
  }

  async updateUserName(
    id: number,
    name: string
  ): Promise<UserEntity | UpdateResult> {
    const findResult = await this.userRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!findResult) {
      return await this.userRepository.save(
        new UserEntity({
          id: id,
          nickname: name,
        })
      );
    } else {
      return await this.userRepository.update(id, {
        nickname: name,
      });
    }
  }

  async upsertUserExplanation(
    id: number,
    explanation: string
  ): Promise<UserEntity | UpdateResult> {
    const findResult = await this.userRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!findResult) {
      return await this.userRepository.save(
        new UserEntity({
          id: id,
          explanation: explanation,
        })
      );
    } else {
      return await this.userRepository.update(id, {
        explanation: explanation,
      });
    }
  }

  async logoutTokenNull(user_id: number): Promise<boolean> {
    const removeResult = await this.userTokenRepository.update(user_id, {
      access_token: "",
      refresh_token: "",
    });

    if (!removeResult.affected) {
      throw new Error("로그아웃에 실패하였습니다.");
    }

    return true;
  }

  async userWithdraw(user_id: number): Promise<boolean> {
    const updateResult = await this.userRepository.update(user_id, {
      kakao_id: -1,
    });

    if (!updateResult.affected) throw new Error("계정 탈퇴에 실패하였습니다.");

    return true;
  }

  async userTypeCheck(user_id: number): Promise<boolean> {
    const findResult = await this.userRepository.findOne({
      where: {
        id: user_id,
      },
    });

    //true면 기존회원
    if (findResult.user_type) return true;
    else {
      return false;
    }
  }

  async userUpdateInfo(
    id: number,
    nickname?: string,
    explanation?: string
  ): Promise<UpdateResult> {
    return await this.userRepository.update(id, {
      nickname: nickname,
      explanation: explanation,
    });
  }

  async userUpdateProfile(id: number, key: string): Promise<UpdateResult> {
    return await this.userRepository.update(id, {
      profile: key,
    });
  }

  async userUpdateStartReport(
    id: number,
    age: number,
    gender?: CATEGORY
  ): Promise<UpdateResult> {
    return await this.userRepository.update(id, {
      gender: gender || undefined,
      age: age,
      user_type: true,
    });
  }
}
