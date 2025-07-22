import path from 'path';
import { MikroORM } from '@mikro-orm/core';
import { Post } from './entities/POST';
import { __prod__ } from './constants';

export default {
  migrations: {
    path: path.join(__dirname, './migrations'),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  entities: [Post],
  type: 'postgresql',
  dbName: 'portfolio',
  user: 'craig125924',
  password: '0SB03cyeH1nB563sjmh2x',
  debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0];
