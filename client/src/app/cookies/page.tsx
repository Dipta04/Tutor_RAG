import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Cookie Policy · TutorRAG" };

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      scope="TutorRAG sets two httpOnly cookies to keep you signed in and one short-lived cookie during Google sign-in. There is no analytics or advertising cookie."
    />
  );
}
