import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserTapLinkEntity } from "./entities/user_tap_link.entity";
import { Repository } from "typeorm";
import { UpdateUserTapLinkDto } from "./dto/update-user-tap-link.dto";

@Injectable()
export class UserTapLinkService {
  constructor(
    @InjectRepository(UserTapLinkEntity)
    private readonly userTapLinkRepository: Repository<UserTapLinkEntity>
  ) {}

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

  async setNullLinkImg(tap_id: number) {
    const updateResult = await this.userTapLinkRepository.update(tap_id, {
      img: "",
    });

    if (!updateResult.affected) throw new Error("이미지 삭제 실패");

    return true;
  }

  async findTapLink(user_id: number) {
    const linkResults = await this.userTapLinkRepository.find({
      where: {
        user_id: user_id,
        delete_at: null,
        toggle_state: true,
      },
    });

    return linkResults;
  }
}
