import "server-only";
import { Pool } from "pg";
import { withTransaction } from "./transaction";
import type { Db } from "./types";

export { withTransaction };

let pool: Pool | undefined;

/**
 * The app's Postgres pool (lazy singleton). Connects with `DATABASE_URL`, the Supabase pooler
 * connection string, as `postgres`, which bypasses RLS. Server code only.
 */
export function getPool(): Pool {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Add it to .env.local (see .env.example).");
  }
  // Serverless functions each hold their own pool, and Supabase's pooler does the real pooling,
  // so keep this one small.
  pool = new Pool({ connectionString, max: 3, idleTimeoutMillis: 10_000 });
  return pool;
}

/** Checks out one connection from the pool and runs `fn` in a transaction on it. */
export async function withPoolTransaction<T>(fn: (tx: Db) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    return await withTransaction(client, fn);
  } finally {
    client.release();
  }
}
