import { NextResponse, type NextRequest } from "next/server";

import { AUTH_COOKIE, USER_COOKIE, homePathFor, parseSessionUser } from "@/lib/session-shared";

const PROTECTED_PREFIXES = ["/chat", "/quiz", "/history", "/documents"];
const GUEST_ONLY_PATHS = ["/", "/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE)?.value;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!token && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && GUEST_ONLY_PATHS.includes(pathname)) {
    const rawUser = request.cookies.get(USER_COOKIE)?.value;
    const user = rawUser ? parseSessionUser(rawUser) : null;
    return NextResponse.redirect(new URL(homePathFor(user?.role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/chat/:path*",
    "/quiz/:path*",
    "/history/:path*",
    "/documents/:path*",
  ],
};
