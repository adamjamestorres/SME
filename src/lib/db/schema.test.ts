import type { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";
import { newTestDb } from "../../../test/db";

const TABLES = [
  "customers",
  "leads",
  "payment_requests",
  "document_templates",
  "signature_requests",
  "link_sends",
  "posts",
  "post_images",
  "stripe_events",
  "rate_limit_hits",
];

// Supabase's "automatically expose new tables" default: anon and authenticated get everything.
const EXPOSE_EVERYTHING = `
  grant usage on schema public to anon, authenticated;
  alter default privileges in schema public grant all on tables to anon, authenticated;
  alter default privileges in schema public grant all on sequences to anon, authenticated;
  alter default privileges in schema public grant all on functions to anon, authenticated;
`;

async function insertCustomer(db: PGlite, phone: string | null = "+19095550100"): Promise<string> {
  const { rows } = await db.query<{ id: string }>(
    "insert into customers (name, phone) values ('Test Customer', $1) returning id",
    [phone],
  );
  return rows[0].id;
}

async function insertPaymentRequest(
  db: PGlite,
  customerId: string,
  overrides: { amount_cents?: number; token?: string; status?: string } = {},
): Promise<void> {
  await db.query(
    `insert into payment_requests (customer_id, amount_cents, description, kind, token, status)
     values ($1, $2, 'Brake job deposit', 'deposit', $3, $4)`,
    [
      customerId,
      overrides.amount_cents ?? 5000,
      overrides.token ?? crypto.randomUUID(),
      overrides.status ?? "open",
    ],
  );
}

describe("migrations (PGlite)", { timeout: 60_000 }, () => {
  let db: PGlite;

  beforeAll(async () => {
    db = await newTestDb({ beforeMigrations: EXPOSE_EVERYTHING });
  });

  it("creates every table in public", async () => {
    const { rows } = await db.query<{ relname: string }>(
      "select relname from pg_class where relnamespace = 'public'::regnamespace and relkind = 'r' order by relname",
    );
    expect(rows.map((r) => r.relname)).toEqual([...TABLES].sort());
  });

  it("enables RLS on every table in public", async () => {
    const { rows } = await db.query<{ relname: string }>(
      "select relname from pg_class where relnamespace = 'public'::regnamespace and relkind = 'r' and not relrowsecurity",
    );
    expect(rows).toEqual([]);
  });

  it("creates the storage buckets", async () => {
    const { rows } = await db.query(
      "select id, public, file_size_limit::int as limit, allowed_mime_types from storage.buckets order by id",
    );
    expect(rows).toEqual([
      { id: "portfolio", public: true, limit: 5 * 1024 * 1024, allowed_mime_types: ["image/jpeg"] },
      {
        id: "signed-documents",
        public: false,
        limit: 10 * 1024 * 1024,
        allowed_mime_types: ["application/pdf"],
      },
    ]);
  });

  it("leaves anon and authenticated no table privileges, despite the expose-everything default", async () => {
    const { rows } = await db.query<{ role: string; table: string }>(
      `select r.role, c.relname as table
       from pg_class c, (values ('anon'), ('authenticated')) as r(role)
       where c.relnamespace = 'public'::regnamespace and c.relkind = 'r'
         and has_table_privilege(r.role, c.oid, 'select, insert, update, delete, truncate, references, trigger')`,
    );
    expect(rows).toEqual([]);
  });

  for (const role of ["anon", "authenticated"]) {
    describe(`as ${role}`, () => {
      for (const table of TABLES) {
        it(`can't read or write ${table}`, async () => {
          await db.exec(`set role ${role}`);
          try {
            const read = await db.query(`select * from ${table}`).then(
              (r) => r.rows.length,
              () => "denied",
            );
            expect([0, "denied"]).toContain(read);
            await expect(db.query(`insert into ${table} default values`)).rejects.toThrow();
            await expect(db.query(`delete from ${table}`)).rejects.toThrow();
          } finally {
            await db.exec("reset role");
          }
        });
      }
    });
  }

  it("rejects a non-E.164 phone", async () => {
    await expect(insertCustomer(db, "909-555-0100")).rejects.toThrow(/check constraint/);
    await expect(
      db.query("insert into leads (name, phone) values ('Pat', '(909) 555-0100')"),
    ).rejects.toThrow(/check constraint/);
    await expect(insertCustomer(db, "+19095550100")).resolves.toBeTruthy();
  });

  it("rejects a bad status", async () => {
    const customerId = await insertCustomer(db);
    await expect(insertPaymentRequest(db, customerId, { status: "refunded" })).rejects.toThrow(
      /check constraint/,
    );
    await expect(
      db.query("insert into leads (name, phone, status) values ('Pat', '+19095550100', 'spam')"),
    ).rejects.toThrow(/check constraint/);
    await expect(
      db.query("insert into posts (slug, title, status) values ('p1', 'P1', 'archived')"),
    ).rejects.toThrow(/check constraint/);
  });

  it("rejects amount_cents below 100", async () => {
    const customerId = await insertCustomer(db);
    await expect(insertPaymentRequest(db, customerId, { amount_cents: 99 })).rejects.toThrow(
      /check constraint/,
    );
    await expect(insertPaymentRequest(db, customerId, { amount_cents: 100 })).resolves.toBeUndefined();
  });

  it("rejects a duplicate token", async () => {
    const customerId = await insertCustomer(db);
    await insertPaymentRequest(db, customerId, { token: "same-token" });
    await expect(insertPaymentRequest(db, customerId, { token: "same-token" })).rejects.toThrow(
      /unique/,
    );
  });

  it("requires exactly one target on a link send", async () => {
    await expect(db.query("insert into link_sends (channel) values ('sms')")).rejects.toThrow(
      /check constraint/,
    );
  });

  it("requires published_at on a published post", async () => {
    await expect(
      db.query("insert into posts (slug, title, status) values ('p2', 'P2', 'published')"),
    ).rejects.toThrow(/check constraint/);
  });

  it("allows only one active version per template slug", async () => {
    await db.query(
      "insert into document_templates (slug, name, version, body_md) values ('waiver', 'Waiver', 1, 'v1')",
    );
    await expect(
      db.query(
        "insert into document_templates (slug, name, version, body_md) values ('waiver', 'Waiver', 2, 'v2')",
      ),
    ).rejects.toThrow(/unique/);
    await db.query(
      "insert into document_templates (slug, name, version, body_md, active) values ('waiver', 'Waiver', 2, 'v2', false)",
    );
  });

  it("changes updated_at on update", async () => {
    const { rows } = await db.query<{ id: string }>(
      `insert into customers (name, created_at, updated_at)
       values ('Old Customer', '2020-01-01T00:00:00Z', '2020-01-01T00:00:00Z') returning id`,
    );
    await db.query("update customers set notes = 'Prefers text' where id = $1", [rows[0].id]);
    const { rows: after } = await db.query<{ updated_at: Date; created_at: Date }>(
      "select updated_at, created_at from customers where id = $1",
      [rows[0].id],
    );
    expect(after[0].created_at.toISOString()).toBe("2020-01-01T00:00:00.000Z");
    expect(after[0].updated_at.getTime()).toBeGreaterThan(Date.parse("2025-01-01T00:00:00Z"));
  });
});
