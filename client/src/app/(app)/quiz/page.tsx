import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { QuizView } from "@/components/quiz/quiz-view";
import { getSessionUser, homePathFor } from "@/lib/session";

export const metadata: Metadata = { title: "Quiz · TutorRAG" };

export default async function QuizPage() {
  const user = await getSessionUser();

  if (!user) redirect("/login");
  if (user.role !== "Student") redirect(homePathFor(user.role));

  return (
    <div className="scrollbar-thin h-full overflow-y-auto scroll-smooth">
      <QuizView />
    </div>
  );
}
