import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateUserInfoDto } from "../dto/create-user-info.dto";
import { UserPageEntity } from "../entities/user_page.entity";
import { UserReportDto } from "../dto/save-user-report.dto";
import { UserTodyLinkEntity } from "../entities/user_today_link.entity";
import { CreateUserUrlDto } from "src/user_url/dto/create-user_url.dto";
import { s3 } from "src/config/config/s3.config";
import { UpdateUserTapLinkDto } from "src/user_tap/dto/update-user-tap-link.dto";
import { UpdateUserTapTextDto } from "src/user_tap/dto/update-user-tap-text.dto";
import { v4 as uuidv4 } from "uuid";
import * as sharp from "sharp";
import { UserTapTextService } from "src/user_tap/service/user_tap_text.service";
import { UserUrlService } from "src/user_url/user_url.service";
import { UserTapLinkService } from "src/user_tap/service/user_tap_link.service";
import {
  USER_USER_SERVICE_TOKEN,
  UserUserInterface,
} from "../interfaces/user_user.interface";

@Injectable()
export class UserActiveService {
  constructor(
    @InjectRepository(UserPageEntity)
    private readonly userPageEntityRepository: Repository<UserPageEntity>,

    @InjectRepository(UserTodyLinkEntity)
    private readonly userTodayLinkEntityRepository: Repository<UserTodyLinkEntity>,

    private readonly userTapTextService: UserTapTextService,

    private readonly userTapLinkService: UserTapLinkService,

    private readonly userUrlService: UserUrlService,

    @Inject(forwardRef(() => USER_USER_SERVICE_TOKEN))
    private readonly userUserInterface: UserUserInterface // private readonly userUserInterface: userUserInterface
  ) {}

  async saveUserInfo(
    id: number,
    dto: CreateUserInfoDto,
    profile?: Express.Multer.File[],
    link_img?: Express.Multer.File[]
  ) {
    if (dto.nickname || dto.explanation) {
      await this.userUserInterface.userUpdateInfo(
        id,
        dto?.nickname,
        dto?.explanation
      );
    }

    if (dto.actions) {
      if (typeof dto.actions === "string") {
        dto.actions = JSON.parse(dto.actions);
      }

      for (let i = 0; i < dto.actions.length; i++) {
        if (dto.actions[i].method == "delete") {
          if (dto.actions[i].column == "link") {
            if (dto.actions[i].link_img_delete) {
              await this.userTapLinkService.deleteImgTapLink(
                dto.actions[i].tap_id
              );
            } else {
              await this.userTapLinkService.deleteTapLink(
                dto.actions[i].tap_id
              );
            }
          } else if (dto.actions[i].column == "text") {
            await this.userTapTextService.deleteTapText(dto.actions[i].tap_id);
          } else if (dto.actions[i].column == "profile") {
            await this.userUserInterface.setNullProfileImg(id);
          }
        } else {
          if (dto.actions[i].column == "profile") {
            const img_name = await this.changeImgUUID(profile[0].originalname);

            const folderName = "profile";
            const key = `${folderName}/${id}/${img_name}`;

            await this.uploadFileDB(key, profile[0], 100);

            await this.userUserInterface.userUpdateProfile(id, key);
          } else if (dto.actions[i].column == "link") {
            let key: any;
            if (link_img[i]) {
              const img_name = await this.changeImgUUID(
                link_img[i].originalname
              );

              const folderName = "link";
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

              await this.userTapLinkService.updateTapLink(updateDto);
            } else {
              const updateDto = {
                tap_id: dto.actions[i].tap_id,
                title: dto.actions[i].title,
                url: dto.actions[i].context,
                toggle_state: dto.actions[i].toggle_state,
                folded_state: dto.actions[i].folded_state,
                link_img: key,
              } as UpdateUserTapLinkDto;

              await this.userTapLinkService.updateTapLink(updateDto);
            }
          } else if (dto.actions[i].column == "text") {
            const updateDto = {
              tap_id: dto.actions[i]?.tap_id,
              title: dto.actions[i]?.title,
              context: dto.actions[i]?.context,
              toggle_state: dto.actions[i]?.toggle_state,
              folded_state: dto.actions[i]?.folded_state,
            } as UpdateUserTapTextDto;

            await this.userTapTextService.updateTapText(updateDto);
          }
        }
      }
    }

    const findResult = await this.userTodayLinkEntityRepository.findOne({
      where: {
        user_id: id,
      },
    });

    if (dto.today_link) {
      const saveResult = await this.userUrlService.saveUserUrl(
        id,
        new CreateUserUrlDto({
          img: dto?.img,
          title: dto.title,
          url: dto.today_link,
        })
      );

      if (!findResult) {
        await this.userTodayLinkEntityRepository.save(
          new UserTodyLinkEntity({
            user_id: id,
            today_link: dto?.today_link,
            created_at: new Date(Date.now()),
            url_id: saveResult.id,
          })
        );
      } else {
        await this.userTodayLinkEntityRepository.update(id, {
          today_link: dto?.today_link,
          created_at: new Date(Date.now()),
          url_id: saveResult.id,
        });
      }
    }

    return true;
  }

