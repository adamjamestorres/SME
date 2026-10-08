"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { OWNER_COOKIE, OWNER_COOKIE_MAX_AGE, sessionValue } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { safeNextPath } from "@/lib/safe-next";

export type LoginState = { error?: string } | undefined;

// Public by design: this is the login itself, so there is no requireOwner().
export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const password = formData.get("password");
  const next = safeNextPath(formData.get("next"));
  const hash = process.env.OWNER_PASSWORD_HASH;

  // Start the 1-second penalty up front so a wrong guess always takes at least that long.
  const penalty = new Promise((resolve) => setTimeout(resolve, 1000));
  const ok = typeof password === "string" && password.length > 0 && (await verifyPassword(password, hash));
  if (!ok || !hash) {
    await penalty;
    return { error: "That password isn't right." };
  }

  (await cookies()).set(OWNER_COOKIE, sessionValue(hash), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: OWNER_COOKIE_MAX_AGE,
  });
  redirect(next);
}
