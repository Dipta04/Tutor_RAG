"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  ChatPreview,
  QuizPreview,
  UploadPreview,
} from "@/components/landing/previews";

const CARDS = [
  {
    label: "Ask",
    description:
      "Questions answered from the chapter, with the file named underneath.",
    preview: ChatPreview,
  },
  {
    label: "Practise",
    description:
      "Any topic becomes multiple-choice questions, marked the moment you submit.",
    preview: QuizPreview,
  },
  {
    label: "Upload",
    description:
      "Teachers drop in a PDF and pick the grade that can search it.",
    preview: UploadPreview,
  },
];

/** A sparkle star SVG used as a decorative element. */
function Sparkle({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
    </svg>
  );
}

export function ScreenCarousel() {
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % CARDS.length);
    }, 4000);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  const goTo = (index: number) => {
    setActive(index);
    resetTimer();
  };

  return (
    <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-start lg:gap-16">
      {/* Left column — eyebrow & title */}
      <div className="shrink-0 text-center lg:max-w-[320px] lg:pt-8 lg:text-left">
        <p className="mb-3 flex items-center justify-center gap-2 text-[13px] text-ink-faint lg:justify-start">
          <Sparkle className="h-3.5 w-3.5 text-amber-400" />
          The modern way to
        </p>
        <h2 className="text-balance text-[28px] font-semibold leading-[1.15] tracking-[-0.03em] sm:text-[38px]">
          Three screens, one set of books
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-ink-muted lg:mx-0">
          Teachers add the material. Students ask, practise and review — all
          against the same indexed documents.
        </p>
      </div>

      {/* Right column — sliding cards */}
      <div className="flex w-full max-w-[640px] flex-1 flex-col items-center">
        {/* Card viewport */}
        <div className="relative w-full overflow-hidden rounded-2xl border border-line bg-surface/40 p-6 sm:p-8">
          {/* inner glow */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent" />

          <div className="relative">
            {/* sliding strip */}
            <div
              className="flex transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{ transform: `translateX(-${active * 100}%)` }}
            >
              {CARDS.map((card) => (
                <div
                  key={card.label}
                  className="flex w-full shrink-0 flex-col items-center gap-5"
                >
                  <card.preview />
                  <div className="text-center">
                    <span className="block text-sm font-medium text-ink">
                      {card.label}
                    </span>
                    <p className="mt-1 max-w-[260px] text-[13px] leading-relaxed text-ink-muted">
                      {card.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dot indicators */}
        <div className="mt-6 flex items-center gap-2">
          {CARDS.map((card, index) => (
            <button
              key={card.label}
              type="button"
              aria-label={`Show ${card.label}`}
              onClick={() => goTo(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === active
                  ? "w-6 bg-accent"
                  : "w-2 bg-ink-faint/40 hover:bg-ink-faint/60"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
