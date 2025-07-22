import path from 'path';
import { MikroORM } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import dotenv from 'dotenv';
import { Post } from './entities/POST';
import { __prod__ } from './constants';

dotenv.config({ path: path.resolve(__dirname, '.env') });

export default {
  migrations: {
    path: path.join(__dirname, './migrations'),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  driver: PostgreSqlDriver,
  dbName: process.env.DB_NAME,
  entities: [Post],
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0];
