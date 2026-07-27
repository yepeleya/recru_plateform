import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connecte-toi à ton compte Bara.",
  robots: { index: false, follow: false },
};

export default function ConnexionPage() {
  return (
    <main className="bg-stone-50 py-16">
      <div className="mx-auto max-w-md px-4">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">
            Content de te revoir
          </h1>
          <p className="mt-3 text-stone-600">Connecte-toi à ton compte Bara.</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
