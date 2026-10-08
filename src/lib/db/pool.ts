import "server-only";
import { Pool } from "pg";
import { withTransaction as withConnectionTransaction } from "./transaction";
import type { Db } from "./types";

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
  // An idle connection dropped by the server emits 'error' on the pool. Without a listener Node
  // treats it as unhandled and crashes; the pool already discards the dead client.
  pool.on("error", (error) => {
    console.error("Postgres pool: idle client error:", error.message);
  });
  return pool;
}

/**
 * Runs `fn` in a transaction on a single connection. Pass a `pg.PoolClient` or PGlite; for the
 * pool itself use `withPoolTransaction`.
 */
export async function withTransaction<T>(db: Db, fn: (tx: Db) => Promise<T>): Promise<T> {
  if (db instanceof Pool) {
    throw new Error("withTransaction needs a single connection, not a pool. Use withPoolTransaction.");
  }
  return withConnectionTransaction(db, fn);
}

/** Checks out one connection from the pool and runs `fn` in a transaction on it. */
export async function withPoolTransaction<T>(fn: (tx: Db) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  let failed: Error | undefined;
  try {
    return await withConnectionTransaction(client, fn);
  } catch (error) {
    failed = error instanceof Error ? error : new Error(String(error));
    throw error;
  } finally {
    // Passing the error destroys the client instead of returning a possibly broken connection.
    client.release(failed);
  }
}
