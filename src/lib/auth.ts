import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const OWNER_COOKIE = "__Host-sme_owner";
export const OWNER_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

/**
 * The cookie value is derived from the stored hash, never the password, so a
 * new hash invalidates every existing cookie.
 */
export function sessionValue(hash: string): string {
  return createHash("sha256").update(`sme-owner:${hash}`).digest("hex");
}

export function isOwner(cookieValue: string | undefined): boolean {
  const hash = process.env.OWNER_PASSWORD_HASH;
  if (!hash || !cookieValue) return false;
  const expected = Buffer.from(sessionValue(hash));
  const given = Buffer.from(cookieValue);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/** Call in the portal layout and in every portal server action and route handler. */
export async function requireOwner(): Promise<void> {
  const store = await cookies();
  if (!isOwner(store.get(OWNER_COOKIE)?.value)) redirect("/portal/login");
}
