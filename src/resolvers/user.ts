import {
  Resolver,
  Mutation,
  Arg,
  InputType,
  Field,
  Ctx,
  ObjectType,
  FieldResolver,
  Root,
  Query,
} from 'type-graphql';
import { v4 } from 'uuid';
import argon2 from 'argon2';
import { MyContext } from 'src/types';
import { User } from '../entities/USER';
import { FORGET_PASSWORD_PREFIX } from '../constants';
import { getConnection } from 'typeorm';

// TODO: Also add email validation to server side

@InputType()
class UsernameRegisterInput {
  @Field()
  first_name: string;
  @Field()
  last_name: string;
  @Field()
  email: string;
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver(User)
export class UserResolver {
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    // this is the current user and its ok to show them their own email
    if (req.session.userId === user.id) {
      return user.email;
    }
    // current user wants to see someone elses email
    return '';
  }
  @Query(() => User)
  async me(@Ctx() { req }: MyContext) {
    // You are not logged in
    if (!req.session.userId) {
      return null;
    }

    const id = req.session.userId;

    const user = await User.findOne(id);

    return user;
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('new_password') new_password: string,
    @Ctx() { redis, em, req }: MyContext
  ): Promise<UserResponse> {
    if (new_password.length <= 2) {
      return {
        errors: [
          {
            field: 'newPassword',
            message: 'length must be greater than 2',
          },
        ],
      };
    }

    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [
          {
            field: 'token',
            message: 'token expired',
          },
        ],
      };
    }

    const userIdNum = parseInt(userId);
    const user = await User.findOne(userIdNum);

    if (!user) {
      return {
        errors: [
          {
            field: 'token',
            message: 'user no longer exists',
          },
        ],
      };
    }

    user.password = await argon2.hash(new_password);
    await User.update(
      { id: userIdNum },
      {
        password: await argon2.hash(new_password),
      }
    );

    await redis.del(key);

    // log in user after change password
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => String)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { redis }: MyContext
  ) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return 'Error';
    }

    const token = v4();

    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      'ex',
      1000 * 60 * 60 * 24 * 3
    ); // 3 days

    return `http://localhost:8080/change-password/${token}`;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernameRegisterInput,
    @Ctx() { req, em }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [
          {
            field: 'username',
            message: 'Username must be greater than 2 characters long.',
          },
        ],
      };
    }

    if (options.password.length <= 2) {
      return {
        errors: [
          {
            field: 'password',
            message: 'Password length must be greater than 2 characters long.',
          },
        ],
      };
    }

    const hashedPassword = await argon2.hash(options.password);
    const result = await getConnection()
      .createQueryBuilder()
      .insert()
      .into(User)
      .values({
        first_name: options.first_name,
        last_name: options.last_name,
        username: options.username,
        email: options.email,
        password: hashedPassword,
      })
      .returning('*')
      .execute();

    const user = result.raw[0];

    try {
      await em.persistAndFlush(user);
    } catch (error) {
      if (error.code === '23505') {
        return {
          errors: [
            {
              field: 'username',
              message: 'username already taken',
            },
          ],
        };
      }
    }

    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne(
      usernameOrEmail.includes('@')
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail } }
    );

    if (!user) {
      return {
        errors: [
          {
            field: 'username',
            message: 'Username or password is invalid.',
          },
        ],
      };
    }

    const valid = await argon2.verify(user.password, password);

    if (!valid) {
      return {
        errors: [
          {
            field: 'password',
            message: "Username or password doesn't match.",
          },
        ],
      };
    }

    // Store user id session
    req.session.userId = user?.id;

    return {
      user,
    };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err: any) => {
        res.clearCookie('uid');
        if (err) {
          console.log('There was an issue destroying the session.');
          console.log('err: ', err);
          resolve(false);
          return;
        }
        resolve(true);
      })
    );
  }
}
