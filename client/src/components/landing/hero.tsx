import { IconSignIn, IconUser } from "@/components/icons";
import { GlowLink } from "@/components/landing/glow-link";

export function Hero() {
  return (
    <div className="relative overflow-hidden border-b border-line">
      <span aria-hidden="true" className="hero-beam" />

      <div className="relative mx-auto max-w-4xl px-5 pb-32 pt-28 text-center sm:pb-36 sm:pt-36">
        <h1 className="text-balance text-[36px] font-semibold leading-[1.08] tracking-[-0.04em] sm:text-[56px]">
          Study from the <span className="word-chip">books</span> you already have
          <br className="hidden sm:block" /> and quiz yourself on them
        </h1>

        <p className="mx-auto mt-6 max-w-lg text-[15px] leading-relaxed text-ink-muted sm:text-base">
          Your teachers upload the course PDFs. You ask questions, get answers drawn only from
          that material, and turn any topic into practice questions.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <GlowLink href="/signup" tone="solid" icon={<IconSignIn className="h-[18px] w-[18px]" />}>
            Get started
          </GlowLink>
          <GlowLink href="/login" tone="muted" icon={<IconUser className="h-[18px] w-[18px]" />}>
            Sign in
          </GlowLink>
        </div>

        <p className="mt-5 text-[13px] text-ink-faint">
          Free while your school is running it. No card needed.
        </p>
      </div>
    </div>
  );
}