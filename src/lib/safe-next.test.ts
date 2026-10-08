import { describe, expect, it } from "vitest";
import { safeNextPath } from "./safe-next";

describe("safeNextPath", () => {
  it.each(["https://evil.com", "//evil.com", "/\\evil.com", "/other", "/portal//evil.com", "/portalx", undefined, 5])(
    "rejects %s",
    (input) => expect(safeNextPath(input)).toBe("/portal"),
  );

  it.each(["/portal", "/portal/payments?tab=open", "/portal/customers/12"])("keeps %s", (input) =>
    expect(safeNextPath(input)).toBe(input),
  );
});
