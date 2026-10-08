import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "./contrast";

// Read the tokens straight from globals.css so the test follows color changes (#10).
const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const tokens = Object.fromEntries(
  [...css.matchAll(/--color-([\w-]+):\s*(#[0-9a-f]{3,6})\s*;/gi)].map((m) => [m[1], m[2]]),
);

function token(name: string): string {
  const value = tokens[name];
  if (!value) throw new Error(`Missing hex token --color-${name}`);
  return value;
}

// [text, background] pairs the components put together.
const pairs: [string, string][] = [
  ["fg", "surface"],
  ["muted", "surface"],
  ["fg", "surface-raised"],
  ["muted", "surface-raised"],
  ["brand-ink", "brand"],
  ["brand-ink", "brand-hover"],
  ["success-ink", "success"],
  ["warning-ink", "warning"],
  ["danger-ink", "danger"],
  ["info-ink", "info"],
  // Field error text.
  ["danger", "surface"],
  ["danger", "surface-raised"],
];

describe("contrastRatio", () => {
  it("matches known WCAG values", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#fff", "#fff")).toBeCloseTo(1, 5);
    expect(contrastRatio("#767676", "#ffffff")).toBeCloseTo(4.54, 2);
  });

  it("does not depend on argument order", () => {
    expect(contrastRatio("#f5a524", "#0b0c0e")).toBe(contrastRatio("#0b0c0e", "#f5a524"));
  });

  it("rejects non-hex input", () => {
    expect(() => contrastRatio("red", "#fff")).toThrow();
  });
});

describe("design token contrast", () => {
  it.each(pairs)("%s on %s meets 4.5:1", (text, background) => {
    expect(contrastRatio(token(text), token(background))).toBeGreaterThanOrEqual(4.5);
  });
});
