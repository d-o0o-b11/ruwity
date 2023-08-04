import {
  Body,
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { KakaoLoginService } from './kakao-login.service';
import { Response } from 'express';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CtxUser } from 'src/decorator/auth.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { KakaoLoginUserDto } from './dto/kakao-login.dto';
import { RefreshTokenDto } from './dto/refreshToken.dto';

@ApiTags('로그인 API')
@Controller('kakao-login')
export class KakaoLoginController {
  constructor(private readonly kakaoLoginService: KakaoLoginService) {}

  @ApiOperation({
    summary: '로그인 리다이렉트 url',
  })
  @Get('login')
  async redirectToKakaoLogin(@Res() response: Response) {
    const redirect_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.REST_API}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code`;
    response.redirect(HttpStatus.MOVED_PERMANENTLY, redirect_URL);
  }

  @Get('kakao-callback')
  @UseGuards(JwtAuthGuard)
  async handleKakaoCallback(
    @CtxUser() kakao_user: KakaoLoginUserDto,
    @Res() response: Response,
  ) {
    const { access_token, refresh_token } =
      await this.kakaoLoginService.kakaoLogin(kakao_user);

    const redirectUrl = `https://linkg.netlify.app/redirects/signin?access_token=${access_token}&refresh_token=${refresh_token}`;
    response.redirect(302, redirectUrl);
  }

  @ApiOperation({
    summary:
      'access 토큰이 만료되면 refresh 토큰을 이용해서 access 토큰 재발급',
  })
  @ApiBody({
    type: RefreshTokenDto,
  })
  @Post('refresh')
  async refresh(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    refreshTokenDto: RefreshTokenDto,
  ) {
    const { refresh_token } = refreshTokenDto;
    try {
      const newAccessToken = (
        await this.kakaoLoginService.refreshTokencheck(refresh_token)
      ).accessToken;

      return { access_token: newAccessToken };
    } catch (e) {
      if (e instanceof UnauthorizedException)
        throw new UnauthorizedException(e.message);

      throw new InternalServerErrorException(e.message);
    }
  }
}
