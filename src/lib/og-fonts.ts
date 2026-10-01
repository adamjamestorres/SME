import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Barlow Condensed for generated images (OG card, icons), matching the site's display font.
// Satori reads .woff but not .woff2.
const fontDir = join(process.cwd(), "node_modules/@fontsource/barlow-condensed/files");

export async function loadOgFonts() {
  const [semibold, extrabold] = await Promise.all([
    readFile(join(fontDir, "barlow-condensed-latin-600-normal.woff")),
    readFile(join(fontDir, "barlow-condensed-latin-800-normal.woff")),
  ]);

  return [
    { name: "Barlow Condensed", data: semibold, weight: 600 as const, style: "normal" as const },
    { name: "Barlow Condensed", data: extrabold, weight: 800 as const, style: "normal" as const },
  ];
}
