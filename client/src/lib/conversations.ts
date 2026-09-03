"use client";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  pending?: boolean;
  failed?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
}

const MAX_CONVERSATIONS = 40;

export function storageKey(username: string): string {
  return `tutorrag:chats:${username}`;
}

export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function titleFrom(text: string): string {
  const clean = text.trim().replace(/\s+/g, " ");
  if (clean.length <= 44) return clean || "New chat";
  return `${clean.slice(0, 44).trimEnd()}...`;
}

function isConversation(value: unknown): value is Conversation {
  const candidate = value as Conversation;
  return (
    !!candidate &&
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    Array.isArray(candidate.messages)
  );
}

export function loadConversations(username: string): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(username));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(isConversation)
      .map((conversation) => ({
        ...conversation,
        updatedAt: conversation.updatedAt || Date.now(),
        messages: conversation.messages.map((message) => ({
          ...message,
          pending: false,
        })),
      }))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export function saveConversations(username: string, conversations: Conversation[]): void {
  if (typeof window === "undefined") return;
  try {
    const trimmed = conversations.slice(0, MAX_CONVERSATIONS);
    window.localStorage.setItem(storageKey(username), JSON.stringify(trimmed));
  } catch {
    // Quota exceeded or storage disabled: chats stay in memory for this session.
  }
}
