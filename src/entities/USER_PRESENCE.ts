import { ObjectType, Field } from 'type-graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  OneToMany,
} from 'typeorm';

@ObjectType()
@Entity()
export class UserPresence extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  user_id: number;

  @Field()
  @Column()
  is_online: boolean;

  @Field()
  @Column()
  connection_count: number;

  @Field(() => String)
  @UpdateDateColumn()
  last_seen_at = new Date();

  @Field(() => String)
  @UpdateDateColumn()
  last_online_at = new Date();

  @Field(() => String)
  @UpdateDateColumn()
  last_offline_at = new Date();

  @Field(() => String)
  @UpdateDateColumn()
  updated_at = new Date();
}
