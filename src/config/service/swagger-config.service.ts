import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { IsAppConfig } from "../interface/swagger.interface";

@Injectable()
export class SwaggerConfigService {
  constructor(private configService: ConfigService) {}

  getSwaggerId(): string {
    return this.configService.get<IsAppConfig>("swagger").swagger_id;
  }

  getSwaggerPw(): string {
    return this.configService.get<IsAppConfig>("swagger").swagger_pw;
  }

  /**
   * @memo
   * <IsAppConfig> => 제너릭(Generic)타입을 사용하여 설정 값의 타입을 명시적으로 지정하는 것입니다.
   * TypeScript에서 변수의 타입을 미리 알고 있으므로 타입 추론을 도와주는 역할을 합니다.
   *
   * 제너릭이란 데이터의 타입을 일반화한다는 의미입니다.
   *1. 클래스나 메소드 내부에서 사용되는 객체의 타입 안정성을 높일 수 있습니다.
   *2. 반환값에 대한 타입 변환 및 타입 검사에 들어가는 노력을 줄일 수 있습니다.
   */
}
