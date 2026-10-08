// Usage: npm run owner:hash-password
// Prompts for the owner password twice (no echo) and prints only the hash.
import { createInterface } from "node:readline";
import { hashPassword } from "../src/lib/password.ts";

const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: process.stdin.isTTY });
const lines = rl[Symbol.asyncIterator]();
let muted = false;
(rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput = (s) => {
  if (!muted) process.stdout.write(s);
};

async function ask(prompt: string): Promise<string> {
  process.stdout.write(prompt);
  muted = true;
  const { value } = await lines.next();
  muted = false;
  process.stdout.write("\n");
  return typeof value === "string" ? value : "";
}

const first = await ask("Password (at least 12 characters): ");
if (first.length < 12) {
  console.error("Password must be at least 12 characters.");
  process.exit(1);
}
const second = await ask("Repeat password: ");
if (first !== second) {
  console.error("Passwords do not match.");
  process.exit(1);
}
rl.close();
console.log(await hashPassword(first));
