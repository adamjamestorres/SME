import { describe, expect, it } from "vitest";
import { site } from "./site";

describe("site config", () => {
  it("has a phone number in E.164 format for tel: links", () => {
    expect(site.phone.tel).toMatch(/^\+1\d{10}$/);
  });

  it("has an absolute site URL", () => {
    const url = new URL(site.url);
    expect(["http:", "https:"]).toContain(url.protocol);
  });
});
