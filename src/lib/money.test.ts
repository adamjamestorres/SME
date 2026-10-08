import { describe, expect, it } from "vitest";
import { formatMoney } from "./money";

describe("formatMoney", () => {
  it.each([
    [0, "$0.00"],
    [100, "$1.00"],
    [125050, "$1,250.50"],
    [100000000, "$1,000,000.00"],
  ])("formats %i cents as %s", (cents, expected) => {
    expect(formatMoney(cents)).toBe(expected);
  });
});
