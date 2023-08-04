import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserTapLinkEntity } from "./entities/user_tap_link.entity";
import { UserTapTextEntity } from "./entities/user_tap_text.entity";
import { Repository } from "typeorm";
import { UpdateUserTapTextDto } from "./dto/update-user-tap-text.dto";
import { UpdateUserTapLinkDto } from "./dto/update-user-tap-link.dto";
import { s3 } from "src/config/config/s3.config";

@Injectable()
export class UserTapService {
  constructor(
    @InjectRepository(UserTapTextEntity)
    private readonly userTapTextRepository: Repository<UserTapTextEntity>,

    @InjectRepository(UserTapLinkEntity)
    private readonly userTapLinkRepository: Repository<UserTapLinkEntity>
  ) {}

  async saveTapText(id: number) {
    const saveResult = await this.userTapTextRepository.save(
      new UserTapTextEntity({
        tap_type: "text",
        context: "",
        user_id: id,
        folded_state: true,
      })
    );

    return saveResult;
  }

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

  async deleteTapText(tap_id: number) {
    const updateResult = await this.userTapTextRepository.update(tap_id, {
      delete_at: new Date(Date.now()),
    });

    if (!updateResult.affected) throw new Error("tap 삭제 실패");

    return true;
  }

  async saveTapLink(id: number) {
    const saveResult = await this.userTapLinkRepository.save(
      new UserTapLinkEntity({
        tap_type: "link",
        img: "",
        title: "",
        url: "",
        user_id: id,
      })
    );

    return saveResult;
  }

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

  async deleteTapLink(id: number) {
    const updateResult = await this.userTapLinkRepository.update(id, {
      delete_at: new Date(Date.now()),
    });

    if (!updateResult.affected) throw new Error("tap 삭제 실패");

    return true;
  }

  async findAllByUserIdOrderByCreatedAtDesc(user_id: number): Promise<any[]> {
    const textResults = await this.userTapTextRepository.find({
      where: {
        user_id: user_id,
        delete_at: null,
        toggle_state: true,
      },
    });

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

    const linkResults = await this.userTapLinkRepository.find({
      where: {
        user_id: user_id,
        delete_at: null,
        toggle_state: true,
      },
    });

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
      const { created_at, ...newItem } = item;
      return newItem;
    });

    return resultWithoutCreatedAt;
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
}
