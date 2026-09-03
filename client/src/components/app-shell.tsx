"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { BrandMark } from "@/components/brand-mark";
import { ConversationsProvider } from "@/components/conversations-provider";
import { IconClose, IconMenu } from "@/components/icons";
import { Sidebar } from "@/components/sidebar";
import type { SessionUser } from "@/lib/types";

export function AppShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <ConversationsProvider username={user.username}>
      <div className="flex h-dvh overflow-hidden bg-canvas">
        <aside className="hidden w-[260px] shrink-0 border-r border-line md:block">
          <Sidebar user={user} />
        </aside>

        {mobileOpen ? (
          <div className="fixed inset-0 z-40 md:hidden">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-black/60"
            />
            <aside className="absolute left-0 top-0 h-full w-[270px] border-r border-line">
              <Sidebar user={user} onNavigate={() => setMobileOpen(false)} />
            </aside>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-12 items-center gap-2 border-b border-line px-3 md:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface hover:text-ink"
            >
              {mobileOpen ? <IconClose className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
            </button>
            <BrandMark className="h-6 w-6 text-xs" />
            <span className="text-sm font-semibold">TutorRAG</span>
          </header>

          <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
        </div>
      </div>
    </ConversationsProvider>
  );
}
