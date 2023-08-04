import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class JwtAccessAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<any> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      throw new UnauthorizedException(
        "요청 헤더에 authorization 가 존재하지 않습니다."
      );
    }
    try {
      const decodedToken = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });

      const currentTimestamp = Math.floor(Date.now() / 1000);

      if (decodedToken.exp && decodedToken.exp < currentTimestamp) {
        throw new ForbiddenException(
          "토큰이 만료되었습니다. 다시 로그인해주세요."
        );
      }

      request.user = { id: decodedToken.id };
      return decodedToken.id;
    } catch (err) {
      throw new ForbiddenException("토큰이 유효하지 않습니다.");
    }
  }
}

/**
 * @memo
 * NestJS의 CanActivate 인터페이스를 구현한 JwtAccessAuthGuard 미들웨어입니다.
 * =====================================================
 * CanActivate 인터페이스는 라우터 가드(Router Guard)를 구현하기 위해 사용되며, 해당 미들웨어가 특정 요청에 대해 실행되도록 설정하는 역할을 합니다.
 * @Injectable() 데코레이터를 사용하여 의존성 주입(Dependency Injection)이 가능하도록 구현되었다.
 * JwtService 주입 받았습니다.
 * canActivate 메서드는 CanActivate 인터페이스를 구현한 것으로, 요청이 들어올 때 해당 미들웨어가 실행되는 메서드입니다.
 * JWT 토큰을 담고 있는 authorization 헤더 값을 가져옵니다.
 * JWT 토큰은 "Bearer {token}" 형식으로 오기 때문에 순수 토큰값만 가져올 수 있도록 구현합니다.
 *
 * @logic
 * 토큰이 존재하지 않으면 UnauthorizedException
 * 토큰이 존재하면 this.jwtService.verifyAsync(token, { secret: process.env.JWT_ACCESS_SECRET })를 사용하여 JWT 토큰의 유효성을 검사합니다. 만료 시간도 확인합니다.
 * 토큰이 유효하지 않으면 ForbiddenException
 * 토큰이 유효하면 request.user 객체에 { id: decodedToken.id }를 저장하고, 해당 id를 반환합니다.
 */
