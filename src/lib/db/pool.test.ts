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
