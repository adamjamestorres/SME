import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(process.cwd(), "src/app/portal");
const EXCLUDED = new Set(["(auth)/login/actions.ts", "logout/route.ts"]);

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

describe("portal server entry points", () => {
  it("call requireOwner() in every actions.ts and route.ts", () => {
    const files = walk(root)
      .map((f) => f.slice(root.length + 1).replaceAll("\\", "/"))
      .filter((f) => /(^|\/)(actions|route)\.ts$/.test(f) && !EXCLUDED.has(f));
    const missing = files.filter((f) => !readFileSync(join(root, f), "utf8").includes("requireOwner()"));
    expect(missing).toEqual([]);
  });
});
