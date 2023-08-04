import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsNumber, IsString } from 'class-validator';
import { UserEntity } from 'src/user_user/entities/user_user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

@Entity('user_tap_text')
export class UserTapTextEntity {
  @PrimaryColumn('int4')
  @Generated()
  @IsNumber()
  @ApiProperty({
    description: 'user_tap_text PK',
    example: 1,
  })
  id: number;

  @Column({ type: 'varchar', length: '5' })
  @IsString()
  @ApiPropertyOptional({
    description: '탭 타입[텍스트]',
    example: '텍스트',
  })
  tap_type: string;

  @Column({ type: 'varchar', length: '225', nullable: true })
  @IsString()
  @ApiPropertyOptional({
    description: '제목',
    example: '고라니가 수영함',
  })
  title: string;

  @Column({ type: 'varchar', length: '225', nullable: true })
  @IsString()
  @ApiPropertyOptional({
    description: '제목',
    example: '고라니가 수영함',
  })
  context: string;

  @Column({ type: 'boolean', default: true })
  @IsBoolean()
  @ApiProperty({
    description: '펼친 상태 true, 접은 상태 false',
    example: true,
  })
  folded_state: boolean;

  @Column({ type: 'boolean', default: true })
  @IsBoolean()
  @ApiProperty({
    description: '공개 true, 비공개 false',
    example: true,
  })
  toggle_state: boolean;

  @Column({ type: 'int4' })
  @IsNumber()
  user_id: number;

  @CreateDateColumn()
  @IsDate()
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  toggle_update_time: Date;

  @DeleteDateColumn({ name: 'delete_at', type: 'timestamp', default: null })
  delete_at: Date | null;

  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  constructor(data: Partial<UserTapTextEntity>) {
    Object.assign(this, data);
  }
}
