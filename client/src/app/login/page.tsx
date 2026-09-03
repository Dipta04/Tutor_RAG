import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";
import { isGoogleEnabled } from "@/lib/google";

// Read at request time so the Google keys can be set without a rebuild.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Sign in · TutorRAG" };

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 py-12">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-[13px] text-ink-muted transition-colors hover:text-ink"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M19 12H5" />
          <path d="m12 19-7-7 7-7" />
        </svg>
        Back to home
      </Link>
      <LoginForm googleEnabled={isGoogleEnabled()} />
    </div>
  );
}
