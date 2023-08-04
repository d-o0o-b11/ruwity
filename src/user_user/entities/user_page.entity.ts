import { IsNumber, IsString } from 'class-validator';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from './user_user.entity';

@Entity('user_page')
export class UserPageEntity {
  @PrimaryColumn('int4')
  @IsNumber()
  user_id: number;

  @Column({ type: 'varchar', length: '12', nullable: false })
  @IsString()
  page_url: string;

  @OneToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  constructor(data: Partial<UserPageEntity>) {
    Object.assign(this, data);
  }
}
