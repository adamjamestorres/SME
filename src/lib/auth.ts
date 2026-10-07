import "server-only";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db/pool";
import { isOwnerEmail } from "@/lib/owner-emails";

export interface Owner { id: string; email: string }

export async function getOwner(): Promise<Owner | null> {
  const devEmail = process.env.DEV_OWNER_EMAIL?.trim().toLowerCase();
  if (process.env.NODE_ENV === "development" && devEmail) {
    return { id: "dev-owner", email: devEmail };
  }
  if (!process.env.DATABASE_URL || !process.env.SUPABASE_URL) return null;
  return null;
}

export async function requireOwner(): Promise<Owner> {
  const owner = await getOwner();
  if (!owner || !isOwnerEmail(owner.email) && owner.id !== "dev-owner") redirect("/portal/login");
  return owner;
}

export async function countCustomers(): Promise<number> {
  const result = await getDb().query<{ count: string }>("select count(*)::text as count from customers");
  return Number(result.rows[0]?.count ?? 0);
}
