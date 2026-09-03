import { NextResponse } from "next/server";

import { callBackend, withSession } from "@/lib/backend";
import type { QuizHistoryResponse } from "@/lib/types";

export async function GET() {
  return withSession(async ({ authorization }) => {
    const data = await callBackend<QuizHistoryResponse>({
      path: "/quiz/history",
      authorization,
    });

    return NextResponse.json({
      message: data.message,
      history: Array.isArray(data.history) ? data.history : [],
    });
  });
}
