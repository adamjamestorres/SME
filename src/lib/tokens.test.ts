import { describe, expect, it } from "vitest";
import { createToken } from "./tokens";

describe("createToken", () => {
  it("returns 43 URL-safe characters", () => {
    expect(createToken()).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it("gives 1,000 unique values in 1,000 calls", () => {
    const tokens = new Set(Array.from({ length: 1000 }, createToken));
    expect(tokens.size).toBe(1000);
  });
});
