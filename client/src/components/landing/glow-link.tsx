import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * A pill link with a light that travels around its border.
 *
 * The glow is a large conic-gradient square spinning behind the label; the
 * rounded, clipped wrapper turns it into a moving ring. The dim part of the
 * gradient doubles as the button's hairline border. Rotating a real element
 * avoids @property, so the animation runs in every current browser.
 */
export function GlowLink({
  href,
  tone = "solid",
  size = "default",
  icon,
  className,
  children,
}: {
  href: string;
  tone?: "solid" | "muted";
  size?: "default" | "sm";
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn("glow-pill", size === "sm" && "glow-pill--sm", className)}
    >
      <span aria-hidden="true" className="glow-pill__ring" />
      <span
        className={cn(
          "glow-pill__face",
          tone === "solid" ? "bg-rail text-ink" : "bg-surface text-ink",
        )}
      >
        {icon}
        {children}
      </span>
    </Link>
  );
}