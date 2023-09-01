import { UpdateResult } from "typeorm";
import { CreateUserUserDto } from "../dto/create-user_user.dto";
import { UserProfile } from "../dto/user-profile.interface";
import { UserEntity } from "../entities/user_user.entity";
import { CATEGORY } from "../dto/save-user-report.dto";

export const USER_USER_SERVICE_TOKEN = Symbol("UserKaKaoLoginInterface");

export interface UserUserInterface {
  findOAuthUser(kakao_id: number): Promise<UserEntity>;

  saveUser(dto: CreateUserUserDto): Promise<UserEntity>;

  generateAccessToken(id: number): Promise<string>;

  generateRefreshToken(id: number): Promise<string>;

  defaultToken(user_id: number): Promise<void>;

  setCurrentRefreshToken(refreshToken: string, userId: number): Promise<void>;

  setKaKaoCurrentAccessToken(
    accessToken: string,
    userId: number
  ): Promise<void>;

  refreshTokenCheck(refreshTokenDto: string): Promise<{
    accessToken: string;
  }>;

  getUserInfo(id: number): Promise<UserProfile>;

  setNullProfileImg(user_id: number): Promise<boolean>;

  updateUserName(id: number, name: string): Promise<UserEntity | UpdateResult>;

  upsertUserExplanation(
    id: number,
    explanation: string
  ): Promise<UserEntity | UpdateResult>;

  logoutTokenNull(user_id: number): Promise<boolean>;

  userWithdraw(user_id: number): Promise<boolean>;

  userTypeCheck(user_id: number): Promise<boolean>;

  userUpdateInfo(
    id: number,
    nickname?: string,
    explanation?: string
  ): Promise<UpdateResult>;

  userUpdateProfile(id: number, key: string): Promise<UpdateResult>;

  userUpdateStartReport(
    id: number,
    age: number,
    gender?: CATEGORY
  ): Promise<UpdateResult>;
}
