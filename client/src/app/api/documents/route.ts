import { NextResponse } from "next/server";

import { BackendError, callBackend, withSession } from "@/lib/backend";
import type { UploadResponse } from "@/lib/types";

const MAX_BYTES = 25 * 1024 * 1024;

export async function POST(request: Request) {
  return withSession(async ({ authorization, user }) => {
    if (user.role !== "Teacher") {
      throw new BackendError("Only teachers can upload study material.", 403);
    }

    let incoming: FormData;
    try {
      incoming = await request.formData();
    } catch {
      throw new BackendError("The upload could not be read. Try again.", 400);
    }

    const file = incoming.get("file");
    const grade = Number(incoming.get("grade"));

    if (!(file instanceof File)) {
      throw new BackendError("Choose a PDF to upload.", 400);
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      throw new BackendError("Only PDF files can be indexed.", 400);
    }

    if (file.size === 0) {
      throw new BackendError("That file is empty.", 400);
    }

    if (file.size > MAX_BYTES) {
      throw new BackendError("That file is larger than 25 MB.", 413);
    }

    if (!Number.isInteger(grade) || grade < 1 || grade > 12) {
      throw new BackendError("Choose a grade between 1 and 12.", 400);
    }

    const outgoing = new FormData();
    outgoing.append("file", file, file.name);
    outgoing.append("grade", String(grade));

    const data = await callBackend<UploadResponse>({
      path: "/upload_docs",
      method: "POST",
      form: outgoing,
      authorization,
    });

    return NextResponse.json(data);
  });
}
