import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "./entities/user_user.entity";
import { Repository, UpdateResult } from "typeorm";
import { UserTokenEntity } from "./entities/user_token.entity";
import { CreateUserUserDto } from "./dto/create-user_user.dto";
import { plainToInstance } from "class-transformer";
import { JwtService } from "@nestjs/jwt";
import { CreateUserInfoDto } from "./dto/create-user-info.dto";
import { UserPageEntity } from "./entities/user_page.entity";
import { UserReportDto } from "./dto/save-user-report.dto";
import { UserTodyLinkEntity } from "./entities/user_today_link.entity";
import { CreateUserUrlDto } from "src/user_user/dto/create-user_url.dto";
import { UserUrlEntity } from "src/user_url/entities/user_url.entity";
import { s3 } from "src/config/config/s3.config";
import { UserTapTextEntity } from "src/user_tap/entities/user_tap_text.entity";
import { UserTapLinkEntity } from "src/user_tap/entities/user_tap_link.entity";
import { UpdateUserTapLinkDto } from "src/user_tap/dto/update-user-tap-link.dto";
import { UpdateUserTapTextDto } from "src/user_tap/dto/update-user-tap-text.dto";
import { v4 as uuidv4 } from "uuid";
import * as sharp from "sharp";
import { ActionTapDto } from "./dto/tap-delete.dto";

