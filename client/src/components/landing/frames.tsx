import { cn } from "@/lib/utils";

/** A phone shell used to preview a screen of the app on the landing page. */
export function PhoneFrame({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[22px] border border-line bg-canvas p-1.5 shadow-2xl shadow-black/40",
        className,
      )}
    >
      <div className="flex items-center justify-between px-2.5 pb-1.5 pt-1 text-[8px] text-ink-faint">
        <span>12:19</span>
        <span className="flex items-center gap-1">
          <span className="h-1 w-3 rounded-sm bg-ink-faint/60" />
          <span className="h-1 w-2 rounded-sm bg-ink-faint/60" />
        </span>
      </div>
      <div className="overflow-hidden rounded-[16px] border border-line bg-rail">{children}</div>
    </div>
  );
}

/** A desktop window shell, used for the wider previews. */
export function WindowFrame({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[14px] border border-line bg-canvas shadow-2xl shadow-black/40",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 border-b border-line bg-rail px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
        <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
        <span className="h-2 w-2 rounded-full bg-[#28c840]" />
      </div>
      {children}
    </div>
  );
}
