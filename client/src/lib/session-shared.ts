/**
 * Session values shared by the Edge middleware and the Node route handlers.
 * Nothing here may import next/headers or server-only.
 */
import { fromBase64Url } from "./encoding";
import type { SessionUser, UserRole } from "./types";

export const AUTH_COOKIE = "tutorrag_auth";
export const USER_COOKIE = "tutorrag_user";

export function parseSessionUser(cookieValue: string): SessionUser | null {
  try {
    const parsed = JSON.parse(fromBase64Url(cookieValue)) as Partial<SessionUser>;
    if (typeof parsed.username !== "string" || typeof parsed.role !== "string") {
      return null;
    }
    return {
      username: parsed.username,
      fullname: parsed.fullname || parsed.username,
      role: parsed.role as UserRole,
      grade: typeof parsed.grade === "number" ? parsed.grade : 0,
    };
  } catch {
    return null;
  }
}

export function homePathFor(role: UserRole | undefined): string {
  return role === "Teacher" ? "/documents" : "/chat";
}
