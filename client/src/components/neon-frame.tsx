import { cn } from "@/lib/utils";

/**
 * A card wrapped in a soft spectrum border with a matching bloom behind it.
 * The gradient sits on the wrapper; the inner panel covers all but one pixel.
 */
export function NeonFrame({
  className,
  innerClassName,
  children,
}: {
  className?: string;
  innerClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("relative rounded-[26px] p-px", className)}>
      <span aria-hidden="true" className="neon-edge absolute inset-0 rounded-[26px]" />
      <span aria-hidden="true" className="neon-bloom absolute inset-0 rounded-[26px]" />
      <div
        className={cn(
          "relative rounded-[25px] bg-elevated",
          innerClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
