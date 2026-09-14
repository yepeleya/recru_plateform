import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Building2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Contacter l'équipe Bara par email",
  description:
    "Une question, un partenariat, un problème sur la plateforme ? Contactez l'équipe Bara par email.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contacter l'équipe Bara par email",
    description:
      "Une question, un partenariat, un problème sur la plateforme ? Contactez l'équipe Bara.",
    url: "/contact",
  },
};

const CONTACT_EMAIL = "contact@bara.ci"; // à remplacer par l'adresse réelle avant le lancement

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
        On t&apos;écoute
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-stone-700">
        Une question sur la plateforme, une idée, un problème avec ton compte
        ou une proposition de partenariat ? Écris-nous.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <article className="card-lift rounded-2xl border border-stone-200 bg-white p-6">
          <Mail aria-hidden className="h-7 w-7 text-brand" />
          <h2 className="mt-3 text-lg font-semibold">Par email</h2>
          <p className="mt-1 text-sm leading-relaxed text-stone-600">
            Pour toute question générale ou problème de compte.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="mt-3 inline-block font-semibold text-brand hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
        </article>

        <article className="card-lift rounded-2xl border border-stone-200 bg-white p-6">
          <Building2 aria-hidden className="h-7 w-7 text-accent" />
          <h2 className="mt-3 text-lg font-semibold">Partenariats</h2>
          <p className="mt-1 text-sm leading-relaxed text-stone-600">
            Entreprise, agence, supermarché : besoin de personnel en volume ?
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Partenariat%20Bara`}
            className="mt-3 inline-block font-semibold text-accent hover:underline"
          >
            Proposer un partenariat
          </a>
        </article>
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
