import "server-only";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const N = 32768;
const R = 8;
const P = 1;
const KEY_LEN = 64;
const SALT_LEN = 16;
// scrypt needs about 128 * N * r bytes; leave headroom over the 32 MiB default.
const MAXMEM = 128 * N * R * 2;

function derive(plain: string, salt: Buffer, n: number, r: number, p: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(plain, salt, KEY_LEN, { N: n, r, p, maxmem: Math.max(MAXMEM, 256 * n * r) }, (err, key) =>
      err ? reject(err) : resolve(key),
    );
  });
}

/** Returns `scrypt$<N>$<r>$<p>$<salt b64>$<key b64>`. */
export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(SALT_LEN);
  const key = await derive(plain, salt, N, R, P);
  return ["scrypt", N, R, P, salt.toString("base64"), key.toString("base64")].join("$");
}

/** Constant-time check. A malformed or empty `stored` returns false and never throws. */
export async function verifyPassword(plain: string, stored: string | undefined): Promise<boolean> {
  try {
    if (!stored) return false;
    const parts = stored.split("$");
    if (parts.length !== 6 || parts[0] !== "scrypt") return false;
    const [n, r, p] = [parts[1], parts[2], parts[3]].map((v) => Number(v));
    if (![n, r, p].every((v) => Number.isInteger(v) && v > 0)) return false;
    // Refuse absurd parameters from a corrupted value rather than burning memory.
    if (n > 2 ** 20 || r > 32 || p > 16) return false;
    const salt = Buffer.from(parts[4], "base64");
    const expected = Buffer.from(parts[5], "base64");
    if (salt.length === 0 || expected.length !== KEY_LEN) return false;
    const actual = await derive(plain, salt, n, r, p);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
