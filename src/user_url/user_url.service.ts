import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserUrlEntity } from './entities/user_url.entity';
import { Repository } from 'typeorm';
import { s3 } from 'src/config/config/s3.config';
import { CreateUserUrlDto } from './dto/create-user_url.dto';

@Injectable()
export class UserUrlService {
  constructor(
    @InjectRepository(UserUrlEntity)
    private readonly userUrlRepository: Repository<UserUrlEntity>,
  ) {}

  async updateUserUrlView(url_id: number) {
    const findOneResult = await this.userUrlRepository.findOne({
      where: {
        id: url_id,
      },
    });

    if (!findOneResult) {
      throw new Error('존재하지 않는 url_id 입니다.');
    }

    const updateResult = await this.userUrlRepository.update(url_id, {
      view: findOneResult.view + 1,
    });

    if (!updateResult.affected) throw new Error('view 업데이트 실패');

    return true;
  }

  async deleteUserUrl(url_id: number) {
    const updateResult = await this.userUrlRepository.update(url_id, {
      delete_at: new Date(Date.now()),
    });

    if (!updateResult.affected) throw new Error('url 삭제 실패');

    return true;
  }

  async findAllUserUrl(id: number) {
    const findResult = await this.userUrlRepository.find({
      where: {
        user_id: id,
        delete_at: null,
      },
      order: {
        created_at: 'DESC',
      },
    });
    for (let i = 0; i < findResult.length; i++) {
      if (findResult[i].img) {
        findResult[i].img = await this.getPreSignedUrl(findResult[i].img);
      }
    }

    return findResult;
  }

  async getPreSignedUrl(key: string): Promise<string> {
    const imageParam = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Expires: 3600,
    };

    const preSignedUrl = await s3.getSignedUrlPromise('getObject', imageParam);

    return preSignedUrl;
  }

  async saveUserUrl(user_id: number, dto: CreateUserUrlDto) {
    const saveResult = await this.userUrlRepository.save(
      new UserUrlEntity({
        img: dto.img,
        title: dto.title,
        url: dto.url,
        view: 0,
        user_id: user_id,
      }),
    );

    return saveResult;
  }

  async findOneUserUrl(url_id: number) {
    const findResult = await this.userUrlRepository.findOne({
      where: {
        id: url_id,
      },
    });

    if (!findResult)
      throw new NotFoundException('존재하지 않는 url_id 입니다.');

    return findResult;
  }
}
