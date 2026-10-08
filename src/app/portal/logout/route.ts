import { NextResponse } from "next/server";
import { OWNER_COOKIE } from "@/lib/auth";

// Public by design: logging out needs no session, it only clears the cookie.
export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/portal/login", request.url), 303);
  response.cookies.set(OWNER_COOKIE, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
