import { afterEach, describe, expect, it, vi } from "vitest";
import { isOwner, sessionValue } from "./auth";

afterEach(() => vi.unstubAllEnvs());

describe("isOwner", () => {
  it("accepts the right cookie and rejects a wrong one", () => {
    vi.stubEnv("OWNER_PASSWORD_HASH", "hash-a");
    expect(isOwner(sessionValue("hash-a"))).toBe(true);
    expect(isOwner(sessionValue("hash-b"))).toBe(false);
    expect(isOwner("short")).toBe(false);
    expect(isOwner(undefined)).toBe(false);
  });

  it("is always false when the hash is unset or empty", () => {
    vi.stubEnv("OWNER_PASSWORD_HASH", "");
    expect(isOwner(sessionValue(""))).toBe(false);
    vi.stubEnv("OWNER_PASSWORD_HASH", undefined);
    expect(isOwner(sessionValue("hash-a"))).toBe(false);
  });

  it("invalidates old cookies when the hash changes", () => {
    vi.stubEnv("OWNER_PASSWORD_HASH", "hash-a");
    const old = sessionValue("hash-a");
    vi.stubEnv("OWNER_PASSWORD_HASH", "hash-b");
    expect(isOwner(old)).toBe(false);
  });
});
