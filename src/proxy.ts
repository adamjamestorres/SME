import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE = "__Host-sme_owner";
const PUBLIC_PATHS = new Set(["/portal/login", "/portal/manifest.webmanifest"]);

// Optimistic check only: requireOwner() does the real verification.
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (PUBLIC_PATHS.has(pathname) || /^\/portal\/icons?\//.test(pathname)) {
    return NextResponse.next();
  }
  if (request.cookies.has(COOKIE)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/portal/login";
  url.search = "";
  url.searchParams.set("next", pathname + search);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: "/portal/:path*",
};
