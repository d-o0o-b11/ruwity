import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAccessAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<any> {
    // try {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    // const token = request.cookies?.access_token;

    // if (!token) {
    //   throw new ForbiddenException(
    //     '요청 쿠키에 access_token이 존재하지 않습니다.',
    //   );
    // }
    if (!token) {
      throw new UnauthorizedException(
        '요청 헤더에 authorization 가 존재하지 않습니다.',
      );
    }
    try {
      //원래 try-catch없었는데 토큰 만료 에러 띄울려고 함! 여기 오류나면 지워도됨
      const decodedToken = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });

      const currentTimestamp = Math.floor(Date.now() / 1000);
      // 토큰이 만료된 경우
      if (decodedToken.exp && decodedToken.exp < currentTimestamp) {
        throw new ForbiddenException(
          '토큰이 만료되었습니다. 다시 로그인해주세요.',
        );
      }

      request.user = { id: decodedToken.id };
      return decodedToken.id;
    } catch (err) {
      throw new ForbiddenException('토큰이 유효하지 않습니다.');
    }
  }
}
