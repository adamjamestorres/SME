import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("accepts the same password and rejects a different one", async () => {
    const plain = `t-${Math.random().toString(36)}-pass`;
    const stored = await hashPassword(plain);
    expect(stored.startsWith("scrypt$32768$8$1$")).toBe(true);
    expect(await verifyPassword(plain, stored)).toBe(true);
    expect(await verifyPassword(`${plain}x`, stored)).toBe(false);
  });

  it("returns false, without throwing, for empty, garbage and truncated values", async () => {
    const stored = await hashPassword("throwaway-password-1");
    for (const bad of [undefined, "", "garbage", "scrypt$1$2", "scrypt$x$y$z$a$b", stored.slice(0, -10), stored.split("$").slice(0, 5).join("$")]) {
      await expect(verifyPassword("throwaway-password-1", bad)).resolves.toBe(false);
    }
  });
});
