import { readdir, readFile, mkdir, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import { PGlite } from "@electric-sql/pglite";

const dataDir = ".pglite";
if (process.argv.includes("--reset")) await rm(dataDir, { recursive: true, force: true });
await mkdir(dataDir, { recursive: true });
const db = new PGlite(dataDir);
for (const directory of ["supabase/migrations", "supabase/seed"]) {
  const files = (await readdir(directory)).filter((file) => file.endsWith(".sql")).sort();
  for (const file of files) await db.exec(await readFile(`${directory}/${file}`, "utf8"));
}
await db.close();
const child = spawn("pglite-server", ["--db=.pglite", "--host=127.0.0.1", "--port=5433"], { stdio: "inherit", shell: true });
child.on("exit", (code) => process.exit(code ?? 0));
console.log("Local PGlite database listening on postgresql://127.0.0.1:5433/postgres");