  async saveUserInfoNoFIle(id: number, dto: CreateUserInfoDto) {
    if (dto.nickname || dto.explanation) {
      await this.userUserInterface.userUpdateInfo(
        id,
        dto?.nickname,
        dto?.explanation
      );
    }

    if (dto.actions) {
      if (typeof dto.actions === "string") {
        dto.actions = JSON.parse(dto.actions);
      }

      for (let i = 0; i < dto.actions.length; i++) {
        if (dto.actions[i].method == "delete") {
          if (dto.actions[i].column == "link") {
            if (dto.actions[i].link_img_delete) {
              await this.userTapLinkService.deleteImgTapLink(
                dto.actions[i].tap_id
              );
            } else {
              await this.userTapLinkService.deleteTapLink(
                dto.actions[i].tap_id
              );
            }
          } else if (dto.actions[i].column == "text") {
            await this.userTapTextService.deleteTapText(dto.actions[i].tap_id);
          } else if (dto.actions[i].column == "profile") {
            await this.userUserInterface.setNullProfileImg(id);
          }
        } else {
          if (dto.actions[i].column == "profile") {
            await this.userUserInterface.setNullProfileImg(id);
          } else if (dto.actions[i].column == "link") {
            const updateDto = {
              tap_id: dto.actions[i].tap_id,
              title: dto.actions[i].title,
              url: dto.actions[i].context,
              toggle_state: dto.actions[i].toggle_state,
              folded_state: dto.actions[i].folded_state,
            } as UpdateUserTapLinkDto;

            await this.userTapLinkService.updateTapLink(updateDto);
          } else if (dto.actions[i].column == "text") {
            const updateDto = {
              tap_id: dto.actions[i]?.tap_id,
              context: dto.actions[i]?.context,
              toggle_state: dto.actions[i]?.toggle_state,
              folded_state: dto.actions[i]?.folded_state,
            } as UpdateUserTapTextDto;

            await this.userTapTextService.updateTapText(updateDto);
          }
        }
      }
    }

    const findResult = await this.userTodayLinkEntityRepository.findOne({
      where: {
        user_id: id,
      },
    });

    if (dto.today_link) {
      const saveResult = await this.userUrlService.saveUserUrl(
        id,
        new CreateUserUrlDto({
          img: dto?.img,
          title: dto.title,
          url: dto.today_link,
        })
      );

      if (!findResult) {
        await this.userTodayLinkEntityRepository.save(
          new UserTodyLinkEntity({
            user_id: id,
            today_link: dto?.today_link,
            created_at: new Date(Date.now()),
            url_id: saveResult.id,
          })
        );
      } else {
        await this.userTodayLinkEntityRepository.update(id, {
          today_link: dto?.today_link,
          created_at: new Date(Date.now()),
          url_id: saveResult.id,
        });
      }
    }

    return true;
  }

