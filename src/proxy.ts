import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  if (process.env.NODE_ENV === "development" && process.env.DEV_OWNER_EMAIL) {
    return NextResponse.next();
  }
  const path = request.nextUrl.pathname;
  if (path === "/portal/login" || path.startsWith("/api/dev-storage")) return NextResponse.next();
  if (path.startsWith("/portal")) {
    const login = new URL("/portal/login", request.url);
    login.searchParams.set("next", path);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/portal/:path*"] };
