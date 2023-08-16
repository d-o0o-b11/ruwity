import {
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserTapTextService } from './service/user_tap_text.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAccessAuthGuard } from 'src/kakao-login/jwt-access.guard';
import { JWTToken } from 'src/kakao-login/dto/jwt-token.dto';
import { CtxUser } from 'src/decorator/auth.decorator';
import { UserTapLinkService } from './service/user_tap_link.service';

@ApiTags('Tap API')
@Controller('user-tap')
export class UserTapController {
  constructor(
    private readonly userTapTextService: UserTapTextService,
    private readonly userTapLinkService: UserTapLinkService,
  ) {}

  @Post('text')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({
    summary: 'tap text 생성',
  })
  async saveTapText(@CtxUser() token: JWTToken) {
    try {
      return await this.userTapTextService.saveTapText(token.id);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Post('link')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({
    summary: 'tap link 생성',
  })
  async saveTapLink(@CtxUser() token: JWTToken) {
    try {
      return await this.userTapLinkService.saveTapLink(token.id);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('/all')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({
    summary: '모든 탭 출력',
  })
  async findAllUserTages(@CtxUser() token: JWTToken) {
    try {
      return await this.userTapLinkService.findAllByUserIdOrderByCreatedAtDesc(
        token.id,
      );
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
