import { NextResponse } from "next/server";

import { BackendError, callBackend, readJsonBody, withSession } from "@/lib/backend";
import type { QuizCheckResponse } from "@/lib/types";

interface CheckBody {
  quiz_id?: string;
  answers?: string[];
}

export async function POST(request: Request) {
  return withSession(async ({ authorization }) => {
    const body = await readJsonBody<CheckBody>(request);

    if (!body.quiz_id || !Array.isArray(body.answers) || body.answers.length === 0) {
      throw new BackendError("Answer every question before submitting.", 400);
    }

    const data = await callBackend<QuizCheckResponse>({
      path: "/quiz/check",
      method: "POST",
      json: { quiz_id: body.quiz_id, answers: body.answers },
      authorization,
    });

    return NextResponse.json(data);
  });
}
