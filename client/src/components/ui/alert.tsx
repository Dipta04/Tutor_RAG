import { IconAlert, IconCheck } from "@/components/icons";
import { cn } from "@/lib/utils";

interface AlertProps {
  tone: "error" | "success";
  children: React.ReactNode;
  className?: string;
}

export function Alert({ tone, children, className }: AlertProps) {
  const Icon = tone === "error" ? IconAlert : IconCheck;

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm",
        tone === "error"
          ? "border-negative/30 bg-negative/10 text-negative"
          : "border-positive/30 bg-positive/10 text-positive",
        className,
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span className="text-ink">{children}</span>
    </div>
  );
}
