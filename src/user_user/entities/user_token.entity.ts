import { IsNumber, IsString } from 'class-validator';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from './user_user.entity';

@Entity('user_token')
export class UserTokenEntity {
  @PrimaryColumn('int4')
  @IsNumber()
  user_id: number;

  @Column({ type: 'varchar', length: '225', nullable: true })
  @IsString()
  access_token: string;

  @Column({ type: 'varchar', length: '225', nullable: true })
  @IsString()
  refresh_token: string;

  @OneToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
