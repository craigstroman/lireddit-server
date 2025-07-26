import { MyContext } from 'src/types';
import {
  Resolver,
  Query,
  Mutation,
  Arg,
  InputType,
  Field,
  Ctx,
} from 'type-graphql';
import argon2 from 'argon2';
import { User } from '../entities/USER';

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@Resolver()
export class UserResolver {
  @Mutation(() => User)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ) {
    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, {
      username: options.username,
      password: hashedPassword,
      createdAt: new Date().toDateString(),
      updatedAt: new Date().toDateString(),
    });
    await em.persistAndFlush(user);
    return user;
  }
}