  async changeImgUUID(originalname: string) {
    const ext = originalname.split(".").pop(); // 파일 확장자 추출
    const filename = uuidv4(); // UUID 생성
    return `${filename}.${ext}`; // UUID로 파일명 변경
  }

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

    const updateResult = await this.userUserInterface.userUpdateStartReport(
      id,
      dto?.age,
      dto?.gender
    );

    if (!updateResult.affected) {
      throw new Error("성별, 나이 저장 실패");
    }

    return true;
  }

  async updateTodayLink(user_id: number, url_id: number) {
    const findResult = await this.userUrlService.findOneUserUrl(url_id);

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

    let profile_img;
    if (findOneResult.user?.profile)
      profile_img = await this.getPreSignedUrl(findOneResult.user?.profile);

    const tapList = await this.findAllByUserIdOrderByCreatedAtDesc(
      findOneResult.user_id
    );

    return {
      user_id: findOneResult?.user_id || undefined,
      page_url: findOneResult?.page_url || undefined,
      user_nickname: findOneResult?.user?.nickname || undefined,
      profile_img: profile_img || undefined,
      explanation: findOneResult?.user?.explanation || undefined,
      today_link_id: findOneResult?.user?.today_link?.url_id || null,
      today_link: findOneResult?.user?.today_link?.today_link || null,
      created_at: findOneResult?.user?.today_link?.created_at || null,
      tap: tapList,
    };
  }

  async findAllByUserIdOrderByCreatedAtDesc(user_id: number): Promise<any[]> {
    const textResults = await this.userTapTextService.findTapText(user_id);

    const textRe = [];
    for (let i = 0; i < textResults.length; i++) {
      textRe.push({
        tap_id: textResults[i].id,
        column: textResults[i].tap_type,
        context: textResults[i].context,
        folded_state: textResults[i].folded_state,
        toggle_state: textResults[i].toggle_state,
        created_at: textResults[i].created_at,
      });
    }

    const linkResults = await this.userTapLinkService.findTapLink(user_id);

    const linkRe = [];
    for (let i = 0; i < linkResults.length; i++) {
      const img_url = [];
      if (linkResults[i].img) {
        img_url[i] = await this.getPreSignedUrl(linkResults[i].img);
      }

      linkRe.push({
        tap_id: linkResults[i].id,
        column: linkResults[i].tap_type,
        title: linkResults[i].title,
        url: linkResults[i].url,
        img: img_url[i] || null,
        folded_state: linkResults[i].folded_state,
        toggle_state: linkResults[i].toggle_state,
        created_at: linkResults[i].created_at,
      });
    }

    for (let i = 0; i < linkResults.length; i++) {
      if (linkResults[i].img) {
        linkResults[i].img = await this.getPreSignedUrl(linkResults[i].img);
      }
    }

    const mergedResults = [...textRe, ...linkRe];
    mergedResults.sort(
      (a, b) => b.created_at.getTime() - a.created_at.getTime()
    );

    const resultWithoutCreatedAt = mergedResults.map((item) => {
      // result 배열의 각 요소에서 created_at 속성을 빼고 새로운 객체를 생성하여 반환
      const { created_at, ...newItem } = item;
      return newItem;
    });

    return resultWithoutCreatedAt;
  }

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

      return response.Location;
    } catch (error) {
      throw new Error("Failed to upload file to S3.");
    }
  }

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

  async getPreSignedUrl(key: string): Promise<string> {
    const imageParam = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Expires: 3600,
    };

    const preSignedUrl = await s3.getSignedUrlPromise("getObject", imageParam);

    return preSignedUrl;
  }

  async findOneUserTodayLink(user_id: number) {
    return await this.userTodayLinkEntityRepository.findOne({
      where: {
        user_id: user_id,
      },
      relations: {
        user_url: true,
      },
    });
  }

  async findOneUserPage(user_id: number) {
    return await this.userPageEntityRepository.findOne({
      where: {
        user_id: user_id,
      },
    });
  }
}
