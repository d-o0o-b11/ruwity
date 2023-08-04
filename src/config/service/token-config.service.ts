import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { IsTokenConfig } from "../interface/token.config.interface";

@Injectable()
export class TokenService {
  constructor(private configService: ConfigService) {}

  getJwtAccessSecret(): string {
    return this.configService.get<IsTokenConfig>("token").jwt_access_secret;
  }

  getJwtAccessExpiration(): string {
    return this.configService.get<IsTokenConfig>("token")
      .jwt_access_expiration_time;
  }

  getJwtRefreshSecret(): string {
    return this.configService.get<IsTokenConfig>("token").jwt_refresh_secret;
  }

  getJwtRefreshExpiration(): string {
    return this.configService.get<IsTokenConfig>("token").jwt_refresh_secret;
  }
}