@Injectable()
export class UserUserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(UserTokenEntity)
    private readonly userTokenRepository: Repository<UserTokenEntity>,

    private readonly jwtService: JwtService,

    @InjectRepository(UserPageEntity)
    private readonly userPageEntityRepository: Repository<UserPageEntity>,

    @InjectRepository(UserTodyLinkEntity)
    private readonly userTodayLinkEntityRepository: Repository<UserTodyLinkEntity>,

    @InjectRepository(UserUrlEntity)
    private readonly userUrlRepository: Repository<UserUrlEntity>,

    @InjectRepository(UserTapTextEntity)
    private readonly userTapTextRepository: Repository<UserTapTextEntity>,

    @InjectRepository(UserTapLinkEntity)
    private readonly userTapLinkRepository: Repository<UserTapLinkEntity>
  ) {}

  async findOAuthUser(kakao_id: number) {
    const findOneResult = await this.userRepository.findOne({
      where: {
        kakao_id: kakao_id,
      },
    });

    return findOneResult;
  }

  async saveUser(dto: CreateUserUserDto) {
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

  //7 days 604800
  async generateRefreshToken(id: number): Promise<string> {
    const payload = {
      id: id,
    };
    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: "30d",
    });
  }

  async defaultToken(user_id: number) {
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

  //finish---------
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

  //finish---------
  async getUserInfo(id: number) {
    const findResult = await this.userRepository.findOne({
      where: {
        id: id,
      },
    });

    let img_key: string;
    if (findResult?.profile) {
      img_key = await this.getPreSignedUrl(findResult?.profile);
    }

    if (!findResult) {
      throw new NotFoundException("존재하지 않는 유저 id 입니다.");
    }

    const findTodayLink = await this.userTodayLinkEntityRepository.findOne({
      where: {
        user_id: id,
      },
      relations: {
        user_url: true,
      },
    });

    // console.log('findTodayLink', findTodayLink);

    // if (!findTodayLink?.user_url && findTodayLink !== null) {
    //   findTodayLink.today_link = null;
    // }

    const findPageUrl = await this.userPageEntityRepository.findOne({
      where: {
        user_id: id,
      },
    });

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

  //모든 url 기록되는 곳
  async saveUserUrl(id: number, dto: CreateUserUrlDto) {
    const saveResult = await this.userUrlRepository.save(
      new UserUrlEntity({
        img: dto.img,
        title: dto.title,
        url: dto.url,
        view: 0,
        user_id: id,
      })
    );

    return saveResult;
  }

  //프로필,닉네임, 한줄 설명, 오늘의 링크 없으면 save , 있으면 update

  async saveUserInfo(
    id: number,
    dto: CreateUserInfoDto,
    profile?: Express.Multer.File[],
    link_img?: Express.Multer.File[]
  ) {
    //셋다 없다면 update 안일어남
    if (dto.nickname || dto.explanation) {
      await this.userRepository.update(id, {
        nickname: dto?.nickname,
        explanation: dto?.explanation,
      });
    }

    console.log("profile", profile);

    // console.log('dto', dto);
    if (dto.actions) {
      if (typeof dto.actions === "string") {
        dto.actions = JSON.parse(dto.actions);
      }

      for (let i = 0; i < dto.actions.length; i++) {
        console.log("dto.actions", dto.actions[i], dto.actions[i].column);
        //탭 (text,link)삭제
        if (dto.actions[i].method == "delete") {
          if (dto.actions[i].column == "link") {
            //===============탭 링크 이미지 삭제 넣어야할듯
            if (dto.actions[i].link_img_delete) {
              //링크 이미지 삭제
              await this.setNullLinkImg(dto.actions[i].tap_id);
            } else {
              //링크 탭 삭제
              await this.deleteTapLink(dto.actions[i].tap_id);
            }
          } else if (dto.actions[i].column == "text") {
            //테스트 탭 삭제
            await this.deleteTapText(dto.actions[i].tap_id);
          } else if (dto.actions[i].column == "profile") {
            await this.setNullProfileImg(id);
            //======================s3에 이미지 삭제하는 코드 추가 또는 누적시킬거면 안써도됨
          }
        } else {
          //update 부분 <<프로필은 수정 완료,삭제까지
          if (dto.actions[i].column == "profile") {
            const img_name = await this.changeImgUUID(profile[0].originalname);

            const folderName = "profile"; // 원하는 폴더명
            const key = `${folderName}/${id}/${img_name}`;

            await this.uploadFileDB(key, profile[0], 100);

            await this.userRepository.update(id, {
              profile: key,
            });

            //프로필 사진 변경
          } //text,link 수정이랑 toggle 수정하면됨
          else if (dto.actions[i].column == "link") {
            console.log("들어옴link");
            let key: any;
            if (link_img[i]) {
              const img_name = await this.changeImgUUID(
                link_img[i].originalname
              );

              const folderName = "link"; // 원하는 폴더명
              key = `${folderName}/${id}/${dto.actions[i].tap_id}/${img_name}`;

              await this.uploadFileDB(key, link_img[i], 50);

              const updateDto = {
                tap_id: dto.actions[i].tap_id,
                title: dto.actions[i].title,
                url: dto.actions[i].context,
                img: key,
                toggle_state: dto.actions[i].toggle_state,
                folded_state: dto.actions[i].folded_state,
                link_img: key,
              } as UpdateUserTapLinkDto;
              await this.updateTapLink(updateDto);
            } else {
              const updateDto = {
                tap_id: dto.actions[i].tap_id,
                title: dto.actions[i].title,
                url: dto.actions[i].context,
                toggle_state: dto.actions[i].toggle_state,
                folded_state: dto.actions[i].folded_state,
                link_img: key,
              } as UpdateUserTapLinkDto;
              await this.updateTapLink(updateDto);
            }
          } else if (dto.actions[i].column == "text") {
            const updateDto = {
              tap_id: dto.actions[i]?.tap_id,
              title: dto.actions[i]?.title,
              context: dto.actions[i]?.context,
              toggle_state: dto.actions[i]?.toggle_state,
              folded_state: dto.actions[i]?.folded_state,
            } as UpdateUserTapTextDto;

            await this.updateTapText(updateDto);
          }
        }
      }
    }

    const findResult = await this.userTodayLinkEntityRepository.findOne({
      where: {
        user_id: id,
      },
    });

    //today_link 없으면 안일어남
    if (dto.today_link) {
      const saveResult = await this.saveUserUrl(
        id,
        new CreateUserUrlDto({
          img: dto?.img,
          title: dto.title,
          url: dto.today_link,
        })
      );
      if (!findResult) {
        //처음 등록
        await this.userTodayLinkEntityRepository.save(
          new UserTodyLinkEntity({
            user_id: id,
            today_link: dto?.today_link,
            created_at: new Date(Date.now()),
            url_id: saveResult.id,
          })
        );
      } else {
        //업데이트
        await this.userTodayLinkEntityRepository.update(id, {
          today_link: dto?.today_link,
          created_at: new Date(Date.now()),
          url_id: saveResult.id,
        });

        // await this.saveUserUrl(
        //   id,
        //   new CreateUserUrlDto({
        //     img: dto?.img,
        //     title: dto.title,
        //     url: dto.today_link,
        //   }),
        // );
      }
    }

    return true;
  }

  async saveUserInfoNoFIle(id: number, dto: CreateUserInfoDto) {
    //셋다 없다면 update 안일어남
    if (dto.nickname || dto.explanation) {
      await this.userRepository.update(id, {
        nickname: dto?.nickname,
        explanation: dto?.explanation,
      });
    }

    // console.log('dto', dto);
    if (dto.actions) {
      if (typeof dto.actions === "string") {
        dto.actions = JSON.parse(dto.actions);
      }

      for (let i = 0; i < dto.actions.length; i++) {
        //탭 (text,link)삭제
        if (dto.actions[i].method == "delete") {
          if (dto.actions[i].column == "link") {
            //===============탭 링크 이미지 삭제 넣어야할듯
            if (dto.actions[i].link_img_delete) {
              //링크 이미지 삭제
              await this.setNullLinkImg(dto.actions[i].tap_id);
            } else {
              //링크 탭 삭제
              await this.deleteTapLink(dto.actions[i].tap_id);
            }
          } else if (dto.actions[i].column == "text") {
            //테스트 탭 삭제
            await this.deleteTapText(dto.actions[i].tap_id);
          } else if (dto.actions[i].column == "profile") {
            await this.setNullProfileImg(id);
            //======================s3에 이미지 삭제하는 코드 추가 또는 누적시킬거면 안써도됨
          }
        } else {
          //update 부분 <<프로필은 수정 완료,삭제까지
          if (dto.actions[i].column == "profile") {
            await this.setNullProfileImg(id);

            //프로필 사진 변경
          } //text,link 수정이랑 toggle 수정하면됨
          else if (dto.actions[i].column == "link") {
            const updateDto = {
              tap_id: dto.actions[i].tap_id,
              title: dto.actions[i].title,
              url: dto.actions[i].context,
              toggle_state: dto.actions[i].toggle_state,
              folded_state: dto.actions[i].folded_state,
            } as UpdateUserTapLinkDto;

            await this.updateTapLink(updateDto);
          } else if (dto.actions[i].column == "text") {
            const updateDto = {
              tap_id: dto.actions[i]?.tap_id,
              context: dto.actions[i]?.context,
              toggle_state: dto.actions[i]?.toggle_state,
              folded_state: dto.actions[i]?.folded_state,
            } as UpdateUserTapTextDto;

            await this.updateTapText(updateDto);
          }
        }
      }
    }

    const findResult = await this.userTodayLinkEntityRepository.findOne({
      where: {
        user_id: id,
      },
    });

    //today_link 없으면 안일어남
    if (dto.today_link) {
      const saveResult = await this.saveUserUrl(
        id,
        new CreateUserUrlDto({
          img: dto?.img,
          title: dto.title,
          url: dto.today_link,
        })
      );
      if (!findResult) {
        //처음 등록
        await this.userTodayLinkEntityRepository.save(
          new UserTodyLinkEntity({
            user_id: id,
            today_link: dto?.today_link,
            created_at: new Date(Date.now()),
            url_id: saveResult.id,
          })
        );
      } else {
        //업데이트
        await this.userTodayLinkEntityRepository.update(id, {
          today_link: dto?.today_link,
          created_at: new Date(Date.now()),
          url_id: saveResult.id,
        });

        // await this.saveUserUrl(
        //   id,
        //   new CreateUserUrlDto({
        //     img: dto?.img,
        //     title: dto.title,
        //     url: dto.today_link,
        //   }),
        // );
      }
    }

    return true;
  }

  //uuid로 변경
  async changeImgUUID(originalname: string) {
    const ext = originalname.split(".").pop(); // 파일 확장자 추출
    const filename = uuidv4(); // UUID 생성
    return `${filename}.${ext}`; // UUID로 파일명 변경
  }

  //프사 빈 객체로 변경
  async setNullProfileImg(user_id: number) {
    const updateResult = await this.userRepository.update(user_id, {
      profile: "",
    });

    if (!updateResult.affected) throw new Error("이미지 삭제 실패");

    return true;
  }

  //링크 빈 객체로 변경
  async setNullLinkImg(tap_id: number) {
    const updateResult = await this.userTapLinkRepository.update(tap_id, {
      img: "",
    });
    console.log(updateResult);

    if (!updateResult.affected) throw new Error("이미지 삭제 실패");

    return true;
  }

  //닉네임 없으면 save, 있으면 update
  async updateUserName(id: number, name: string) {
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

  //한줄표현 없으면 save, 있으면 update
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

  //finish---------
  async checkPage(url: string) {
    if (url.length > 12) {
      throw new Error("url은 최대 12자입니다.");
    }

    const findResult = await this.userPageEntityRepository.findOne({
      where: {
        page_url: url,
      },
    });

    if (findResult) {
      throw new Error("이미 사용중인 URL입니다.");
    } else {
      return true;
    }
  }

  //finish---------
  async saveGenderAge(id: number, dto: UserReportDto) {
    if (dto.age.toString().length > 2)
      throw new Error("나이는 2자리 이하만 가능합니다.");

    const saveReult = await this.userPageEntityRepository.save(
      new UserPageEntity({
        user_id: id,
        page_url: dto.page_url,
      })
    );

    if (!saveReult) {
      throw new Error("page url 저장 실패");
    }

    const updateResult = await this.userRepository.update(id, {
      gender: dto?.gender || undefined,
      age: dto.age,
      user_type: true,
    });

    if (!updateResult.affected) {
      throw new Error("성별, 나이 저장 실패");
    }

    return true;
  }

  //finish---------
  async updateTodayLink(user_id: number, url_id: number) {
    const findResult = await this.userUrlRepository.findOne({
      where: {
        id: url_id,
      },
    });

    if (!findResult)
      throw new NotFoundException("존재하지 않는 url_id 입니다.");

    const updateResult = await this.userTodayLinkEntityRepository.update(
      user_id,
      {
        today_link: findResult.url,
      }
    );

    return updateResult;
  }

  async findUserPageToUser(page_url: string) {
    const findOneResult = await this.userPageEntityRepository.findOne({
      where: {
        page_url: page_url,
      },
      relations: {
        user: {
          today_link: {
            user_url: true,
          },
        },
      },
    });

    if (!findOneResult) throw new NotFoundException("존재하지 않는 url입니다.");

    const findUserLink = await this.userUrlRepository.find({
      where: {
        user_id: findOneResult.user_id,
      },
      order: {
        created_at: "DESC",
      },
    });

    // console.log('findUserLink', findUserLink);

    let profile_img;
    if (findOneResult.user?.profile)
      profile_img = await this.getPreSignedUrl(findOneResult.user?.profile);

    return {
      user_id: findOneResult?.user_id || undefined,
      page_url: findOneResult?.page_url || undefined,
      user_nickname: findOneResult?.user?.nickname || undefined,
      profile_img: profile_img || undefined,
      explanation: findOneResult?.user?.explanation || undefined,
      today_link_id: findOneResult?.user?.today_link?.url_id || null,
      today_link: findOneResult?.user?.today_link?.today_link || null,
      created_at: findOneResult?.user?.today_link?.created_at || null,
    };

    // return findOneResult;
  }

  async logoutTokenNull(user_id: number) {
    const removeResult = await this.userTokenRepository.update(user_id, {
      access_token: "",
      refresh_token: "",
    });
    //1이 나오면 성공한거
    if (!removeResult.affected) {
      throw new Error("로그아웃에 실패하였습니다.");
    }

    return true;
  }

  async userWithdraw(user_id: number) {
    const updateResult = await this.userRepository.update(user_id, {
      kakao_id: -1,
    });

    if (!updateResult.affected) throw new Error("계정 탈퇴에 실패하였습니다.");

    return true;
  }

  async userTypeCheck(user_id: number) {
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

  //---------------------------
  //이미지 업로드
  async uploadFileDB(
    key: string,
    file: Express.Multer.File,
    img_size?: number
  ) {
    const resizedImageBuffer = await sharp(file.buffer)
      .resize(img_size, img_size)
      .toBuffer();

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME, // 버킷 이름
      Key: key, // 파일의 S3 Key (폴더 경로 포함)
      Body: resizedImageBuffer,
    };

    try {
      const response = await s3.upload(params).promise(); // S3에 파일 업로드 요청

      return response.Location; // 업로드된 파일의 URL 반환
    } catch (error) {
      // 업로드 실패시 예외 처리
      throw new Error("Failed to upload file to S3.");
    }
  }

  //이미지 삭제
  async deleteImage(key: string): Promise<void> {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key, // The object key (e.g., 'images/profile.png')
    };

    try {
      await s3.deleteObject(params).promise();
    } catch (error) {
      throw error;
    }
  }
  //----------------------------------
  //그냥 이미지 잘 들어가나 확인 코드
  async uploadFile(key: string, body: Buffer): Promise<string> {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME, // 버킷 이름
      Key: key, // 파일의 S3 Key (폴더 경로 포함)
      Body: body, // 파일의 바이너리 데이터
      // ACL: process.env.AWS_BUCKET_ACL,
    };

    try {
      const response = await s3.upload(params).promise(); // S3에 파일 업로드 요청

      return response.Location; // 업로드된 파일의 URL 반환
    } catch (error) {
      // 업로드 실패시 예외 처리
      throw new Error("Failed to upload file to S3.");
    }
  }

  //그냥 이미지 잘 나오나 확인 코드
  async getPreSignedUrl(key: string): Promise<string> {
    const imageParam = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Expires: 3600,
    };

    const preSignedUrl = await s3.getSignedUrlPromise("getObject", imageParam);

    return preSignedUrl;
  }

  //링크 삭제 => user_tap으로 이동
  async deleteTapLink(id: number) {
    const updateResult = await this.userTapLinkRepository.update(id, {
      delete_at: new Date(Date.now()),
    });

    if (!updateResult.affected) throw new Error("tap 삭제 실패");

    return true;
  }

  //테스트 삭제 => user_tap으로 이동
  async deleteTapText(tap_id: number) {
    const updateResult = await this.userTapTextRepository.update(tap_id, {
      delete_at: new Date(Date.now()),
    });

    if (!updateResult.affected) throw new Error("tap 삭제 실패");

    return true;
  }

  //link 수정 => user_tap으로 이동
  async updateTapLink(dto: UpdateUserTapLinkDto) {
    let time: any;
    if (dto.toggle_state !== undefined && dto.toggle_state !== null) {
      time = new Date(Date.now());
    } else {
      time = undefined;
    }

    const updateResult = await this.userTapLinkRepository.update(dto.tap_id, {
      title: dto?.title,
      url: dto?.url,
      img: dto?.link_img,
      toggle_state: dto?.toggle_state,
      toggle_update_time: time,
      folded_state: dto?.folded_state,
    });

    if (!updateResult.affected) throw new Error("텍스트 내용 수정 실패");

    return true;
  }

  //text 수정 =>user_tap service로 이동
  async updateTapText(dto: UpdateUserTapTextDto) {
    let time: any;
    if (dto.toggle_state !== undefined && dto.toggle_state !== null) {
      time = new Date(Date.now());
    } else {
      time = undefined;
    }

    const updateResult = await this.userTapTextRepository.update(dto.tap_id, {
      context: dto?.context,
      toggle_state: dto?.toggle_state,
      toggle_update_time: time,
      folded_state: dto?.folded_state,
    });

    if (!updateResult.affected) throw new Error("텍스트 내용 수정 실패");

    return true;
  }
}
