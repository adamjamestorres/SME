import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createSignedUrl,
  deleteObject,
  downloadObject,
  publicUrl,
  uploadObject,
} from "./storage";

const BASE = "https://project.supabase.co";
const KEY = "sb_secret_test";

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", `${BASE}/`);
  vi.stubEnv("SUPABASE_SECRET_KEY", KEY);
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function lastCall() {
  const [url, init] = fetchMock.mock.calls.at(-1)!;
  return { url: String(url), init: init ?? {}, headers: (init?.headers ?? {}) as Record<string, string> };
}

describe("storage", () => {
  it("uploads with the secret key, content type and no upsert", async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
    const bytes = new Uint8Array([1, 2, 3]);
    await uploadObject("portfolio", "posts/abc/photo 1.jpg", bytes, "image/jpeg");

    const { url, init, headers } = lastCall();
    expect(url).toBe(`${BASE}/storage/v1/object/portfolio/posts/abc/photo%201.jpg`);
    expect(init.method).toBe("POST");
    expect(init.body).toBe(bytes);
    expect(headers).toMatchObject({
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "image/jpeg",
      "x-upsert": "false",
    });
  });

  it("downloads an object's bytes", async () => {
    fetchMock.mockResolvedValue(new Response(new Uint8Array([9, 8]), { status: 200 }));
    const bytes = await downloadObject("signed-documents", "abc/doc.pdf");

    expect(lastCall().url).toBe(`${BASE}/storage/v1/object/signed-documents/abc/doc.pdf`);
    expect(lastCall().headers.Authorization).toBe(`Bearer ${KEY}`);
    expect(Array.from(bytes)).toEqual([9, 8]);
  });

  it("deletes an object", async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
    await deleteObject("portfolio", "posts/abc/1.jpg");

    expect(lastCall().url).toBe(`${BASE}/storage/v1/object/portfolio/posts/abc/1.jpg`);
    expect(lastCall().init.method).toBe("DELETE");
  });

  it("creates a signed URL", async () => {
    fetchMock.mockResolvedValue(
      Response.json({ signedURL: "/object/sign/signed-documents/abc/doc.pdf?token=t" }),
    );
    const url = await createSignedUrl("signed-documents", "abc/doc.pdf", 300);

    expect(lastCall().url).toBe(`${BASE}/storage/v1/object/sign/signed-documents/abc/doc.pdf`);
    expect(lastCall().init.method).toBe("POST");
    expect(JSON.parse(String(lastCall().init.body))).toEqual({ expiresIn: 300 });
    expect(url).toBe(`${BASE}/storage/v1/object/sign/signed-documents/abc/doc.pdf?token=t`);
  });

  it("builds a public URL without a request", () => {
    expect(publicUrl("portfolio", "posts/abc/1.jpg")).toBe(
      `${BASE}/storage/v1/object/public/portfolio/posts/abc/1.jpg`,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("throws with the status when Supabase returns an error", async () => {
    fetchMock.mockResolvedValue(new Response('{"message":"The resource already exists"}', { status: 409 }));
    await expect(
      uploadObject("portfolio", "posts/abc/1.jpg", new Uint8Array([1]), "image/jpeg"),
    ).rejects.toThrow(/upload failed for portfolio\/posts\/abc\/1\.jpg: 409/);
  });

  it("fails loudly when it isn't configured", async () => {
    vi.stubEnv("SUPABASE_SECRET_KEY", "");
    await expect(deleteObject("portfolio", "x.jpg")).rejects.toThrow(/not configured/);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
