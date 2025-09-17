import { Response } from 'express';
import { Redis } from 'ioredis';
import { createUserLoader } from './utils/createUserLoader';
import { createUpdootLoader } from './utils/createUpdootLoader';

interface Request {
  session?: Session & Partial<SessionData>;
  url: string;
  hostname: string;
  params: object;
  headers: object;
  cookies: object;
  body: object;
  is: string;
  ip: string;
  method: string;
  query: object;
  protocol: string;
  originalUrl: string;
  accepts: string | boolean;
}

export type MyContext = {
  em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
  req: Request;
  res: Response;
  redis: Redis;
  userLoader: ReturnType<typeof createUserLoader>;
  updootLoader: ReturnType<typeof createUpdootLoader>;
};
