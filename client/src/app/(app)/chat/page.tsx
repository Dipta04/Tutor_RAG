import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ChatView } from "@/components/chat/chat-view";
import { getSessionUser, homePathFor } from "@/lib/session";

export const metadata: Metadata = { title: "Chat · TutorRAG" };

export default async function ChatPage() {
  const user = await getSessionUser();

  if (!user) redirect("/login");
  if (user.role !== "Student") redirect(homePathFor(user.role));

  return <ChatView user={user} />;
}
