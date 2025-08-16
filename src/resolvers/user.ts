import {
  Resolver,
  Mutation,
  Arg,
  InputType,
  Field,
  Ctx,
  ObjectType,
  Query,
} from 'type-graphql';
import { v4 } from 'uuid';
import argon2 from 'argon2';
import { MyContext } from 'src/types';
import { User } from '../entities/USER';
import { sendEmail } from '../utils/sendEmail';
import { FORGET_PASSWORD_PREFIX } from '../constants';

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

@InputType()
class UsernameLoginInput {
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

@Resolver()
export class UserResolver {
  @Query(() => User)
  async me(@Ctx() { req, em }: MyContext) {
    // You are not logged in
    if (!req.session.userId) {
      return null;
    }

    const id = req.session.userId;

    const user = await em.findOne(User, { id });

    return user;
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { req, em, redis }: MyContext
  ) {
    const user = await em.findOne(User, { email });

    if (!user) {
      return true;
    }

    const token = v4();

    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      'ex',
      1000 * 60 * 60 * 24 * 3
    ); // 3 days

    await sendEmail(
      email,
      `<a href="http://localhost:8080/change-password/${token}">reset password</a>`
    );

    return true;
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
    const user = em.create(User, {
      first_name: options.first_name,
      last_name: options.last_name,
      email: options.email,
      username: options.username,
      password: hashedPassword,
      createdAt: new Date().toDateString(),
      updatedAt: new Date().toDateString(),
    });

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
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(
      User,
      usernameOrEmail.includes('@')
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail }
    );

    if (!user) {
      return {
        errors: [
          {
            field: 'username',
            message: "Username doesn't exist",
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
            message: "Password doesn't match",
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
        }
        resolve(true);
      })
    );
  }
}
