import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserTapTextEntity } from '../entities/user_tap_text.entity';
import { Repository } from 'typeorm';
import { UpdateUserTapTextDto } from '../dto/update-user-tap-text.dto';

@Injectable()
export class UserTapTextService {
  constructor(
    @InjectRepository(UserTapTextEntity)
    private readonly userTapTextRepository: Repository<UserTapTextEntity>,
  ) {}

  async saveTapText(id: number) {
    const saveResult = await this.userTapTextRepository.save(
      new UserTapTextEntity({
        tap_type: 'text',
        context: '',
        user_id: id,
        folded_state: true,
      }),
    );

    return saveResult;
  }

  async findTapText(user_id: number) {
    const textResults = await this.userTapTextRepository.find({
      where: {
        user_id: user_id,
        delete_at: null,
        toggle_state: true,
      },
    });

    return textResults;
  }

  async deleteTapText(tap_id: number) {
    const updateResult = await this.userTapTextRepository.update(tap_id, {
      delete_at: new Date(Date.now()),
    });

    if (!updateResult.affected) throw new Error('tap 삭제 실패');

    return true;
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

    if (!updateResult.affected) throw new Error('텍스트 내용 수정 실패');

    return true;
  }

  async findTapTextToOwner(user_id: number) {
    const textResults = await this.userTapTextRepository.find({
      where: {
        user_id: user_id,
        delete_at: null,
      },
    });

    return textResults;
  }
}
