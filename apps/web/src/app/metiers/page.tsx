import type { Metadata } from "next";
import Link from "next/link";
import { METIER_CATEGORIES, METIERS, getMetiersByCategorie } from "@bara/shared-types";
import { getMetierIcon } from "@/lib/metier-icons";

export const metadata: Metadata = {
  title: "Tous les métiers de petits jobs en Côte d'Ivoire",
  description:
    "Découvre les 34 métiers couverts par Bara en Côte d'Ivoire : maison, transport, restauration, artisanat, création digitale et plus. Trouve ou propose un service.",
  alternates: { canonical: "/metiers" },
  openGraph: {
    title: "Tous les métiers de petits jobs en Côte d'Ivoire",
    description:
      "Découvre les 34 métiers couverts par Bara en Côte d'Ivoire : maison, transport, restauration, artisanat, création digitale et plus.",
    url: "/metiers",
  },
};

export default function MetiersIndexPage() {
  return (
    <main>
      <section className="border-b border-stone-200 bg-brand-light">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h1 className="font-display max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
            Tous les métiers, un seul endroit
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-stone-700">
            {METIERS.length} métiers déjà couverts par Bara en Côte
            d&apos;Ivoire, du renfort à domicile à la création de contenu.
            Choisis un métier pour trouver un profil ou faire connaître le
            tien.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="space-y-14">
          {METIER_CATEGORIES.map((categorie) => (
            <div key={categorie.slug}>
              <h2 className="font-display text-2xl font-bold">
                {categorie.label}
              </h2>
              <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {getMetiersByCategorie(categorie.slug).map((metier) => {
                  const Icon = getMetierIcon(metier.slug);
                  return (
                    <li key={metier.slug}>
                      <Link
                        href={`/metiers/${metier.slug}`}
                        className="card-lift flex items-center gap-2.5 rounded-xl border border-stone-200 bg-white px-4 py-3.5 text-sm font-medium hover:border-brand"
                      >
                        <Icon aria-hidden className="h-4.5 w-4.5 shrink-0 text-brand" />
                        {metier.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
