import { NextResponse } from "next/server";

import { BackendError, callBackend, readJsonBody, withSession } from "@/lib/backend";
import type { QuizResponse } from "@/lib/types";

interface QuizBody {
  topic?: string;
  num_questions?: number;
}

export async function POST(request: Request) {
  return withSession(async ({ authorization }) => {
    const body = await readJsonBody<QuizBody>(request);
    const topic = body.topic?.trim();
    const count = Number(body.num_questions ?? 3);

    if (!topic) {
      throw new BackendError("Enter a topic to build questions from.", 400);
    }

    if (!Number.isInteger(count) || count < 1 || count > 10) {
      throw new BackendError("Choose between 1 and 10 questions.", 400);
    }

    const data = await callBackend<QuizResponse>({
      path: "/quiz",
      method: "POST",
      json: { topic, num_questions: count },
      authorization,
    });

    return NextResponse.json(data);
  });
}
