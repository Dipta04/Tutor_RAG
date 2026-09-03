import Link from "next/link";

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: "Twitter",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.5V8.5l6.3 3.5-6.3 3.5z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]">
        <path d="M20.4 20.4h-3.6v-5.6c0-1.3 0-3-1.9-3s-2.1 1.5-2.1 2.9v5.7H9.2V9h3.4v1.6h.1a3.7 3.7 0 0 1 3.4-1.9c3.6 0 4.3 2.4 4.3 5.5v6.2zM5.3 7.4a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2zM7.1 20.4H3.5V9h3.6v11.4z" />
      </svg>
    ),
  },
  {
    label: "Discord",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]">
        <path d="M20.3 4.4A19 19 0 0 0 15.6 3a14 14 0 0 0-.6 1.2 17.6 17.6 0 0 0-5.3 0A12.6 12.6 0 0 0 9 3a19 19 0 0 0-4.7 1.5A19.6 19.6 0 0 0 .9 18.7 19.2 19.2 0 0 0 6.7 21a14.2 14.2 0 0 0 1.2-2 12.4 12.4 0 0 1-2-.9l.5-.4a13.6 13.6 0 0 0 11.6 0l.5.4a12.6 12.6 0 0 1-2 .9 14.2 14.2 0 0 0 1.2 2 19.1 19.1 0 0 0 5.8-2.9A19.5 19.5 0 0 0 20.3 4.4zM8 15.8a2.2 2.2 0 0 1-2-2.3 2.2 2.2 0 0 1 2-2.3 2.2 2.2 0 0 1 2 2.3 2.2 2.2 0 0 1-2 2.3zm7.4 0a2.2 2.2 0 0 1-2-2.3 2.2 2.2 0 0 1 2-2.3 2.2 2.2 0 0 1 2 2.3 2.2 2.2 0 0 1-2 2.3z" />
      </svg>
    ),
  },
];

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms" },
  { href: "/cookies", label: "Cookie Policy" },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-line bg-rail/50">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-5 py-6 sm:flex-row sm:gap-4">
        {/* Social icons */}
        <div className="flex items-center gap-4">
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              aria-label={link.label}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-muted transition-all duration-200 hover:border-ink-faint hover:text-ink hover:shadow-[0_0_12px_rgba(255,255,255,0.08)]"
            >
              {link.icon}
            </a>
          ))}
        </div>

        {/* Copyright + legal */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
          <span className="text-[12px] text-ink-faint">
            © {new Date().getFullYear()} TutorRAG · Developed with{" "}
            <span className="text-[#f0616d]">♥</span>
          </span>
          <div className="flex items-center gap-4">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[12px] text-ink-faint underline decoration-ink-faint/30 underline-offset-2 transition-colors hover:text-ink-muted"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
