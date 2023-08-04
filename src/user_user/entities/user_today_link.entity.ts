import { IsNumber, IsString } from 'class-validator';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from './user_user.entity';
import { UserUrlEntity } from 'src/user_url/entities/user_url.entity';

@Entity('user_today_link')
export class UserTodyLinkEntity {
  @PrimaryColumn('int4')
  @IsNumber()
  user_id: number;

  @Column({ type: 'varchar', length: '225', nullable: true })
  @IsString()
  today_link: string;

  @Column({ type: 'timestamptz', nullable: false })
  created_at: Date;

  @Column({ type: 'int4', nullable: false })
  url_id: number;

  @OneToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @OneToOne(() => UserUrlEntity, (url) => url.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'url_id' })
  user_url: UserUrlEntity;

  constructor(data: Partial<UserTodyLinkEntity>) {
    Object.assign(this, data);
  }
}
