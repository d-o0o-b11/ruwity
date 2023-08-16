import { Test, TestingModule } from '@nestjs/testing';
import { UserUrlService } from './user_url.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserUrlEntity } from './entities/user_url.entity';
import { Repository, UpdateResult } from 'typeorm';
import { mockRepository } from 'src/mock/mock.repository';
import { S3 } from 'aws-sdk';
import { CreateUserUrlDto } from './dto/create-user_url.dto';
import { NotFoundException } from '@nestjs/common';

jest.mock('aws-sdk', () => {
  const mockedS3 = {
    getSignedUrlPromise: jest.fn(),
  };
  return {
    S3: jest.fn(() => mockedS3),
  };
});

describe('UserUrlService', () => {
  let service: UserUrlService;
  let userUrlRepository: Repository<UserUrlEntity>;

  // 이 부분을 추가합니다.
  const mockedBucketName = 'YOUR_MOCKED_BUCKET_NAME';
  process.env.AWS_BUCKET_NAME = mockedBucketName;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserUrlService,
        {
          provide: getRepositoryToken(UserUrlEntity),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    service = module.get<UserUrlService>(UserUrlService);
    userUrlRepository = module.get<Repository<UserUrlEntity>>(
      getRepositoryToken(UserUrlEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(userUrlRepository).toBeDefined();
  });

  describe('updateUserUrlView', () => {
    const url_id = 1;

    const userLinkDummyData = {
      id: 1,
      img: undefined,
      title: '링크 제목',
      url: 'https://naver.com',
      view: 10,
      user_id: 1,
      created_at: new Date('2023-08-16'),
    } as UserUrlEntity;

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

    it('view count 증가', async () => {
      const findOneResult = jest
        .spyOn(userUrlRepository, 'findOne')
        .mockResolvedValue(userLinkDummyData);

      const updateResult = jest
        .spyOn(userUrlRepository, 'update')
        .mockResolvedValue(resUpdateData);

      await service.updateUserUrlView(url_id);

      expect(findOneResult).toBeCalledTimes(1);
      expect(findOneResult).toBeCalledWith({
        where: {
          id: url_id,
        },
      });

      expect(updateResult).toBeCalledTimes(1);
      expect(updateResult).toBeCalledWith(url_id, {
        view: userLinkDummyData.view + 1,
      });
    });

    it('존재하지 않는 url_id', async () => {
      const findOneResult = jest.spyOn(userUrlRepository, 'findOne');

      await expect(
        async () => await service.updateUserUrlView(url_id),
      ).rejects.toThrowError(new Error('존재하지 않는 url_id 입니다.'));

      expect(findOneResult).toBeCalledTimes(1);
      expect(findOneResult).toBeCalledWith({
        where: {
          id: url_id,
        },
      });
    });

    it('view 업데이트 실패', async () => {
      const findOneResult = jest
        .spyOn(userUrlRepository, 'findOne')
        .mockResolvedValue(userLinkDummyData);

      const updateResult = jest
        .spyOn(userUrlRepository, 'update')
        .mockResolvedValue(ErrorResUpdateData);

      await expect(
        async () => await service.updateUserUrlView(url_id),
      ).rejects.toThrowError(new Error('view 업데이트 실패'));

      expect(findOneResult).toBeCalledTimes(1);
      expect(findOneResult).toBeCalledWith({
        where: {
          id: url_id,
        },
      });

      expect(updateResult).toBeCalledTimes(1);
      expect(updateResult).toBeCalledWith(url_id, {
        view: userLinkDummyData.view + 1,
      });
    });
  });

  describe('deleteUserUrl', () => {
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

    const url_id = 1;

    beforeEach(() =>
      jest.spyOn(Date, 'now').mockReturnValue(new Date('2023-08-16').getTime()),
    );

    it('url 삭제하기', async () => {
      const updateResult = jest
        .spyOn(userUrlRepository, 'update')
        .mockResolvedValue(resUpdateData);

      await service.deleteUserUrl(url_id);

      expect(updateResult).toBeCalledTimes(1);
      expect(updateResult).toBeCalledWith(url_id, {
        delete_at: new Date(Date.now()),
      });
    });

    it('url 삭제 실패', async () => {
      const updateResult = jest
        .spyOn(userUrlRepository, 'update')
        .mockResolvedValue(ErrorResUpdateData);

      await expect(
        async () => await service.deleteUserUrl(url_id),
      ).rejects.toThrowError(new Error('url 삭제 실패'));

      expect(updateResult).toBeCalledTimes(1);
      expect(updateResult).toBeCalledWith(url_id, {
        delete_at: new Date(Date.now()),
      });
    });
  });

  describe('findAllUserUrl', () => {
    const findDummyData = [
      {
        id: 1,
        img: 'TEST_IMG_GET',
        title: 'url 제목',
        url: 'TEST_URL',
        view: 11,
        user_id: 1,
        created_at: new Date('2023-08-16'),
      },
      {
        id: 1,
        img: '',
        title: 'url 제목22',
        url: 'TEST_URL22',
        view: 1,
        user_id: 1,
        created_at: new Date('2023-08-14'),
      },
    ] as UserUrlEntity[];

    const user_id = 1;

    it('해당 유저의 url 정보 출력', async () => {
      const findResult = jest
        .spyOn(userUrlRepository, 'find')
        .mockResolvedValue(findDummyData);

      const imgS3Result = jest
        .spyOn(service, 'getPreSignedUrl')
        .mockResolvedValue('TEST_IMG_GET');

      await service.findAllUserUrl(user_id);

      expect(findResult).toBeCalledTimes(1);
      expect(findResult).toBeCalledWith({
        where: {
          user_id: user_id,
          delete_at: null,
        },
        order: {
          created_at: 'DESC',
        },
      });

      expect(imgS3Result).toBeCalledTimes(1);
      expect(imgS3Result).toBeCalledWith(findDummyData[0].img);
    });
  });

  describe('getPreSignedUrl', () => {
    const key = 'IMG_KEY';
    const mockPreSignedUrl = 'MOCK_S3_IMG_GET';

    it('이미지 s3에서 불러오기', async () => {
      // 모의된 S3 객체 생성
      const mockedS3 = new S3() as jest.Mocked<S3>;

      mockedS3.getSignedUrlPromise.mockResolvedValue(mockPreSignedUrl);

      const preSignedUrl = await service.getPreSignedUrl(key);

      expect(preSignedUrl).toBe(mockPreSignedUrl);
      expect(mockedS3.getSignedUrlPromise).toBeCalledWith('getObject', {
        Bucket: mockedBucketName,
        Key: key,
        Expires: 3600,
      });
    });
  });

  describe('saveUserUrl', () => {
    const saveDummyData = {
      id: 1,
      img: '',
      title: 'title url',
      url: 'https://naver.com',
      view: 0,
      user_id: 1,
      created_at: new Date('2023-08-16'),
    } as UserUrlEntity;

    const user_id = 1;

    const createUserUrlDto = {
      img: '',
      title: 'title url',
      url: 'https://naver.com',
    } as CreateUserUrlDto;

    it('url 저장', async () => {
      const saveResult = jest
        .spyOn(userUrlRepository, 'save')
        .mockResolvedValue(saveDummyData);

      await service.saveUserUrl(user_id, createUserUrlDto);

      expect(saveResult).toBeCalledTimes(1);
      expect(saveResult).toBeCalledWith(
        new UserUrlEntity({
          img: createUserUrlDto.img,
          title: createUserUrlDto.title,
          url: createUserUrlDto.url,
          view: 0,
          user_id: user_id,
        }),
      );
    });
  });

  describe('findOneUserUrl', () => {
    const findDummyData = {
      id: 1,
      img: '',
      title: 'title url',
      url: 'https://naver.com',
      view: 0,
      user_id: 1,
      created_at: new Date('2023-08-16'),
    } as UserUrlEntity;

    const url_id = 1;

    it('오늘의 url 찾기', async () => {
      const findResult = jest
        .spyOn(userUrlRepository, 'findOne')
        .mockResolvedValue(findDummyData);

      await service.findOneUserUrl(url_id);

      expect(findResult).toBeCalledTimes(1);
      expect(findResult).toBeCalledWith({
        where: {
          id: url_id,
        },
      });
    });

    it('오늘의 url 찾기 실패', async () => {
      const findResult = jest.spyOn(userUrlRepository, 'findOne');

      await expect(
        async () => await service.findOneUserUrl(url_id),
      ).rejects.toThrowError(
        new NotFoundException('존재하지 않는 url_id 입니다.'),
      );

      expect(findResult).toBeCalledTimes(1);
      expect(findResult).toBeCalledWith({
        where: {
          id: url_id,
        },
      });
    });
  });
});
