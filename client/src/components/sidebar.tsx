"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { BrandMark } from "@/components/brand-mark";
import { useConversations } from "@/components/conversations-provider";
import {
  IconChat,
  IconChevronDown,
  IconCompose,
  IconHistory,
  IconLibrary,
  IconLogout,
  IconQuiz,
  IconSearch,
  IconTrash,
} from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { apiRequest } from "@/lib/api-client";
import type { SessionUser } from "@/lib/types";
import { cn, initials } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: (props: { className?: string }) => React.ReactElement;
}

const studentNav: NavItem[] = [
  { href: "/chat", label: "Chat", icon: IconChat },
  { href: "/quiz", label: "Quiz", icon: IconQuiz },
  { href: "/history", label: "History", icon: IconHistory },
];

const teacherNav: NavItem[] = [
  { href: "/documents", label: "Documents", icon: IconLibrary },
];

export function Sidebar({ user, onNavigate }: { user: SessionUser; onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { conversations, activeId, startConversation, selectConversation, deleteConversation } =
    useConversations();

  const [search, setSearch] = useState("");
  const [showChats, setShowChats] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  const isStudent = user.role === "Student";
  const navItems = isStudent ? studentNav : teacherNav;

  const visibleChats = useMemo(() => {
    const term = search.trim().toLowerCase();
    const withMessages = conversations.filter((conversation) => conversation.messages.length > 0);
    if (!term) return withMessages;
    return withMessages.filter((conversation) =>
      conversation.title.toLowerCase().includes(term),
    );
  }, [conversations, search]);

  function openNewChat() {
    startConversation();
    onNavigate?.();
    if (pathname !== "/chat") router.push("/chat");
  }

  function openChat(id: string) {
    selectConversation(id);
    onNavigate?.();
    if (pathname !== "/chat") router.push("/chat");
  }

  async function signOut() {
    setSigningOut(true);
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
    } catch {
      // Signing out locally is still the right outcome.
    }
    window.location.assign("/login");
  }

  return (
    <div className="flex h-full flex-col bg-rail">
      <div className="flex items-center gap-2.5 px-4 pb-3 pt-4">
        <BrandMark />
        <span className="text-[15px] font-semibold tracking-[-0.01em]">TutorRAG</span>
      </div>

      {isStudent ? (
        <div className="px-3">
          <button
            type="button"
            onClick={openNewChat}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface"
          >
            <IconCompose className="h-[18px] w-[18px]" />
            New chat
          </button>

          <div className="relative mt-1">
            <IconSearch className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search chats"
              aria-label="Search chats"
              className="w-full rounded-lg bg-transparent py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint transition-colors hover:bg-surface focus:bg-surface focus:outline-none"
            />
          </div>
        </div>
      ) : null}

      <nav className="mt-2 space-y-0.5 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                active ? "bg-surface text-ink" : "text-ink-muted hover:bg-surface hover:text-ink",
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {isStudent ? (
        <div className="mt-4 flex min-h-0 flex-1 flex-col px-3">
          <button
            type="button"
            onClick={() => setShowChats((value) => !value)}
            aria-expanded={showChats}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-ink-faint transition-colors hover:text-ink-muted"
          >
            <IconChevronDown
              className={cn("h-3.5 w-3.5 transition-transform", showChats ? "" : "-rotate-90")}
            />
            Chats
          </button>

          {showChats ? (
            <div className="scrollbar-thin mt-0.5 min-h-0 flex-1 overflow-y-auto pb-2">
              {visibleChats.length === 0 ? (
                <p className="px-2.5 py-2 text-[13px] leading-relaxed text-ink-faint">
                  {search ? "No chats match that search." : "Your chats will be listed here."}
                </p>
              ) : (
                visibleChats.map((conversation) => (
                  <div key={conversation.id} className="group relative">
                    <button
                      type="button"
                      onClick={() => openChat(conversation.id)}
                      title={conversation.title}
                      className={cn(
                        "w-full truncate rounded-lg py-2 pl-2.5 pr-9 text-left text-[13px] transition-colors",
                        conversation.id === activeId && pathname === "/chat"
                          ? "bg-surface text-ink"
                          : "text-ink-muted hover:bg-surface hover:text-ink",
                      )}
                    >
                      {conversation.title}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteConversation(conversation.id)}
                      aria-label={`Delete chat: ${conversation.title}`}
                      className="absolute right-1.5 top-1/2 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-surface-hover hover:text-negative focus-visible:flex group-hover:flex"
                    >
                      <IconTrash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="flex-1" />
          )}
        </div>
      ) : (
        <div className="flex-1" />
      )}

      <div className="border-t border-line p-3">
        <div className="flex items-center gap-2.5 rounded-xl bg-surface px-2.5 py-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-white">
            {initials(user.fullname || user.username)}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[13px] font-medium">{user.fullname || user.username}</p>
            <p className="truncate text-[11px] text-ink-faint">
              {isStudent ? `Student, grade ${user.grade}` : "Teacher"}
            </p>
          </div>
          <ThemeToggle />
          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            title="Sign out"
            aria-label="Sign out"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink disabled:opacity-50"
          >
            <IconLogout className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
