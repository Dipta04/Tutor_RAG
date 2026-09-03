import { NextResponse } from "next/server";

import { BackendError, callBackend, errorResponse, readJsonBody } from "@/lib/backend";
import { toBase64 } from "@/lib/encoding";
import { createSession, homePathFor } from "@/lib/session";
import type { LoginResponse, SessionUser } from "@/lib/types";

interface LoginBody {
  username?: string;
  password?: string;
}

export async function POST(request: Request) {
  try {
    const { username, password } = await readJsonBody<LoginBody>(request);

    if (!username?.trim() || !password) {
      throw new BackendError("Enter both your username and password.", 400);
    }

    const profile = await callBackend<LoginResponse>({
      path: "/login",
      authorization: `Basic ${toBase64(`${username.trim()}:${password}`)}`,
    });

    const user: SessionUser = {
      username: profile.username ?? username.trim(),
      fullname: profile.fullname || profile.username || username.trim(),
      role: profile.role,
      grade: profile.grade ?? 0,
    };

    await createSession(username.trim(), password, user);

    return NextResponse.json({ user, redirectTo: homePathFor(user.role) });
  } catch (error) {
    if (error instanceof BackendError && error.status === 401) {
      return NextResponse.json(
        { error: "That username and password did not match an account." },
        { status: 401 },
      );
    }
    return errorResponse(error);
  }
}
