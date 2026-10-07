import "server-only";
import { Pool, type PoolClient } from "pg";
import type { Db } from "./types";

let pool: Pool | undefined;

export function getDb(): Pool {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required outside the local dev database setup");
  }
  pool = new Pool({
    connectionString,
    max: Number(process.env.DATABASE_POOL_MAX ?? 5),
  });
  return pool;
}

export async function withTransaction<T>(db: Db, fn: (client: Db) => Promise<T>): Promise<T> {
  const client = "connect" in db ? await (db as Pool).connect() : null;
  if (!client) throw new Error("withTransaction requires a pg Pool");
  try {
    await client.query("begin");
    const result = await fn(client as PoolClient);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
