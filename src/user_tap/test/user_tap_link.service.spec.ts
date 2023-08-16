import { Test, TestingModule } from '@nestjs/testing';
import { Repository, UpdateResult } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockRepository } from 'src/mock/mock.repository';
import { UserTapLinkEntity } from '../entities/user_tap_link.entity';
import { UserTapLinkService } from '../service/user_tap_link.service';
import { UserTapTextService } from '../service/user_tap_text.service';
import { UpdateUserTapLinkDto } from '../dto/update-user-tap-link.dto';
import { UserTapTextEntity } from '../entities/user_tap_text.entity';

describe('UserTapService', () => {
  let service: UserTapLinkService;
  let userTapLinkRepository: Repository<UserTapLinkEntity>;
  let userTapTextService: UserTapTextService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserTapLinkService,
        {
          provide: getRepositoryToken(UserTapLinkEntity),
          useValue: mockRepository(),
        },
        {
          provide: UserTapTextService,
          useValue: {
            findTapTextToOwner: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserTapLinkService>(UserTapLinkService);
    userTapLinkRepository = module.get<Repository<UserTapLinkEntity>>(
      getRepositoryToken(UserTapLinkEntity),
    );
    userTapTextService = module.get<UserTapTextService>(UserTapTextService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(userTapLinkRepository).toBeDefined();
    expect(userTapTextService).toBeDefined();
  });

  describe('saveTapLink', () => {
    const user_id = 1;
    const resDummyData = {
      id: 2,
      tap_type: 'link',
      img: '',
      title: '',
      url: '',
      folded_state: true,
      toggle_state: true,
      user_id: 1,
      created_at: new Date('2023-08-16'),
    } as UserTapLinkEntity;

    it('tap link 저장하기', async () => {
      const saveResult = jest
        .spyOn(userTapLinkRepository, 'save')
        .mockResolvedValue(resDummyData);

      await service.saveTapLink(user_id);

      expect(saveResult).toBeCalledTimes(1);
      expect(saveResult).toBeCalledWith(
        new UserTapLinkEntity({
          tap_type: 'link',
          img: '',
          title: '',
          url: '',
          user_id: user_id,
        }),
      );
    });
  });

  describe('deleteImgTapLink', () => {
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

    const tap_id = 1;

    it('tap img 삭제하기', async () => {
      const updateResult = jest
        .spyOn(userTapLinkRepository, 'update')
        .mockResolvedValue(resUpdateData);

      await service.deleteImgTapLink(tap_id);

      expect(updateResult).toBeCalledTimes(1);
      expect(updateResult).toBeCalledWith(tap_id, {
        img: '',
      });
    });

    it('tap img 삭제 실패', async () => {
      const updateResult = jest
        .spyOn(userTapLinkRepository, 'update')
        .mockResolvedValue(ErrorResUpdateData);

      await expect(async () => {
        await service.deleteImgTapLink(tap_id);
      }).rejects.toThrowError(new Error('이미지 삭제 실패'));

      expect(updateResult).toBeCalledTimes(1);
      expect(updateResult).toBeCalledWith(tap_id, {
        img: '',
      });
    });
  });

  describe('findTapLink', () => {
    const user_id = 1;

    const resDummyData = [
      {
        id: 1,
        tap_type: 'link',
        img: '',
        title: 'link title test',
        url: 'https://naver.com',
        folded_state: true,
        toggle_state: true,
        user_id: 1,
        created_at: new Date('2023-08-16'),
        delete_at: null,
      },
      {
        id: 1,
        tap_type: 'link',
        img: '',
        title: 'link title test22',
        url: 'https://naver.com',
        folded_state: true,
        toggle_state: true,
        user_id: 1,
        created_at: new Date('2023-08-16'),
        delete_at: null,
      },
    ] as UserTapLinkEntity[];

    it('toggle 공개인 tap link 찾기', async () => {
      const linkResults = jest
        .spyOn(userTapLinkRepository, 'find')
        .mockResolvedValue(resDummyData);

      await service.findTapLink(user_id);

      expect(linkResults).toBeCalledTimes(1);
      expect(linkResults).toBeCalledWith({
        where: {
          user_id: user_id,
          delete_at: null,
          toggle_state: true,
        },
      });
    });
  });

  describe('deleteTapLink', () => {
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

    const tap_id = 1;

    beforeEach(() =>
      jest.spyOn(Date, 'now').mockReturnValue(new Date('2023-08-16').getTime()),
    );

    it('tap link 삭제하기', async () => {
      const updateResult = jest
        .spyOn(userTapLinkRepository, 'update')
        .mockResolvedValue(resUpdateData);

      await service.deleteTapLink(tap_id);

      expect(updateResult).toBeCalledTimes(1);
      expect(updateResult).toBeCalledWith(tap_id, {
        delete_at: new Date(Date.now()),
      });
    });

    it('tap link 삭제 실패', async () => {
      const updateResult = jest
        .spyOn(userTapLinkRepository, 'update')
        .mockResolvedValue(ErrorResUpdateData);

      await expect(
        async () => await service.deleteTapLink(tap_id),
      ).rejects.toThrowError(new Error('tap 삭제 실패'));

      expect(updateResult).toBeCalledTimes(1);
      expect(updateResult).toBeCalledWith(tap_id, {
        delete_at: new Date(Date.now()),
      });
    });
  });

  describe('updateTapLink', () => {
    const updateUserTapLinkDto = {
      tap_id: 1,
      title: '링크 제목 수정',
      url: 'https://naver.com',
    } as UpdateUserTapLinkDto;

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

    it('tap link update', async () => {
      const updateResult = jest
        .spyOn(userTapLinkRepository, 'update')
        .mockResolvedValue(resUpdateData);

      await service.updateTapLink(updateUserTapLinkDto);

      expect(updateResult).toBeCalledTimes(1);
      expect(updateResult).toBeCalledWith(updateUserTapLinkDto.tap_id, {
        title: updateUserTapLinkDto?.title,
        url: updateUserTapLinkDto?.url,
        img: updateUserTapLinkDto?.link_img,
        toggle_state: updateUserTapLinkDto?.toggle_state,
        toggle_update_time: undefined,
        folded_state: updateUserTapLinkDto?.folded_state,
      });
    });

    it('tap link update 실패', async () => {
      const updateResult = jest
        .spyOn(userTapLinkRepository, 'update')
        .mockResolvedValue(ErrorResUpdateData);

      await expect(
        async () => await service.updateTapLink(updateUserTapLinkDto),
      ).rejects.toThrowError(new Error('텍스트 내용 수정 실패'));

      expect(updateResult).toBeCalledTimes(1);
      expect(updateResult).toBeCalledWith(updateUserTapLinkDto.tap_id, {
        title: updateUserTapLinkDto?.title,
        url: updateUserTapLinkDto?.url,
        img: updateUserTapLinkDto?.link_img,
        toggle_state: updateUserTapLinkDto?.toggle_state,
        toggle_update_time: undefined,
        folded_state: updateUserTapLinkDto?.folded_state,
      });
    });
  });

  describe('findAllByUserIdOrderByCreatedAtDesc', () => {
    const tapTextDummyData = [
      {
        id: 1,
        tap_type: 'text',
        title: 'text title',
        context: 'text context',
        folded_state: false,
        toggle_state: false,
        user_id: 1,
        created_at: new Date('2023-08-12'),
      },
    ] as UserTapTextEntity[];

    const tapLinkDummyData = [
      {
        id: 1,
        tap_type: 'link',
        img: '',
        title: 'text title',
        url: 'TEST_URL',
        folded_state: false,
        toggle_state: false,
        user_id: 1,
        created_at: new Date('2023-08-13'),
      },
    ] as UserTapLinkEntity[];

    const user_id = 1;

    it('user의 모든 tap(text|link) 출력', async () => {
      const textResults = jest
        .spyOn(userTapTextService, 'findTapTextToOwner')
        .mockResolvedValue(tapTextDummyData);

      const linkResults = jest
        .spyOn(userTapLinkRepository, 'find')
        .mockResolvedValue(tapLinkDummyData);

      await service.findAllByUserIdOrderByCreatedAtDesc(user_id);

      expect(textResults).toBeCalledTimes(1);
      expect(textResults).toBeCalledWith(user_id);

      expect(linkResults).toBeCalledTimes(1);
      expect(linkResults).toBeCalledWith({
        where: {
          user_id: user_id,
          delete_at: null,
          toggle_state: true,
        },
      });
    });
  });
});
