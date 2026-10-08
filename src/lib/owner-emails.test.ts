import { afterEach, describe, expect, it, vi } from "vitest";
import { isOwnerEmail, ownerEmails } from "./owner-emails";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("ownerEmails", () => {
  it("trims, lowercases and drops blanks", () => {
    vi.stubEnv("OWNER_EMAILS", " Owner@Example.com, ,second@example.com ,, ");
    expect(ownerEmails()).toEqual(["owner@example.com", "second@example.com"]);
  });

  it("is empty when OWNER_EMAILS is empty or unset", () => {
    vi.stubEnv("OWNER_EMAILS", "");
    expect(ownerEmails()).toEqual([]);
    vi.stubEnv("OWNER_EMAILS", undefined);
    expect(ownerEmails()).toEqual([]);
  });
});

describe("isOwnerEmail", () => {
  it("matches in any letter case and ignores surrounding spaces", () => {
    vi.stubEnv("OWNER_EMAILS", "owner@example.com");
    expect(isOwnerEmail("OWNER@example.COM")).toBe(true);
    expect(isOwnerEmail(" owner@example.com ")).toBe(true);
    expect(isOwnerEmail("someone@example.com")).toBe(false);
  });

  it("rejects blanks and everyone when the list is empty", () => {
    vi.stubEnv("OWNER_EMAILS", " , ");
    expect(isOwnerEmail("owner@example.com")).toBe(false);
    expect(isOwnerEmail("")).toBe(false);
    expect(isOwnerEmail(null)).toBe(false);
  });
});
