import type { Metadata } from "next";

import { IconSignIn, IconUser } from "@/components/icons";
import { AuthorCard } from "@/components/landing/author-card";
import { LandingFooter } from "@/components/landing/footer";
import { GlowLink } from "@/components/landing/glow-link";
import { Hero } from "@/components/landing/hero";
import { LandingNav } from "@/components/landing/nav";
import {
  HistoryPreview,
  ThreadPreview,
} from "@/components/landing/previews";
import { ScreenCarousel } from "@/components/landing/screen-carousel";
import { Section, SectionTitle } from "@/components/landing/section";
import { StarField } from "@/components/landing/star-field";

export const metadata: Metadata = {
  title: "TutorRAG - study from your own course material",
  description:
    "Ask questions about the PDFs your teachers upload, generate quizzes from them, and track what you have learned.",
};

const ANSWER_POINTS = [
  {
    title: "Every answer names its source",
    body: "Replies carry the filename they came from, so you can open the page and check it yourself.",
  },
  {
    title: "Nothing invented from outside",
    body: "Retrieval runs against your grade's documents only. If the material does not cover it, TutorRAG says so instead of guessing.",
  },
  {
    title: "Split by grade",
    body: "A grade 7 student and a grade 11 student searching the same words get answers from their own books.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <LandingNav />

      {/* Full-page star background wrapper (excludes navbar and footer) */}
      <div className="relative flex-1">
        <StarField />
        <div className="light-grid" aria-hidden="true" />

        <Hero />

        <main className="relative">
          <Section id="how-it-works">
            <ScreenCarousel />
          </Section>

          <Section id="answers" className="border-t border-line">
            <SectionTitle
              title="Skip the page-flipping. Ask the book directly."
              subtitle="Every document is split, embedded and indexed, so a question finds the right passage instead of the right chapter."
            />

            <div className="mx-auto max-w-3xl">
              <ThreadPreview />
            </div>

            <div className="mx-auto mt-14 grid max-w-4xl gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
              {ANSWER_POINTS.map((point) => (
                <div key={point.title} className="bg-canvas p-5">
                  <h3 className="text-sm font-medium">{point.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">{point.body}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section className="border-t border-line">
            <SectionTitle title="Why this exists" align="center" />
            <AuthorCard />
          </Section>

          <Section id="progress" className="border-t border-line">
            <SectionTitle
              title="No more guessing what to revise"
              subtitle="Every attempt is kept with the option you picked and the one that was right, so the weak topics are obvious."
            />

            <div className="mx-auto max-w-3xl">
              <HistoryPreview />
            </div>
          </Section>

          <Section className="border-t border-line text-center">
            <h2 className="text-balance text-[28px] font-semibold leading-tight tracking-[-0.03em] sm:text-[36px]">
              Put your syllabus to work
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-ink-muted">
              Create an account, or sign in if your school has already set one up for you.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <GlowLink href="/signup" tone="solid" icon={<IconSignIn className="h-[18px] w-[18px]" />}>
                Create an account
              </GlowLink>
              <GlowLink href="/login" tone="muted" icon={<IconUser className="h-[18px] w-[18px]" />}>
                Sign in
              </GlowLink>
            </div>
          </Section>
        </main>
      </div>

      <LandingFooter />
    </div>
  );
}
