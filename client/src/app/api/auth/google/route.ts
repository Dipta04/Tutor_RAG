import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { OAUTH_STATE_COOKIE, buildAuthorizeUrl, readGoogleConfig } from "@/lib/google";

export async function GET(request: Request) {
  const config = readGoogleConfig();
  const origin = new URL(request.url).origin;

  if (!config || !process.env.INTERNAL_API_KEY) {
    return NextResponse.redirect(new URL("/login?google=unavailable", origin));
  }

  const state = randomUUID();
  const response = NextResponse.redirect(buildAuthorizeUrl(config, state));

  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });

  return response;
}
