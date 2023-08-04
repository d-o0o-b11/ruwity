import {
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { UserTokenEntity } from './user_token.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserPageEntity } from './user_page.entity';
import { UserTodyLinkEntity } from './user_today_link.entity';

@Entity('user_user')
export class UserEntity {
  @PrimaryColumn('int4')
  @Generated()
  @IsNumber()
  @ApiProperty({
    description: 'user_user PK',
    example: 1,
  })
  id: number;

  @Column({ type: 'bigint' })
  @IsNumber()
  @ApiProperty({
    description: 'kakao_id',
    example: 1111,
  })
  kakao_id: number;

  @Column({ type: 'varchar', length: '6', nullable: true })
  @IsString()
  @ApiProperty({
    description: 'nickname',
    example: '지민',
  })
  nickname: string;

  @Column({ type: 'text', nullable: true })
  @IsString()
  @ApiProperty({
    description: 'profile',
    example: 'image.png',
  })
  profile: string;

  @Column({ type: 'varchar', length: '225', nullable: true })
  @IsString()
  @ApiProperty({
    description: '한줄 표현',
    example: '산 좋고 물 좋은 곳',
  })
  explanation: string;

  @Column({ type: 'varchar', length: '10', nullable: true })
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: '성별(남자male,여자female,표시안함null)',
    example: 'true',
  })
  gender?: string;

  @Column({ type: 'int4', nullable: true })
  @IsNumber()
  @ApiProperty({
    description: '나이',
    example: '20',
  })
  age: number;

  @Column({ type: 'varchar', length: 225, nullable: true })
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'email',
    example: '111@naver.com',
  })
  user_email: string;

  @IsBoolean()
  @Column({ type: 'boolean', default: false })
  @ApiProperty({
    description: '신규,기존 회원인지 구별-> 신규 false, 기존 true',
    example: false,
  })
  user_type: boolean;

  @CreateDateColumn()
  @IsDate()
  created_at: Date;

  @OneToOne(() => UserTokenEntity, (token) => token.user, {
    cascade: true,
    nullable: true,
  })
  token: UserTokenEntity;

  @OneToOne(() => UserPageEntity, (page) => page.user, {
    cascade: true,
    nullable: false,
  })
  page: UserPageEntity;

  @OneToOne(() => UserTodyLinkEntity, (today) => today.user, {
    cascade: true,
    nullable: false,
  })
  today_link: UserTodyLinkEntity;

  constructor(data: Partial<UserEntity>) {
    Object.assign(this, data);
  }
}
