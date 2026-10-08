import type { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";
import { newTestDb } from "../../../test/db";
import { withTransaction } from "./transaction";

describe("withTransaction (PGlite)", { timeout: 60_000 }, () => {
  let db: PGlite;

  beforeAll(async () => {
    db = await newTestDb();
  });

  const count = async () =>
    Number((await db.query<{ n: number }>("select count(*)::int as n from stripe_events")).rows[0].n);

  it("commits when fn resolves", async () => {
    const result = await withTransaction(db, async (tx) => {
      await tx.query("insert into stripe_events (id, type) values ('evt_1', 'checkout.session.completed')");
      return "done";
    });
    expect(result).toBe("done");
    expect(await count()).toBe(1);
  });

  it("rolls back and rethrows when fn throws", async () => {
    await expect(
      withTransaction(db, async (tx) => {
        await tx.query("insert into stripe_events (id, type) values ('evt_2', 'payment_intent.payment_failed')");
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");
    expect(await count()).toBe(1);
  });
});
