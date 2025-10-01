import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';
import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import Redis from 'ioredis';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import { User } from './entities/USER';
import { Post } from './entities/POST';
import { Updoot } from './entities/Updoot';
import routes from './routes/index';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const port = process.env.PORT;
const nodeEnv = process.env.NODE_ENV;

const javascript =
  nodeEnv === 'development' ? '/static/js/bundle.js' : '/static/js/main.min.js';

// TODO: Get cookie working in production environment

const main = async () => {
  const nodeEnv = process.env.NODE_ENV;
  const locals = {
    javascript:
      nodeEnv === 'development'
        ? '/static/js/bundle.js'
        : '/static/js/main.min.js',
  };
  const RedisStore = require('connect-redis')(session);
  const redis = new Redis();
  const secret: string = process.env.SECRET || '';

  const app = express();

  app.set('trust proxy', 1);

  app.use(
    session({
      name: 'uid',
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true,
        sameSite: 'lax',
        domain:
          nodeEnv === 'production'
            ? 'craigstroman.com'
            : 'http://localhost:9000',
        secure: nodeEnv === 'production' ? true : false,
      },
      saveUninitialized: false,
      secret: secret,
      resave: false,
    })
  );

  await createConnection({
    type: 'postgres',
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    logging: true,
    synchronize: true,
    migrations: [path.join(__dirname, './migrations/*')],
    entities: [Post, User, Updoot],
  });

  // await conn.runMigrations();

  app.use(
    cors({
      origin:
        nodeEnv === 'production'
          ? ['http://lireddit.craigstroman.com']
          : ['http://localhost:8080'],
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
      req: req,
      res: res,
      redis: redis,
    }),
  });

  app.set('trust proxy', 1);

  app.use(routes);

  app.use('/static', express.static('public'));

  app.set('views', path.join(__dirname, './views'));
  app.set('view engine', 'pug');

  app.locals = locals;

  app.locals.javascript = javascript;

  app.locals.title = 'LiReddit';
  app.locals.description = 'A Reddit clone.';

  await apolloServer.start();

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(port, () => {
    console.log(`Server started on localhost:${port}`);
  });
};

main().catch((error) => {
  console.error(error);
});
