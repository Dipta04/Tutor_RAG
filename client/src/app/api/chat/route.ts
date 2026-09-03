import { NextResponse } from "next/server";

import { BackendError, callBackend, readJsonBody, withSession } from "@/lib/backend";
import type { ChatResponse } from "@/lib/types";

export async function POST(request: Request) {
  return withSession(async ({ authorization }) => {
    const { query } = await readJsonBody<{ query?: string }>(request);

    if (!query?.trim()) {
      throw new BackendError("Type a question first.", 400);
    }

    const data = await callBackend<ChatResponse>({
      path: "/chat",
      method: "POST",
      json: { query: query.trim() },
      authorization,
    });

    return NextResponse.json({
      answer: data.answer,
      sources: Array.isArray(data.sources) ? data.sources : [],
    });
  });
}
