import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";

/**
 * A shell for the three policy pages the sign-in card links to.
 *
 * The body text is deliberately not written: a policy has to describe what this
 * deployment actually does with student data, which depends on the school
 * running it. Replace the contents before going live.
 */
export function LegalPage({ title, scope }: { title: string; scope: string }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-5 py-14">
      <Link href="/" className="mb-12 flex items-center gap-2.5">
        <BrandMark />
        <span className="text-[15px] font-semibold tracking-[-0.01em]">TutorRAG</span>
      </Link>

      <h1 className="text-[28px] font-semibold tracking-[-0.03em]">{title}</h1>

      <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
        This page has no policy text yet. {scope}
      </p>

      <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
        Write it against what this deployment actually does before you share TutorRAG with
        students, and have someone qualified review it. Placeholder legal text is worse than none.
      </p>

      <div className="mt-10">
        <Link href="/" className="text-sm text-ink underline underline-offset-4 hover:text-accent">
          Back to home
        </Link>
      </div>
    </div>
  );
}
