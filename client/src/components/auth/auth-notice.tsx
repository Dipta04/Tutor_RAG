"use client";

import { useEffect, useState } from "react";

const MESSAGES: Record<string, string> = {
  unavailable: "Google sign-in is not configured on this server yet.",
  cancelled: "Google sign-in was cancelled.",
  state: "That sign-in link expired. Try again.",
  exists: "An account already uses that email. Sign in with your username and password.",
  failed: "Google sign-in did not complete. Try again.",
};

/**
 * Reads the ?google= reason the OAuth callback redirects back with.
 * Uses window.location rather than useSearchParams so the page can stay static.
 */
export function AuthNotice() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const reason = new URLSearchParams(window.location.search).get("google");
    if (reason && MESSAGES[reason]) setMessage(MESSAGES[reason]);
  }, []);

  if (!message) return null;

  return (
    <p
      role="status"
      className="mb-5 rounded-xl border border-line bg-surface px-3.5 py-3 text-center text-[13px] leading-relaxed text-ink-muted"
    >
      {message}
    </p>
  );
}
