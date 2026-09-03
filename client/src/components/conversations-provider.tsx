"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  type ChatMessage,
  type Conversation,
  createId,
  loadConversations,
  saveConversations,
  titleFrom,
} from "@/lib/conversations";

interface ConversationsValue {
  conversations: Conversation[];
  activeId: string | null;
  activeMessages: ChatMessage[];
  ready: boolean;
  startConversation: () => string;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  updateMessages: (id: string, updater: (messages: ChatMessage[]) => ChatMessage[]) => void;
}

const ConversationsContext = createContext<ConversationsValue | null>(null);

export function ConversationsProvider({
  username,
  children,
}: {
  username: string;
  children: React.ReactNode;
}) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    setConversations(loadConversations(username));
    setActiveId(null);
    setReady(true);
    hydrated.current = true;
  }, [username]);

  useEffect(() => {
    if (!hydrated.current) return;
    saveConversations(username, conversations);
  }, [conversations, username]);

  const startConversation = useCallback(() => {
    const id = createId();
    setConversations((current) => [
      { id, title: "New chat", messages: [], updatedAt: Date.now() },
      ...current,
    ]);
    setActiveId(id);
    return id;
  }, []);

  const selectConversation = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations((current) => current.filter((conversation) => conversation.id !== id));
    setActiveId((current) => (current === id ? null : current));
  }, []);

  const updateMessages = useCallback(
    (id: string, updater: (messages: ChatMessage[]) => ChatMessage[]) => {
      setConversations((current) => {
        const next = current.map((conversation) => {
          if (conversation.id !== id) return conversation;

          const messages = updater(conversation.messages);
          const firstUserMessage = messages.find((message) => message.role === "user");

          return {
            ...conversation,
            messages,
            title: firstUserMessage ? titleFrom(firstUserMessage.content) : conversation.title,
            updatedAt: Date.now(),
          };
        });

        return [...next].sort((a, b) => b.updatedAt - a.updatedAt);
      });
    },
    [],
  );

  const value = useMemo<ConversationsValue>(() => {
    const active = conversations.find((conversation) => conversation.id === activeId) ?? null;
    return {
      conversations,
      activeId,
      activeMessages: active?.messages ?? [],
      ready,
      startConversation,
      selectConversation,
      deleteConversation,
      updateMessages,
    };
  }, [
    conversations,
    activeId,
    ready,
    startConversation,
    selectConversation,
    deleteConversation,
    updateMessages,
  ]);

  return (
    <ConversationsContext.Provider value={value}>{children}</ConversationsContext.Provider>
  );
}

export function useConversations(): ConversationsValue {
  const context = useContext(ConversationsContext);
  if (!context) {
    throw new Error("useConversations must be used inside ConversationsProvider");
  }
  return context;
}
