import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Terms of Service · TutorRAG" };

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      scope="It needs to cover who may create an account, what teachers are allowed to upload, and the fact that generated answers and quizzes can be wrong and should be checked against the source."
    />
  );
}
