import { cn } from "@/lib/utils";

/**
 * The TutorRAG mark: an open book folded into a hexagon shell.
 * Used in the sidebar, the chat greeting, message avatars and the auth cards.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-canvas",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="h-[62%] w-[62%]" aria-hidden="true" focusable="false">
        <path
          d="M12 2.6 20.2 7v10L12 21.4 3.8 17V7Z"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.9}
          strokeLinejoin="round"
        />
        <path
          d="M12 8.4c-1.1-.8-2.3-1.1-3.6-1.1v8.4c1.3 0 2.5.4 3.6 1.1 1.1-.8 2.3-1.1 3.6-1.1V7.3c-1.3 0-2.5.4-3.6 1.1Z"
          fill="currentColor"
        />
      </svg>
      <span className="sr-only">TutorRAG</span>
    </span>
  );
}
