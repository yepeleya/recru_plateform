import type { Metadata } from "next";
import { SignupWizard } from "@/components/auth/signup-wizard";

export const metadata: Metadata = {
  title: "Créer un compte",
  description: "Crée ton compte Bara, candidat ou recruteur, en quelques minutes.",
  robots: { index: false, follow: false },
};

export default function InscriptionPage() {
  return (
    <main className="bg-stone-50 py-16">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">
            Rejoins Bara
          </h1>
          <p className="mt-3 text-stone-600">
            Candidat ou recruteur, particulier ou entreprise : ton inscription
            s&apos;adapte à ton profil.
          </p>
        </div>
        <SignupWizard />
      </div>
    </main>
  );
}
