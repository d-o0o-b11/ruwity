import { Test, TestingModule } from '@nestjs/testing';
import { Repository, UpdateResult } from 'typeorm';
import { UserTapTextEntity } from '../entities/user_tap_text.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockRepository } from 'src/mock/mock.repository';
import { UpdateUserTapTextDto } from '../dto/update-user-tap-text.dto';
import { UserTapTextService } from '../service/user_tap_text.service';

describe('UserTapService', () => {
  let service: UserTapTextService;
  let userTapTextRepository: Repository<UserTapTextEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserTapTextService,
        {
          provide: getRepositoryToken(UserTapTextEntity),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    service = module.get<UserTapTextService>(UserTapTextService);
    userTapTextRepository = module.get<Repository<UserTapTextEntity>>(
      getRepositoryToken(UserTapTextEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(userTapTextRepository).toBeDefined();
  });

  describe('saveTapText', () => {
    const user_id = 12;

    const resDummyData = {
      id: 1,
      tap_type: 'text',
      title: '',
      context: '',
      folded_state: true,
      toggle_state: false,
      user_id: 12,
      created_at: new Date('2022-02-02'),
    } as UserTapTextEntity;
    it('tap text 저장하기', async () => {
      const saveResult = jest
        .spyOn(userTapTextRepository, 'save')
        .mockResolvedValue(resDummyData);

      await service.saveTapText(user_id);

      expect(saveResult).toBeCalledTimes(1);
      expect(saveResult).toBeCalledWith(
        new UserTapTextEntity({
          tap_type: 'text',
          context: '',
          user_id: user_id,
          folded_state: true,
        }),
      );
    });
  });

  describe('findTapText', () => {
    const user_id = 12;
    const resDummyData = [
      {
        id: 1,
        tap_type: 'text',
        title: 'title test',
        context: 'context test',
        folded_state: true,
        toggle_state: false,
        user_id: 12,
        created_at: new Date('2022-02-02'),
      },
      {
        id: 5,
        tap_type: 'text',
        title: 'title test22',
        context: 'context test22',
        folded_state: true,
        toggle_state: false,
        user_id: 12,
        created_at: new Date('2022-02-22'),
      },
    ] as UserTapTextEntity[];

    it('해당 유저의 모든 tap text 출력', async () => {
      const textResults = jest
        .spyOn(userTapTextRepository, 'find')
        .mockResolvedValue(resDummyData);

      await service.findTapText(user_id);

      expect(textResults).toBeCalledTimes(1);
      expect(textResults).toBeCalledWith({
        where: {
          user_id: user_id,
          delete_at: null,
          toggle_state: true,
        },
      });
    });
  });

  describe('deleteTapText', () => {
    const tap_id = 1;
    const resUpdateData = {
      raw: [],
      affected: 1,
      generatedMaps: [],
    } as UpdateResult;

    const ErrorResUpdateData = {
      raw: [],
      affected: 0,
      generatedMaps: [],
    } as UpdateResult;

    beforeEach(() =>
      jest.spyOn(Date, 'now').mockReturnValue(new Date('2023-08-16').getTime()),
    );

    it('tap text 삭제하기', async () => {
      const updateResult = jest
        .spyOn(userTapTextRepository, 'update')
        .mockResolvedValue(resUpdateData);

      await service.deleteTapText(tap_id);

      expect(updateResult).toBeCalledTimes(1);
      expect(updateResult).toBeCalledWith(tap_id, {
        delete_at: new Date(Date.now()),
      });
    });

    it('tap text 삭제 실패', async () => {
      const updateResult = jest
        .spyOn(userTapTextRepository, 'update')
        .mockResolvedValue(ErrorResUpdateData);

      await expect(
        async () => await service.deleteTapText(tap_id),
      ).rejects.toThrowError(new Error('tap 삭제 실패'));

      expect(updateResult).toBeCalledTimes(1);
      expect(updateResult).toBeCalledWith(tap_id, {
        delete_at: new Date(Date.now()),
      });
    });
  });

  describe('updateTapText', () => {
    const resUpdateData = {
      raw: [],
      affected: 1,
      generatedMaps: [],
    } as UpdateResult;

    const ErrorResUpdateData = {
      raw: [],
      affected: 0,
      generatedMaps: [],
    } as UpdateResult;

    const updateUserTapTextDto = {
      tap_id: 1,
      context: '수정 내용',
      toggle_state: false,
      folded_state: false,
    } as UpdateUserTapTextDto;

    beforeEach(() =>
      jest.spyOn(Date, 'now').mockReturnValue(new Date('2023-08-16').getTime()),
    );

    it('tap text 수정하기', async () => {
      const updateResult = jest
        .spyOn(userTapTextRepository, 'update')
        .mockResolvedValue(resUpdateData);

      await service.updateTapText(updateUserTapTextDto);

      expect(updateResult).toBeCalledTimes(1);
      expect(updateResult).toBeCalledWith(updateUserTapTextDto.tap_id, {
        context: updateUserTapTextDto?.context,
        toggle_state: updateUserTapTextDto?.toggle_state,
        toggle_update_time: new Date(Date.now()),
        folded_state: updateUserTapTextDto?.folded_state,
      });
    });

    it('tap text 수정 실패', async () => {
      const updateResult = jest
        .spyOn(userTapTextRepository, 'update')
        .mockResolvedValue(ErrorResUpdateData);

      await expect(
        async () => await service.updateTapText(updateUserTapTextDto),
      ).rejects.toThrowError(new Error('텍스트 내용 수정 실패'));

      expect(updateResult).toBeCalledTimes(1);
      expect(updateResult).toBeCalledWith(updateUserTapTextDto.tap_id, {
        context: updateUserTapTextDto?.context,
        toggle_state: updateUserTapTextDto?.toggle_state,
        toggle_update_time: new Date(Date.now()),
        folded_state: updateUserTapTextDto?.folded_state,
      });
    });
  });

  describe('findTapTextToOwner', () => {
    const user_id = 1;
    const resDummyData = [
      {
        id: 4,
        tap_type: 'text',
        title: 'test title',
        context: 'test context',
        folded_state: false,
        toggle_state: true,
        user_id: 1,
        created_at: new Date('2023-08-16'),
      },
      {
        id: 4,
        tap_type: 'text',
        title: 'test title22',
        context: 'test context22',
        folded_state: false,
        toggle_state: false,
        user_id: 1,
        created_at: new Date('2023-08-16'),
      },
    ] as UserTapTextEntity[];

    it('소유자의 모든 Tap 찾기', async () => {
      const textResults = jest
        .spyOn(userTapTextRepository, 'find')
        .mockResolvedValue(resDummyData);

      await service.findTapTextToOwner(user_id);

      expect(textResults).toBeCalledTimes(1);
      expect(textResults).toBeCalledWith({
        where: {
          user_id: user_id,
          delete_at: null,
        },
      });
    });
  });
});
