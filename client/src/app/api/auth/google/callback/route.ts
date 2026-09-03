import { NextResponse, type NextRequest } from "next/server";

import { BackendError, callBackend } from "@/lib/backend";
import {
  OAUTH_STATE_COOKIE,
  exchangeCodeForIdToken,
  readGoogleConfig,
  readIdTokenClaims,
} from "@/lib/google";
import { createSession, homePathFor } from "@/lib/session";
import type { SessionUser, UserRole } from "@/lib/types";

interface ExchangeResponse {
  username: string;
  password: string;
  fullname: string;
  role: UserRole;
  grade: number;
}

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const failure = (reason: string) =>
    NextResponse.redirect(new URL(`/login?google=${reason}`, origin));

  const config = readGoogleConfig();
  const internalKey = process.env.INTERNAL_API_KEY;

  if (!config || !internalKey) return failure("unavailable");
  if (request.nextUrl.searchParams.get("error")) return failure("cancelled");

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const expectedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    return failure("state");
  }

  try {
    const idToken = await exchangeCodeForIdToken(config, code);
    const profile = readIdTokenClaims(idToken);

    const credentials = await callBackend<ExchangeResponse>({
      path: "/auth/google",
      method: "POST",
      json: { email: profile.email, name: profile.name, google_id: profile.sub },
      headers: { "X-Internal-Key": internalKey },
    });

    const user: SessionUser = {
      username: credentials.username,
      fullname: credentials.fullname || credentials.username,
      role: credentials.role,
      grade: credentials.grade ?? 0,
    };

    await createSession(credentials.username, credentials.password, user);

    const response = NextResponse.redirect(new URL(homePathFor(user.role), origin));
    response.cookies.set(OAUTH_STATE_COOKIE, "", { path: "/", maxAge: 0 });
    return response;
  } catch (error) {
    if (error instanceof BackendError && error.status === 409) {
      return failure("exists");
    }
    console.error("Google sign-in failed:", error);
    return failure("failed");
  }
}
