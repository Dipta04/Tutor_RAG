"use client";

import { IconBolt } from "@/components/icons";

export const SUGGESTIONS = [
  {
    title: "Explain a concept",
    detail: "photosynthesis, in simple terms",
    prompt: "Explain photosynthesis in simple terms.",
  },
  {
    title: "Summarise a chapter",
    detail: "the key points on cell division",
    prompt: "Summarise the key points of the chapter on cell division.",
  },
  {
    title: "Work through an example",
    detail: "solving a quadratic equation step by step",
    prompt: "Give me a worked example of solving a quadratic equation, step by step.",
  },
  {
    title: "Check my understanding",
    detail: "mitosis compared with meiosis",
    prompt: "What is the difference between mitosis and meiosis?",
  },
];

export function Suggestions({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <div className="mt-10">
      <div className="mb-1 flex items-center gap-1.5 px-1 text-[13px] text-ink-muted">
        <IconBolt className="h-4 w-4" />
        Suggested
      </div>

      <div className="grid gap-0.5 sm:grid-cols-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion.title}
            type="button"
            onClick={() => onPick(suggestion.prompt)}
            className="rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-surface"
          >
            <span className="block text-[15px] font-medium text-ink">{suggestion.title}</span>
            <span className="block text-[13px] text-ink-muted">{suggestion.detail}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
