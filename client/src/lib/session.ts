import "server-only";

import { cookies } from "next/headers";

import { fromBase64Url, toBase64, toBase64Url } from "./encoding";
import { AUTH_COOKIE, USER_COOKIE, parseSessionUser } from "./session-shared";
import type { SessionUser } from "./types";

export { AUTH_COOKIE, USER_COOKIE, homePathFor, parseSessionUser } from "./session-shared";

const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE_SECONDS,
};

/** Returns the value for an Authorization header, or null when signed out. */
export async function getAuthHeader(): Promise<string | null> {
  const stored = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!stored) return null;

  try {
    return `Basic ${toBase64(fromBase64Url(stored))}`;
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const stored = (await cookies()).get(USER_COOKIE)?.value;
  if (!stored) return null;
  return parseSessionUser(stored);
}

export async function createSession(
  username: string,
  password: string,
  user: SessionUser,
): Promise<void> {
  const store = await cookies();
  store.set(AUTH_COOKIE, toBase64Url(`${username}:${password}`), cookieOptions);
  store.set(USER_COOKIE, toBase64Url(JSON.stringify(user)), cookieOptions);
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.set(AUTH_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  store.set(USER_COOKIE, "", { ...cookieOptions, maxAge: 0 });
}
