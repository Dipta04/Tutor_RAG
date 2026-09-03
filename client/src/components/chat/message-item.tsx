"use client";

import { useEffect, useState } from "react";

import { BrandMark } from "@/components/brand-mark";
import { IconCheck, IconCopy, IconFile } from "@/components/icons";
import { Markdown } from "@/components/markdown";
import { TypingDots } from "@/components/ui/spinner";
import type { ChatMessage } from "@/lib/conversations";
import { cn } from "@/lib/utils";

export function MessageItem({ message }: { message: ChatMessage }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
    } catch {
      // Clipboard blocked by the browser: leave the button state unchanged.
    }
  }

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl bg-surface px-4 py-2.5 text-[15px] leading-[1.6]">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <BrandMark className="mt-0.5" />

      <div className="min-w-0 flex-1">
        {message.pending ? (
          <TypingDots />
        ) : (
          <>
            <div className={cn(message.failed && "text-negative")}>
              {message.failed ? (
                <p className="text-[15px] leading-[1.7]">{message.content}</p>
              ) : (
                <Markdown content={message.content} />
              )}
            </div>

            {message.sources && message.sources.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {message.sources.map((source) => (
                  <span
                    key={source}
                    className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-line bg-surface px-2 py-1 text-[12px] text-ink-muted"
                  >
                    <IconFile className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{source}</span>
                  </span>
                ))}
              </div>
            ) : null}

            {!message.failed ? (
              <button
                type="button"
                onClick={copy}
                aria-label="Copy answer"
                className="mt-2 flex h-7 w-7 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-surface hover:text-ink"
              >
                {copied ? <IconCheck className="h-3.5 w-3.5" /> : <IconCopy className="h-3.5 w-3.5" />}
              </button>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
