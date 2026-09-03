"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { BrandMark } from "@/components/brand-mark";
import { useConversations } from "@/components/conversations-provider";
import { Composer } from "@/components/chat/composer";
import { MessageItem } from "@/components/chat/message-item";
import { Suggestions } from "@/components/chat/suggestions";
import { apiRequest, messageFrom } from "@/lib/api-client";
import { createId } from "@/lib/conversations";
import type { ChatResponse, SessionUser } from "@/lib/types";
import { firstName } from "@/lib/utils";

export function ChatView({ user }: { user: SessionUser }) {
  const { activeId, activeMessages, startConversation, updateMessages } = useConversations();
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const hasMessages = activeMessages.length > 0;

  useEffect(() => {
    if (!hasMessages) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [activeMessages.length, hasMessages]);

  const send = useCallback(
    async (text: string) => {
      const conversationId = activeId ?? startConversation();
      const answerId = createId();

      updateMessages(conversationId, (messages) => [
        ...messages,
        { id: createId(), role: "user", content: text },
        { id: answerId, role: "assistant", content: "", pending: true },
      ]);

      setSending(true);

      try {
        const data = await apiRequest<ChatResponse>("/api/chat", {
          method: "POST",
          body: JSON.stringify({ query: text }),
        });

        updateMessages(conversationId, (messages) =>
          messages.map((message) =>
            message.id === answerId
              ? {
                  ...message,
                  content: data.answer,
                  sources: data.sources,
                  pending: false,
                }
              : message,
          ),
        );
      } catch (error) {
        updateMessages(conversationId, (messages) =>
          messages.map((message) =>
            message.id === answerId
              ? { ...message, content: messageFrom(error), pending: false, failed: true }
              : message,
          ),
        );
      } finally {
        setSending(false);
      }
    },
    [activeId, startConversation, updateMessages],
  );

  if (!hasMessages) {
    return (
      <div className="scrollbar-thin h-full overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full max-w-thread flex-col justify-center px-4 py-10 sm:px-6">
          <div className="mb-8 flex items-center justify-center gap-4">
            <BrandMark className="h-14 w-14 text-2xl" />
            <h1 className="text-[34px] font-semibold tracking-[-0.03em] sm:text-[40px]">
              Hello, {firstName(user.fullname || user.username)}
            </h1>
          </div>

          <Composer onSubmit={send} busy={sending} autoFocus />
          <Suggestions onPick={send} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="scrollbar-thin flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-thread space-y-6 px-4 py-6 sm:px-6">
          {activeMessages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="px-4 pb-5 sm:px-6">
        <div className="mx-auto w-full max-w-thread">
          <Composer onSubmit={send} busy={sending} />
          <p className="mt-2 text-center text-[11px] text-ink-faint">
            Answers come only from the material your teachers have uploaded.
          </p>
        </div>
      </div>
    </div>
  );
}
