import { randomBytes } from "node:crypto";

export function createToken(): string {
  return randomBytes(32).toString("base64url");
}
