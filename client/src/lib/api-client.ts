"use client";

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Calls one of the Next.js route handlers under /api.
 * Credentials never leave the server: they live in an httpOnly cookie that
 * the route handler forwards to FastAPI.
 */
export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(path, {
      ...init,
      headers:
        init.body instanceof FormData
          ? init.headers
          : { "Content-Type": "application/json", ...init.headers },
    });
  } catch {
    throw new ApiError("Network request failed. Check your connection.", 0);
  }

  if (response.status === 401 && !path.startsWith("/api/auth/")) {
    window.location.assign("/login");
    throw new ApiError("Your session has expired. Sign in again.", 401);
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      (payload as { error?: string } | null)?.error ??
      "The request failed. Try again.";
    throw new ApiError(message, response.status);
  }

  return payload as T;
}

export function messageFrom(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Try again.";
}
