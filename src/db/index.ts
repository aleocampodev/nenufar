import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import * as schema from './schema'

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URI || 'postgres://ale:secret123@127.0.0.1:5432/agento',
})

export const db = drizzle(pool, { schema })
export type DbClient = typeof db
export * from './schema'
