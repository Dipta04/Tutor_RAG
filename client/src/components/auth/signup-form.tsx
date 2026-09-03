"use client";

import Link from "next/link";
import { useState } from "react";

import { AuthNotice } from "@/components/auth/auth-notice";
import { GoogleButton } from "@/components/auth/google-button";
import { BrandMark } from "@/components/brand-mark";
import { NeonFrame } from "@/components/neon-frame";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, Select, TextInput } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { apiRequest, messageFrom } from "@/lib/api-client";
import type { UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";

const GRADES = Array.from({ length: 12 }, (_, index) => index + 1);
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function SignupForm({ googleEnabled }: { googleEnabled: boolean }) {
  const [role, setRole] = useState<UserRole>("Student");
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState(1);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function validate(): string | null {
    if (fullname.trim().length < 2) return "Enter your full name.";
    if (!EMAIL_PATTERN.test(email.trim())) return "Enter a valid email address.";
    if (username.trim().length < 3) return "Usernames need at least 3 characters.";
    if (password.length < 6) return "Passwords need at least 6 characters.";
    if (school.trim().length < 2) return "Enter the name of your school.";
    return null;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;

    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    setBusy(true);
    setError(null);

    try {
      await apiRequest("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          role,
          fullname: fullname.trim(),
          email: email.trim(),
          username: username.trim(),
          password,
          school: school.trim(),
          ...(role === "Student" ? { grade } : {}),
        }),
      });
      setDone(true);
    } catch (caught) {
      setError(messageFrom(caught));
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <NeonFrame className="w-full max-w-[380px]" innerClassName="px-5 py-6 text-center sm:px-6 sm:py-6">
        <BrandMark className="mx-auto h-[50px] w-[50px] ring-1 ring-line" />
        <h1 className="mt-4 text-[22px] font-semibold tracking-[-0.02em]">Account created</h1>
        <p className="mt-2 text-[13px] text-ink-muted">
          Sign in with your new username and password to get started.
        </p>
        <Link href="/login" className="mt-5 block">
          <Button variant="primary" size="lg" className="h-10 w-full rounded-full text-[13px]">
            Go to sign in
          </Button>
        </Link>
      </NeonFrame>
    );
  }

  return (
    <NeonFrame className="w-full max-w-[380px]" innerClassName="px-5 py-6 sm:px-6 sm:py-6">
      <div className="mb-6 flex flex-col items-center">
        <BrandMark className="h-[50px] w-[50px] ring-1 ring-line" />
        <h1 className="mt-4 text-[22px] font-semibold tracking-[-0.02em]">Create your account</h1>
        <p className="mt-1 text-[13px] text-ink-muted">Start studying from your own material.</p>
      </div>

      <AuthNotice />

      <GoogleButton enabled={googleEnabled} label="Sign up with Google" />

      <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wider text-ink-faint">
        <span className="h-px flex-1 bg-line" />
        or
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl border border-line bg-surface p-1">
        {(["Student", "Teacher"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setRole(option)}
            aria-pressed={role === option}
            className={cn(
              "rounded-lg py-2 text-sm font-medium transition-colors",
              role === option ? "bg-ink text-canvas" : "text-ink-muted hover:text-ink",
            )}
          >
            {option}
          </button>
        ))}
      </div>

      {error ? <Alert tone="error" className="mb-4">{error}</Alert> : null}

      <form onSubmit={submit} className="space-y-3" noValidate>
        <Field label="Full name" htmlFor="fullname">
          <TextInput
            id="fullname"
            autoComplete="name"
            value={fullname}
            onChange={(event) => setFullname(event.target.value)}
            required
          />
        </Field>

        <Field label="Email" htmlFor="email">
          <TextInput
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </Field>

        <Field label="Username" htmlFor="new-username">
          <TextInput
            id="new-username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </Field>

        <Field label="Password" htmlFor="new-password" hint="At least 6 characters.">
          <TextInput
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </Field>

        <Field label="School" htmlFor="school">
          <TextInput
            id="school"
            value={school}
            onChange={(event) => setSchool(event.target.value)}
            required
          />
        </Field>

        {role === "Student" ? (
          <Field label="Grade" htmlFor="grade">
            <Select
              id="grade"
              value={grade}
              onChange={(event) => setGrade(Number(event.target.value))}
            >
              {GRADES.map((value) => (
                <option key={value} value={value}>
                  Grade {value}
                </option>
              ))}
            </Select>
          </Field>
        ) : null}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="h-10 w-full rounded-full text-[13px]"
          disabled={busy}
        >
          {busy ? <Spinner /> : null}
          Create account
        </Button>
      </form>

      <p className="mt-5 border-t border-line pt-4 text-center text-[13px] text-ink-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-ink underline underline-offset-4 hover:text-accent">
          Sign in
        </Link>
      </p>
    </NeonFrame>
  );
}
