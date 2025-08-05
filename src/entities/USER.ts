import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { ObjectType, Field, Int } from 'type-graphql';

@ObjectType()
@Entity()
export class User {
  @Field(() => Int)
  @PrimaryKey()
  id!: number;

  @Field(() => String)
  @Property({ type: 'date' })
  createdAt = new Date().toString();

  @Field(() => String)
  @Property({ type: 'date', onUpdate: () => new Date() })
  updatedAt = new Date().toString();

  @Field(() => String)
  @Property({ type: 'text' })
  first_name!: string;

  @Field(() => String)
  @Property({ type: 'text' })
  last_name!: string;

  @Field(() => String)
  @Property({ type: 'text' })
  email!: string;

  @Field()
  @Property({ type: 'text', unique: true })
  username!: string;

  @Property({ type: 'text' })
  password!: string;
}
