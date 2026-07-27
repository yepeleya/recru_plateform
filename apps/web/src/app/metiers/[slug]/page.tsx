import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  METIERS,
  METIER_CATEGORIES,
  getMetierBySlug,
  getMetiersByCategorie,
} from "@bara/shared-types";
import { ArrowRight } from "lucide-react";
import { buildMetierDescription, buildMetierTitle } from "@/lib/metier-seo";
import { getMetierIcon } from "@/lib/metier-icons";

export function generateStaticParams() {
  return METIERS.map((metier) => ({ slug: metier.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const metier = getMetierBySlug(slug);
  if (!metier) return {};

  const title = buildMetierTitle(metier);
  const description = buildMetierDescription(metier);

  return {
    title,
    description,
    alternates: { canonical: `/metiers/${metier.slug}` },
    openGraph: { title, description, url: `/metiers/${metier.slug}` },
  };
}

export default async function MetierPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const metier = getMetierBySlug(slug);
  if (!metier) notFound();

  const categorieInfo = METIER_CATEGORIES.find((c) => c.slug === metier.categorie);
  const siblings = getMetiersByCategorie(metier.categorie).filter((m) => m.slug !== metier.slug);
  const MetierIcon = getMetierIcon(metier.slug);

  return (
    <main>
      <section className="border-b border-stone-200 bg-brand-light">
        <div className="mx-auto max-w-3xl px-4 py-14">
          <nav aria-label="Fil d'Ariane" className="text-sm text-stone-600">
            <Link href="/" className="hover:text-brand">
              Accueil
            </Link>{" "}
            <span aria-hidden>/</span>{" "}
            <Link href="/metiers" className="hover:text-brand">
              Métiers
            </Link>{" "}
            <span aria-hidden>/</span> <span className="text-ink">{metier.label}</span>
          </nav>

          <div className="mt-4 flex items-center gap-4">
            <span
              aria-hidden
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-light text-brand-dark"
            >
              <MetierIcon className="h-7 w-7" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-dark">
                {categorieInfo?.label}
              </p>
              <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">{metier.label} en Côte d&apos;Ivoire</h1>
            </div>
          </div>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-stone-700">
            {metier.blurb} Sur Bara, trouve un profil {metier.label.toLowerCase()}{" "}
            près de chez toi, ou fais-toi connaître si c&apos;est ton métier.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-2">
          <article className="card-lift rounded-2xl bg-gradient-to-br from-brand to-brand-dark p-7 text-white">
            <h2 className="font-display text-xl font-bold">
              Tu es {metier.label.toLowerCase()} ?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/90">
              Crée ton CV et publie ton profil pour être visible auprès des
              recruteurs qui cherchent ce métier.
            </p>
            <Link
              href="/creer-un-cv"
              className="btn-pop mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand-dark"
            >
              Créer mon profil <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </article>

          <article className="card-lift rounded-2xl bg-gradient-to-br from-accent to-violet-800 p-7 text-white">
            <h2 className="font-display text-xl font-bold">
              Tu recherches un·e {metier.label.toLowerCase()} ?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/90">
              Inscris-toi pour publier une offre ou parcourir les profils
              disponibles sur Bara.
            </p>
            <Link
              href="/inscription"
              className="btn-pop mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-accent"
            >
              Publier une offre <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </article>
        </div>

        {siblings.length > 0 && (
          <div className="mt-16">
            <h2 className="text-lg font-bold text-stone-900">
              Autres métiers en {categorieInfo?.label.toLowerCase()}
            </h2>
            <ul className="mt-4 flex flex-wrap gap-3">
              {siblings.map((sibling) => {
                const SiblingIcon = getMetierIcon(sibling.slug);
                return (
                  <li key={sibling.slug}>
                    <Link
                      href={`/metiers/${sibling.slug}`}
                      className="card-lift flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium hover:border-brand"
                    >
                      <SiblingIcon aria-hidden className="h-4 w-4 shrink-0 text-brand" />
                      {sibling.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <p className="mt-10 text-sm text-stone-500">
          <Link href="/metiers" className="font-medium text-brand hover:underline">
            ← Voir tous les métiers sur Bara
          </Link>
        </p>
      </section>
    </main>
  );
}
