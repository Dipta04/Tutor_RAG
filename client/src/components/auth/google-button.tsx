"use client";

import { useState } from "react";

interface GoogleButtonProps {
  enabled: boolean;
  label: string;
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45a5.5 5.5 0 0 1-2.39 3.61v3h3.86c2.26-2.08 3.58-5.15 3.58-8.8Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.95-2.91l-3.87-3a7.2 7.2 0 0 1-10.72-3.78H1.36v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.36 14.3a7.2 7.2 0 0 1 0-4.6V6.62H1.36a12 12 0 0 0 0 10.77l4-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.42C17.95 1.19 15.23 0 12 0A12 12 0 0 0 1.36 6.62l4 3.09A7.2 7.2 0 0 1 12 4.75Z"
      />
    </svg>
  );
}

export function GoogleButton({ enabled, label }: GoogleButtonProps) {
  const [notice, setNotice] = useState(false);

  if (enabled) {
    return (
      <a
        href="/api/auth/google"
        className="flex h-12 w-full items-center justify-center gap-3 rounded-full bg-canvas text-sm font-semibold text-ink transition-opacity hover:opacity-90"
      >
        <GoogleGlyph />
        {label}
      </a>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setNotice(true)}
        aria-describedby={notice ? "google-notice" : undefined}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-full bg-canvas text-sm font-semibold text-ink transition-opacity hover:opacity-90"
      >
        <GoogleGlyph />
        {label}
      </button>

      {notice ? (
        <p id="google-notice" role="status" className="mt-2 text-center text-[13px] leading-relaxed text-ink-muted">
          Google sign-in is not connected yet.
        </p>
      ) : null}
    </div>
  );
}
