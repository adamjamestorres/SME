import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

async function seededDb() {
  const db = new PGlite("memory://");
  await db.exec(await readFile("supabase/migrations/20261007000000_init.sql", "utf8"));
  await db.exec(await readFile("supabase/seed/dev.sql", "utf8"));
  return db;
}

test("dev migration seeds five customers and a broken-down lead", async () => {
  const db = await seededDb();
  const customers = await db.query("select count(*)::int as count from customers");
  const broken = await db.query("select count(*)::int as count from leads where broken_down");
  assert.equal(customers.rows[0].count, 5);
  assert.equal(broken.rows[0].count, 1);
  await db.close();
});

test("dev payment tokens are deterministic and unique", async () => {
  const db = await seededDb();
  const result = await db.query("select token, status from payment_requests order by token");
  assert.deepEqual(result.rows, [
    { token: "dev-open-payment", status: "open" },
    { token: "dev-paid-payment", status: "paid" },
  ]);
  await db.close();
});
