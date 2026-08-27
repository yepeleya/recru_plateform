import type { Metadata } from "next";
import { CvManager } from "@/components/candidat/cv-manager";

export const metadata: Metadata = {
  title: "Mon CV",
  // Espace privé du candidat : jamais indexé.
  robots: { index: false, follow: false },
};

export default function CandidatCvPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
      <CvManager />
    </main>
  );
}
