import { cn } from "@/lib/utils";

export function Section({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("mx-auto w-full max-w-6xl px-5 py-24 sm:py-28", className)}>
      {children}
    </section>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={cn("mb-14", align === "center" ? "text-center" : "text-left")}>
      {eyebrow ? <p className="mb-2 text-[13px] text-ink-faint">{eyebrow}</p> : null}
      <h2 className="text-balance text-[28px] font-semibold leading-[1.15] tracking-[-0.03em] sm:text-[38px]">
        {title}
      </h2>
      {subtitle ? (
        <p
          className={cn(
            "mt-3 text-[15px] leading-relaxed text-ink-muted",
            align === "center" ? "mx-auto max-w-xl" : "max-w-xl",
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
