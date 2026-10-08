import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("getPool", () => {
  it("throws a clear error when DATABASE_URL is unset", async () => {
    vi.stubEnv("DATABASE_URL", "");
    const { getPool } = await import("./pool");
    expect(() => getPool()).toThrow(/DATABASE_URL is not set/);
  });

  it("returns the same small pool on every call, without connecting", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://user:pass@127.0.0.1:1/none");
    const { getPool } = await import("./pool");
    const pool = getPool();
    expect(getPool()).toBe(pool);
    expect(pool.options.max).toBe(3);
    expect(pool.totalCount).toBe(0);
    await pool.end();
  });
});

describe("withTransaction (pool.ts)", () => {
  it("refuses a pool, which can't hold a transaction", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://user:pass@127.0.0.1:1/none");
    const { getPool, withTransaction } = await import("./pool");
    const pool = getPool();
    await expect(withTransaction(pool, async () => "x")).rejects.toThrow(/withPoolTransaction/);
    await pool.end();
  });

  it("listens for idle client errors so they don't crash the process", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://user:pass@127.0.0.1:1/none");
    const { getPool } = await import("./pool");
    const pool = getPool();
    expect(pool.listenerCount("error")).toBe(1);
    await pool.end();
  });
});
