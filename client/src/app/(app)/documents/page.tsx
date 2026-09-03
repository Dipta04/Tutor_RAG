import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { UploadView } from "@/components/documents/upload-view";
import { getSessionUser, homePathFor } from "@/lib/session";

export const metadata: Metadata = { title: "Documents · TutorRAG" };

export default async function DocumentsPage() {
  const user = await getSessionUser();

  if (!user) redirect("/login");
  if (user.role !== "Teacher") redirect(homePathFor(user.role));

  return (
    <div className="scrollbar-thin h-full overflow-y-auto">
      <UploadView />
    </div>
  );
}
