"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthNotice } from "@/components/auth/auth-notice";
import { GoogleButton } from "@/components/auth/google-button";
import { BrandMark } from "@/components/brand-mark";
import { NeonFrame } from "@/components/neon-frame";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { apiRequest, messageFrom } from "@/lib/api-client";

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    setError(null);

    try {
      const data = await apiRequest<{ redirectTo: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      router.replace(data.redirectTo);
      router.refresh();
    } catch (caught) {
      setError(messageFrom(caught));
      setBusy(false);
    }
  }

  function fillDemo(role: "student" | "teacher") {
    if (role === "student") {
      setUsername("dk123");
      setPassword("123456");
    } else {
      setUsername("dh123");
      setPassword("123456");
    }
  }

  return (
    <NeonFrame className="w-full max-w-[380px]" innerClassName="px-5 py-6 sm:px-6 sm:py-6">
      <div className="flex flex-col items-center">
        <BrandMark className="h-[50px] w-[50px] ring-1 ring-line" />
        <h1 className="mt-4 text-[22px] font-semibold tracking-[-0.02em]">Welcome</h1>
        <p className="mt-1 text-[13px] text-ink-muted">Sign in to your account.</p>
      </div>

      <div className="mt-6">
        <AuthNotice />

        {error ? <Alert tone="error" className="mb-5">{error}</Alert> : null}

        <GoogleButton enabled={googleEnabled} label="Sign in with Google" />

        <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wider text-ink-faint">
          <span className="h-px flex-1 bg-line" />
          or
          <span className="h-px flex-1 bg-line" />
        </div>

        <div className="mb-5 flex justify-center gap-3 text-[13px]">
          <span className="text-ink-muted">Demo accounts:</span>
          <button
            type="button"
            onClick={() => fillDemo("student")}
            className="font-medium text-accent hover:underline"
          >
            Student
          </button>
          <span className="text-ink-faint">/</span>
          <button
            type="button"
            onClick={() => fillDemo("teacher")}
            className="font-medium text-accent hover:underline"
          >
            Teacher
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field label="Username" htmlFor="username">
            <TextInput
              id="username"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </Field>

          <Field label="Password" htmlFor="password">
            <TextInput
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </Field>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="h-10 w-full rounded-full text-[13px]"
            disabled={busy || !username.trim() || !password}
          >
            {busy ? <Spinner /> : null}
            Sign in
          </Button>
        </form>

        <p className="mt-5 text-center text-[12px] leading-relaxed text-ink-faint">
          By signing in, you agree to our{" "}
          <Link href="/privacy" className="font-semibold text-ink-muted hover:text-ink">
            Privacy Policy
          </Link>
          ,{" "}
          <Link href="/terms" className="font-semibold text-ink-muted hover:text-ink">
            Terms of Service
          </Link>
          , and{" "}
          <Link href="/cookies" className="font-semibold text-ink-muted hover:text-ink">
            Cookie Policy
          </Link>
          .
        </p>
      </div>

      <p className="mt-5 border-t border-line pt-4 text-center text-[13px] text-ink-muted">
        No account yet?{" "}
        <Link href="/signup" className="text-ink underline underline-offset-4 hover:text-accent">
          Create one
        </Link>
      </p>
    </NeonFrame>
  );
}
