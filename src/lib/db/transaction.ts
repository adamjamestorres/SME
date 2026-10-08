import type { Db } from "./types";

/**
 * Runs `fn` inside a transaction on `db`, committing if it resolves and rolling back if it throws.
 *
 * `db` must be a single connection (a `pg.PoolClient` or PGlite), not a `pg.Pool`: a pool may run
 * each statement on a different connection. Use `withPoolTransaction` in pool.ts for the pool.
 */
export async function withTransaction<T>(db: Db, fn: (tx: Db) => Promise<T>): Promise<T> {
  await db.query("begin");
  try {
    const result = await fn(db);
    await db.query("commit");
    return result;
  } catch (error) {
    // If the rollback fails too (say the connection dropped), keep the original error.
    await db.query("rollback").catch(() => {});
    throw error;
  }
}
