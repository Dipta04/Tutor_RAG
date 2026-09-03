"use client";

import { useEffect, useRef, useState } from "react";

import { IconArrowUp } from "@/components/icons";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface ComposerProps {
  onSubmit: (value: string) => void;
  busy: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

const MAX_HEIGHT = 200;

export function Composer({ onSubmit, busy, placeholder, autoFocus }: ComposerProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_HEIGHT)}px`;
  }, [value]);

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || busy) return;
    setValue("");
    onSubmit(trimmed);
  }

  return (
    <div
      className={cn(
        "flex items-end gap-2 rounded-[26px] border border-line bg-surface px-3 py-2.5",
        "transition-colors duration-150 focus-within:border-ink-faint/50",
      )}
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        autoFocus={autoFocus}
        disabled={busy}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
        }}
        placeholder={placeholder ?? "Ask anything about your study material"}
        aria-label="Message"
        className="max-h-[200px] flex-1 resize-none bg-transparent px-1.5 py-1.5 text-[15px] leading-6 text-ink placeholder:text-ink-faint focus:outline-none disabled:opacity-60"
      />

      <button
        type="button"
        onClick={submit}
        disabled={busy || value.trim() === ""}
        aria-label="Send message"
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors",
          "bg-ink text-canvas hover:opacity-90",
          "disabled:bg-surface-hover disabled:text-ink-faint disabled:hover:opacity-100",
        )}
      >
        {busy ? <Spinner className="h-4 w-4" /> : <IconArrowUp className="h-[18px] w-[18px]" />}
      </button>
    </div>
  );
}
