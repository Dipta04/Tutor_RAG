import { NextResponse } from "next/server";

import { BackendError, callBackend, errorResponse, readJsonBody } from "@/lib/backend";

interface SignupBody {
  role?: string;
  fullname?: string;
  email?: string;
  username?: string;
  password?: string;
  school?: string;
  grade?: number;
}

export async function POST(request: Request) {
  try {
    const body = await readJsonBody<SignupBody>(request);
    const role = body.role === "Teacher" ? "Teacher" : "Student";

    const shared = {
      fullname: body.fullname?.trim() ?? "",
      email: body.email?.trim() ?? "",
      username: body.username?.trim() ?? "",
      password: body.password ?? "",
      school: body.school?.trim() ?? "",
    };

    if (!shared.fullname || !shared.email || !shared.username || !shared.password || !shared.school) {
      throw new BackendError("Fill in every field before creating the account.", 400);
    }

    if (role === "Student" && !(typeof body.grade === "number" && body.grade >= 1 && body.grade <= 12)) {
      throw new BackendError("Choose a grade between 1 and 12.", 400);
    }

    const payload = role === "Student" ? { ...shared, grade: body.grade } : shared;

    const result = await callBackend<{ message: string }>({
      path: role === "Student" ? "/signup/student" : "/signup/teacher",
      method: "POST",
      json: payload,
    });

    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
