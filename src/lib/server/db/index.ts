import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { getRuntimeEnv } from '../config';

export function getDb() {
  const client = new Database(getRuntimeEnv().databaseUrl);
  return drizzle(client, { schema })
}
