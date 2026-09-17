import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Contacter Bara",
  description:
    "Joindre l'équipe Bara par téléphone. Bara n'a pas encore d'adresse email publique.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contacter Bara",
    description: "Joindre l'équipe Bara par téléphone.",
    url: "/contact",
  },
};

// Uniquement des coordonnées réelles (V22) : pas d'adresse email tant qu'il n'y
// en a pas, pas de réseaux sociaux, pas d'adresse postale inventée.
export default function ContactPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
        Nous contacter
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-stone-700">
        Une question sur la plateforme, une idée, un problème avec ton compte
        ou une proposition de partenariat ? Appelle-nous.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <article className="card-lift rounded-2xl border border-stone-200 bg-white p-6">
          <Phone aria-hidden className="h-7 w-7 text-brand" />
          <h2 className="mt-3 text-lg font-semibold">Par téléphone</h2>
          <p className="mt-1 text-sm leading-relaxed text-stone-600">
            Pour toute question générale, un problème de compte ou un
            partenariat.
          </p>
          <a
            href="tel:+2250708239807"
            className="mt-3 inline-block font-semibold text-brand hover:underline"
          >
            07 08 23 98 07
          </a>
        </article>

        <article className="card-lift rounded-2xl border border-stone-200 bg-white p-6">
          <MapPin aria-hidden className="h-7 w-7 text-accent" />
          <h2 className="mt-3 text-lg font-semibold">Où nous sommes</h2>
          <p className="mt-1 text-sm leading-relaxed text-stone-600">
            Abidjan, Abobo Dokui — Côte d&apos;Ivoire.
          </p>
        </article>
      </div>

      <p className="mt-10 text-sm text-stone-500">
        Bara n&apos;a pas encore d&apos;adresse email publique. Dès qu&apos;une
        adresse existera, elle sera affichée ici.
      </p>

      <p className="mt-6 text-sm text-stone-500">
        Tu cherches plutôt de l&apos;aide pour démarrer ? Va voir{" "}
        <Link href="/comment-ca-marche" className="font-medium text-brand hover:underline">
          comment ça marche
        </Link>
        .
      </p>
    </main>
  );
}
