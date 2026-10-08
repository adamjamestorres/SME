import { randomBytes } from "node:crypto";

/**
 * An unguessable token for customer links (`/pay/[token]`, `/sign/[token]`): 32 random bytes,
 * base64url-encoded to 43 URL-safe characters. Customer links use tokens, never row IDs.
 */
export function createToken(): string {
  return randomBytes(32).toString("base64url");
}
