import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  UseGuards,
  InternalServerErrorException,
  ParseIntPipe,
} from '@nestjs/common';
import { UserUrlService } from './user_url.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAccessAuthGuard } from 'src/kakao-login/jwt-access.guard';
import { JWTToken } from 'src/kakao-login/dto/jwt-token.dto';
import { CtxUser } from 'src/decorator/auth.decorator';

@ApiTags('유저 URL API')
@Controller('user-url')
export class UserUrlController {
  constructor(private readonly userUrlService: UserUrlService) {}

  @ApiOperation({
    summary: '링크 클릭 조회수 증가',
  })
  @Patch(':url_id')
  async updateUserUrlView(
    @Param('url_id', ParseIntPipe)
    url_id: number,
  ) {
    try {
      return await this.userUrlService.updateUserUrlView(url_id);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Delete(':url_id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({
    summary: '링크 삭제',
  })
  async deleteUserUrl(
    @Param('url_id', ParseIntPipe)
    url_id: number,
  ) {
    try {
      return await this.userUrlService.deleteUserUrl(url_id);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('/all')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({
    summary: '유저가 생성한 모든 링크 출력',
  })
  async findAllUserUrl(@CtxUser() token: JWTToken) {
    try {
      return await this.userUrlService.findAllUserUrl(token.id);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
