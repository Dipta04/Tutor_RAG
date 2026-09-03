import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { HistoryView } from "@/components/history/history-view";
import { getSessionUser, homePathFor } from "@/lib/session";

export const metadata: Metadata = { title: "History · TutorRAG" };

export default async function HistoryPage() {
  const user = await getSessionUser();

  if (!user) redirect("/login");
  if (user.role !== "Student") redirect(homePathFor(user.role));

  return (
    <div className="scrollbar-thin h-full overflow-y-auto">
      <HistoryView />
    </div>
  );
}
