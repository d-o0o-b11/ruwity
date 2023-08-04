import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("kakao") {}

/**
 * @memo
 * AuthGuard는 Passport의 인증 기능을 활용하여 인증을 처리해주는 라우터 가드입니다.
 */
