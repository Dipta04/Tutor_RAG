import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-current border-t-transparent",
        "h-4 w-4 align-[-2px]",
        className,
      )}
    />
  );
}

export function TypingDots() {
  return (
    <span className="flex items-center gap-1 py-1" aria-label="Generating answer">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-ink-muted"
          style={{ animationDelay: `${index * 160}ms` }}
        />
      ))}
    </span>
  );
}
