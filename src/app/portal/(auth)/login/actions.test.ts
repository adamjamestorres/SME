import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { set, redirect } = vi.hoisted(() => ({
  set: vi.fn(),
  redirect: vi.fn((to: string) => {
    throw new Error(`NEXT_REDIRECT:${to}`);
  }),
}));
vi.mock("next/headers", () => ({ cookies: async () => ({ set }) }));
vi.mock("next/navigation", () => ({ redirect }));

import { OWNER_COOKIE, sessionValue } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { login } from "./actions";

const plain = `throwaway-${Math.random().toString(36).slice(2)}-pw`;
let hash: string;

function form(password: string, next?: string) {
  const f = new FormData();
  f.set("password", password);
  if (next) f.set("next", next);
  return f;
}

beforeEach(async () => {
  set.mockClear();
  redirect.mockClear();
  hash ??= await hashPassword(plain);
  vi.stubEnv("OWNER_PASSWORD_HASH", hash);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe("login action", () => {
  it("sets the cookie and redirects on the right password", async () => {
    await expect(login(undefined, form(plain, "/portal/payments?tab=open"))).rejects.toThrow(
      "NEXT_REDIRECT:/portal/payments?tab=open",
    );
    expect(set).toHaveBeenCalledWith(
      OWNER_COOKIE,
      sessionValue(hash),
      expect.objectContaining({ httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 2592000 }),
    );
  });

  it("falls back to /portal for an unsafe next", async () => {
    await expect(login(undefined, form(plain, "https://evil.com"))).rejects.toThrow("NEXT_REDIRECT:/portal");
  });

  it("sets no cookie, waits about a second and errors on a wrong password", async () => {
    vi.useFakeTimers();
    let done = false;
    const p = login(undefined, form("not-the-password")).then((r) => {
      done = true;
      return r;
    });
    await vi.advanceTimersByTimeAsync(900);
    expect(done).toBe(false);
    await vi.advanceTimersByTimeAsync(200);
    await expect(p).resolves.toEqual({ error: "That password isn't right." });
    expect(set).not.toHaveBeenCalled();
  });
});
