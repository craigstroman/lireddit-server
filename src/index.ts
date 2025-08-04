import path from 'path';
import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import express from 'express';
import { createClient } from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import dotenv from 'dotenv';
import cors from 'cors';
import { __prod__ } from './constants';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import microConfig from './mikro-orm-config';

declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const RedisStore = connectRedis(session);
const redisClient = createClient();
const secret: string = process.env.SECRET || '';

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();

  const app = express();

  app.use(
    cors({
      origin: ['http://localhost:9000/graphql'],
      credentials: true,
      methods: 'GET HEAD PUT PATCH POST DELETE FETCH',
    })
  );

  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept'
    );
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Origin');
    res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
    next();
  });

  app.use(
    session({
      name: 'qid',
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true,
        sameSite: 'lax',
        secure: __prod__,
      },
      saveUninitialized: true,
      secret: secret,
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: true,
    }),
    context: async ({ req, res }) => ({
      em: orm.em,
      req,
      res,
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
