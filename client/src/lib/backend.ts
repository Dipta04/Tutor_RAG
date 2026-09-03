import "server-only";

import { NextResponse } from "next/server";

import { getAuthHeader, getSessionUser } from "./session";
import type { SessionUser } from "./types";

const BACKEND_URL = (process.env.BACKEND_URL ?? "http://127.0.0.1:8000").replace(/\/+$/, "");

export class BackendError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "BackendError";
    this.status = status;
  }
}

/** Turns a FastAPI error body into a single readable sentence. */
async function readErrorMessage(response: Response): Promise<string> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return response.statusText || "The server returned an unexpected response.";
  }

  const detail = (body as { detail?: unknown })?.detail;

  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        const entry = item as { loc?: unknown[]; msg?: string };
        const field = Array.isArray(entry.loc) ? entry.loc[entry.loc.length - 1] : null;
        return field ? `${String(field)}: ${entry.msg ?? "invalid"}` : entry.msg;
      })
      .filter(Boolean);
    if (messages.length > 0) return messages.join(", ");
  }

  return response.statusText || "The server returned an unexpected response.";
}

interface BackendRequest {
  path: string;
  method?: "GET" | "POST";
  json?: unknown;
  form?: FormData;
  authorization?: string | null;
  headers?: Record<string, string>;
}

export async function callBackend<T>({
  path,
  method = "GET",
  json,
  form,
  authorization,
  headers: extraHeaders,
}: BackendRequest): Promise<T> {
  const headers = new Headers();
  if (authorization) headers.set("Authorization", authorization);
  if (json !== undefined) headers.set("Content-Type", "application/json");
  for (const [key, value] of Object.entries(extraHeaders ?? {})) {
    headers.set(key, value);
  }

  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}${path}`, {
      method,
      headers,
      body: form ?? (json !== undefined ? JSON.stringify(json) : undefined),
      cache: "no-store",
    });
  } catch {
    throw new BackendError(
      "Cannot reach the TutorRAG server. Check that it is running and that BACKEND_URL is correct.",
      503,
    );
  }

  if (!response.ok) {
    throw new BackendError(await readErrorMessage(response), response.status);
  }

  if (response.status === 204) return undefined as T;

  try {
    return (await response.json()) as T;
  } catch {
    throw new BackendError("The server returned a response that could not be read.", 502);
  }
}

export function errorResponse(error: unknown): NextResponse {
  if (error instanceof BackendError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error("Unhandled route error:", error);
  return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
}

/**
 * Runs a route handler with the signed-in user's credentials attached,
 * or answers 401 when there is no usable session.
 */
export async function withSession(
  handler: (context: { authorization: string; user: SessionUser }) => Promise<NextResponse>,
): Promise<NextResponse> {
  const authorization = await getAuthHeader();
  const user = await getSessionUser();

  if (!authorization || !user) {
    return NextResponse.json({ error: "Your session has expired. Sign in again." }, { status: 401 });
  }

  try {
    return await handler({ authorization, user });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function readJsonBody<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new BackendError("The request body was not valid JSON.", 400);
  }
}
