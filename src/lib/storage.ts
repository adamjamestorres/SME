import "server-only";

// Thin wrapper over the Supabase Storage REST API, using the secret key. Server code only.

export type Bucket = "portfolio" | "signed-documents";

function config(): { url: string; key: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase Storage is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local (see .env.example).",
    );
  }
  return { url: url.replace(/\/+$/, ""), key };
}

// Encode each path segment but keep the slashes between them.
function encodePath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}

function headers(key: string, extra?: Record<string, string>): Record<string, string> {
  return { apikey: key, Authorization: `Bearer ${key}`, ...extra };
}

async function fail(action: string, bucket: string, path: string, res: Response): Promise<never> {
  // The response body is Supabase's error message; it holds no secrets.
  const detail = await res.text().catch(() => "");
  throw new Error(`Storage ${action} failed for ${bucket}/${path}: ${res.status} ${detail}`.trim());
}

export async function uploadObject(
  bucket: Bucket,
  path: string,
  bytes: Uint8Array | ArrayBuffer | Blob,
  contentType: string,
): Promise<void> {
  const { url, key } = config();
  const res = await fetch(`${url}/storage/v1/object/${bucket}/${encodePath(path)}`, {
    method: "POST",
    headers: headers(key, { "Content-Type": contentType, "x-upsert": "false" }),
    body: bytes as BodyInit,
  });
  if (!res.ok) await fail("upload", bucket, path, res);
}

export async function downloadObject(bucket: Bucket, path: string): Promise<Uint8Array> {
  const { url, key } = config();
  const res = await fetch(`${url}/storage/v1/object/${bucket}/${encodePath(path)}`, {
    headers: headers(key),
  });
  if (!res.ok) await fail("download", bucket, path, res);
  return new Uint8Array(await res.arrayBuffer());
}

export async function deleteObject(bucket: Bucket, path: string): Promise<void> {
  const { url, key } = config();
  const res = await fetch(`${url}/storage/v1/object/${bucket}/${encodePath(path)}`, {
    method: "DELETE",
    headers: headers(key),
  });
  if (!res.ok) await fail("delete", bucket, path, res);
}

/** A time-limited URL for a private object, such as a signed PDF. */
export async function createSignedUrl(
  bucket: Bucket,
  path: string,
  expiresInSeconds: number,
): Promise<string> {
  const { url, key } = config();
  const res = await fetch(`${url}/storage/v1/object/sign/${bucket}/${encodePath(path)}`, {
    method: "POST",
    headers: headers(key, { "Content-Type": "application/json" }),
    body: JSON.stringify({ expiresIn: expiresInSeconds }),
  });
  if (!res.ok) await fail("sign", bucket, path, res);
  const { signedURL } = (await res.json()) as { signedURL: string };
  // Supabase returns a path relative to /storage/v1.
  return `${url}/storage/v1${signedURL}`;
}

/** The public URL of an object in a public bucket (portfolio photos). */
export function publicUrl(bucket: Bucket, path: string): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set. Add it to .env.local (see .env.example).");
  }
  return `${url.replace(/\/+$/, "")}/storage/v1/object/public/${bucket}/${encodePath(path)}`;
}
