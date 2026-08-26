import type { Metadata } from "next";
import { SignupWizard } from "@/components/auth/signup-wizard";

export const metadata: Metadata = {
  title: "Créer un compte",
  description: "Crée ton compte Bara, candidat ou recruteur, en quelques minutes.",
  robots: { index: false, follow: false },
};

export default function InscriptionPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <SignupWizard />
    </main>
  );
}
