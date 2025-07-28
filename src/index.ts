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
import { __prod__ } from './constants';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import microConfig from './mikro-orm-config';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
console.log('process.env.SECRET: ', process.env.SECRET);

const RedisStore = connectRedis(session);
const redisClient = createClient();
const secret: string = process.env.SECRET || '';

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();

  const app = express();

  app.use(
    session({
      name: 'qid',
      store: new RedisStore({ client: redisClient }),
      secret: secret,
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: async () => ({ em: orm.em }),
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app });

  app.listen(9000, () => {
    console.log('Server started on localhost:9000');
  });
};

main().catch((error) => {
  console.error(error);
});
