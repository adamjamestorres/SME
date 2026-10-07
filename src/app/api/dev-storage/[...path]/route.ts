import { downloadObject } from "@/lib/storage";

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  if (process.env.NODE_ENV !== "development") return new Response("Not found", { status: 404 });
  const parts = (await params).path;
  if (parts.length < 2) return new Response("Not found", { status: 404 });
  try { const bytes = await downloadObject(parts[0], parts.slice(1).join("/")); return new Response(bytes.buffer as ArrayBuffer); } catch { return new Response("Not found", { status: 404 }); }
}
