import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Contacter Bara",
  description:
    "Bara n'a pas encore d'adresse de contact publique. Voici comment démarrer sur la plateforme en attendant.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contacter Bara",
    description:
      "Bara n'a pas encore d'adresse de contact publique.",
    url: "/contact",
  },
};

// Aucune adresse email, aucun réseau social et aucune adresse physique ne sont
// affichés tant qu'ils n'existent pas réellement (V22). Aucune coordonnée n'est
// inventée pour remplir la page.
export default function ContactPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
        Nous contacter
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-stone-700">
        Bara n&apos;a pas encore d&apos;adresse de contact publique. Dès
        qu&apos;une adresse existera, elle sera affichée ici.
      </p>

      <div className="mt-10 max-w-md rounded-2xl border border-stone-200 bg-white p-6">
        <MapPin aria-hidden className="h-7 w-7 text-brand" />
        <h2 className="mt-3 text-lg font-semibold">Où nous sommes</h2>
        <p className="mt-1 text-sm leading-relaxed text-stone-600">
          Abidjan, Abobo Dokui — Côte d&apos;Ivoire.
        </p>
      </div>

      <p className="mt-12 text-sm text-stone-500">
        Tu cherches plutôt de l&apos;aide pour démarrer ? Va voir{" "}
        <Link href="/comment-ca-marche" className="font-medium text-brand hover:underline">
          comment ça marche
        </Link>
        .
      </p>
    </main>
  );
}
