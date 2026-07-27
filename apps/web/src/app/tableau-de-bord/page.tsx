import type { Metadata } from "next";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

export const metadata: Metadata = {
  title: "Tableau de bord",
  robots: { index: false, follow: false },
};

// Shell provisoire — sera remplacé par le vrai tableau de bord (CV, profil,
// candidatures, messagerie) quand l'authentification et l'API existeront.
export default function TableauDeBordPage() {
  return (
    <main className="flex min-h-[50vh] items-center justify-center bg-stone-50 px-4 py-16">
      <div className="max-w-md rounded-2xl border border-stone-200 bg-white p-10 text-center">
        <LayoutDashboard aria-hidden className="mx-auto h-10 w-10 text-brand" />
        <h1 className="font-display mt-4 text-2xl font-bold">Ton tableau de bord arrive</h1>
        <p className="mt-3 leading-relaxed text-stone-600">
          Ici tu retrouveras bientôt ton CV, ton profil public, tes
          candidatures et tes messages. En attendant, ton brouillon de CV est
          sauvegardé dans l&apos;éditeur.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/creer-un-cv/nouveau"
            className="btn-pop inline-flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white"
          >
            Ouvrir mon CV
          </Link>
          <Link
            href="/connexion"
            className="inline-flex items-center rounded-full border border-stone-300 px-6 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </main>
  );
}
