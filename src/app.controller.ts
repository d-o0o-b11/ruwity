import {
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Res,
  ValidationPipe,
} from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserUserService } from './user_user/user_user.service';
import { join } from 'path';
import { createReadStream } from 'fs';
import { Response } from 'express';

@ApiTags('서버 연결 테스트 API+ page_url 확인 API')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly userUserService: UserUserService,
  ) {}

  @ApiOperation({
    summary: 'Hello World! RUWITY? 뜨면 연결 성공입니다',
  })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @ApiOperation({
    summary: '특정 user의 page url에 들어간 경우 ',
  })
  @Get(':page_url')
  async getUserPageInfo(
    @Param('page_url', new ValidationPipe({ whitelist: true, transform: true }))
    page_url: string,
  ) {
    try {
      return await this.userUserService.findUserPageToUser(page_url);
    } catch (e) {
      if (e instanceof NotFoundException)
        throw new NotFoundException(e.message);

      throw new InternalServerErrorException(e.message);
    }
  }
}
