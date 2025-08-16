import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { createClient } from 'redis';
import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import Redis from 'ioredis';
import { __prod__ } from './constants';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import { sendEmail } from './utils/sendEmail';
import microConfig from './mikro-orm-config';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const main = async () => {
  const RedisStore = require('connect-redis')(session);
  const redisClient = createClient();
  const redis = new Redis();
  const secret: string = process.env.SECRET || '';
  const orm = await MikroORM.init(microConfig);

  await orm.getMigrator().up();

  const app = express();

  sendEmail('bob@bob.com', 'Hello there: ');

  app.use(
    session({
      name: 'uid',
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: false,
        sameSite: 'lax',
        secure: __prod__,
      },
      saveUninitialized: false,
      secret: secret,
      resave: false,
    })
  );

  app.set('trust proxy', 1);

  app.use(
    cors({
      origin: ['http://localhost:8080'],
      credentials: true,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: async ({ req, res }) => ({
      em: orm.em,
      req: req,
      res: res,
      redis: redis,
    }),
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(9000, () => {
    console.log('Server started on localhost:9000');
  });
};

main().catch((error) => {
  console.error(error);
});
