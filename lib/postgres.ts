import { Pool } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var pgPool: Pool | undefined;
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    'Please define the DATABASE_URL environment variable inside .env.local',
  );
}

const pool =
  global.pgPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (!global.pgPool) {
  global.pgPool = pool;
}

export const query = <T = unknown>(text: string, params?: unknown[]) =>
  pool.query<T>(text, params);

export type Nullable<T> = T | null;
