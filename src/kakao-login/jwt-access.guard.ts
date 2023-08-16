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
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedException(
        '요청 헤더에 authorization 가 존재하지 않습니다.',
      );
    }
    try {
      const decodedToken = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });

      const currentTimestamp = Math.floor(Date.now() / 1000);

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
