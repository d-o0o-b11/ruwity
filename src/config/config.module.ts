import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';
import kakaoConfig from './config/kakao.config';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [
        `src/envs/${
          process.env.NODE_ENV == 'dev' ? 'development' : 'production'
        }.env`,
      ],
      load: [databaseConfig, kakaoConfig],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        ...configService.get('postgres'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class SettingModule {}
