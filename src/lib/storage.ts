import "server-only";
import { mkdir, readFile, writeFile, unlink } from "node:fs/promises";
import { dirname, join } from "node:path";

const isLocal = () => process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_SUPABASE_URL;
const localPath = (bucket: string, path: string) => join(process.cwd(), ".dev-storage", bucket, path);

function supabaseUrl(bucket: string, path: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!base || !key) throw new Error("Supabase storage is not configured");
  return { base, key, url: `${base}/storage/v1/object/${bucket}/${path}` };
}

export async function uploadObject(bucket: string, path: string, bytes: Uint8Array, contentType: string) {
  if (isLocal()) { const target = localPath(bucket, path); await mkdir(dirname(target), { recursive: true }); await writeFile(target, bytes); return { path }; }
  const { url, key } = supabaseUrl(bucket, path);
  const response = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": contentType, "x-upsert": "true" }, body: bytes as unknown as BodyInit });
  if (!response.ok) throw new Error(`Storage upload failed (${response.status})`);
  return { path };
}

export async function downloadObject(bucket: string, path: string): Promise<Uint8Array> {
  if (isLocal()) return new Uint8Array(await readFile(localPath(bucket, path)));
  const { url, key } = supabaseUrl(bucket, path); const response = await fetch(url, { headers: { Authorization: `Bearer ${key}` } });
  if (!response.ok) throw new Error(`Storage download failed (${response.status})`); return new Uint8Array(await response.arrayBuffer());
}

export async function deleteObject(bucket: string, path: string) {
  if (isLocal()) { await unlink(localPath(bucket, path)).catch(() => undefined); return; }
  const { url, key } = supabaseUrl(bucket, path); const response = await fetch(url, { method: "DELETE", headers: { Authorization: `Bearer ${key}` } });
  if (!response.ok) throw new Error(`Storage delete failed (${response.status})`);
}

export async function createSignedUrl(bucket: string, path: string, expiresInSeconds: number) {
  if (isLocal()) return `/api/dev-storage/${bucket}/${path}`;
  const { base, key } = supabaseUrl(bucket, path); const response = await fetch(`${base}/storage/v1/object/sign/${bucket}/${path}`, { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ expiresIn: expiresInSeconds }) });
  if (!response.ok) throw new Error(`Storage signed URL failed (${response.status})`); const data = await response.json() as { signedURL?: string }; return `${base}/storage/v1${data.signedURL}`;
}

export function publicUrl(bucket: string, path: string) {
  if (isLocal()) return `/api/dev-storage/${bucket}/${path}`;
  const { base } = supabaseUrl(bucket, path); return `${base}/storage/v1/object/public/${bucket}/${path}`;
}
