import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";

// Real Postgres (PGlite, compiled to WASM) standing in for `supabase db reset`.
const MIGRATIONS_DIR = fileURLToPath(new URL("../supabase/migrations/", import.meta.url));

const migrations = readdirSync(MIGRATIONS_DIR)
  .filter((f) => f.endsWith(".sql"))
  .sort()
  .map((f) => ({ name: f, sql: readFileSync(MIGRATIONS_DIR + f, "utf8") }));

// The Supabase roles, plus a stub of the `storage.buckets` table Supabase provides.
const SUPABASE_STUB = `
  create role anon;
  create role authenticated;
  create role service_role;
  create schema storage;
  create table storage.buckets (
    id text primary key,
    name text not null unique,
    public boolean default false,
    file_size_limit bigint,
    allowed_mime_types text[],
    created_at timestamptz default now(),
    updated_at timestamptz default now()
  );
`;

export interface TestDbOptions {
  /** SQL to run after the stub and before the migrations. */
  beforeMigrations?: string;
}

/** A fresh PGlite database with the Supabase roles, a storage stub and every migration applied. */
export async function newTestDb(options: TestDbOptions = {}): Promise<PGlite> {
  const db = new PGlite();
  await db.exec(SUPABASE_STUB);
  if (options.beforeMigrations) await db.exec(options.beforeMigrations);
  for (const { name, sql } of migrations) {
    try {
      await db.exec(sql);
    } catch (error) {
      throw new Error(`Migration ${name} failed: ${(error as Error).message}`);
    }
  }
  return db;
}
