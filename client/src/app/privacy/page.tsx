import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Privacy Policy · TutorRAG" };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      scope="It needs to cover the account details stored in MongoDB, the chat and quiz history kept against each student, the uploaded PDFs, and the questions sent to Google and Groq for embedding and generation."
    />
  );
}
