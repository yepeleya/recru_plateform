import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  METIERS,
  METIER_CATEGORIES,
  getMetierBySlug,
  getMetiersByCategorie,
} from "@bara/shared-types";
import { ArrowRight, ChevronRight } from "lucide-react";
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
      {/* Hero SEO */}
      <section className="bg-primary-soft">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
          <nav
            aria-label="Fil d'Ariane"
            className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
          >
            <Link href="/" className="transition-colors hover:text-primary">Accueil</Link>
            <ChevronRight aria-hidden className="h-4 w-4" />
            <Link href="/metiers" className="transition-colors hover:text-primary">Métiers</Link>
            <ChevronRight aria-hidden className="h-4 w-4" />
            <span className="font-semibold text-primary">{metier.label}</span>
          </nav>

          <div className="mt-5 flex items-center gap-4">
            <span
              aria-hidden
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-surface text-primary shadow-sm"
            >
              <MetierIcon className="h-7 w-7" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">
                {categorieInfo?.label}
              </p>
              <h1 className="font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl">
                {`${metier.label} en Côte d'Ivoire`}
              </h1>
            </div>
          </div>

          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {`${metier.blurb} Sur Bara, trouve un profil ${metier.label.toLowerCase()} près de chez toi, ou fais-toi connaître si c'est ton métier.`}
          </p>
        </div>
      </section>

      {/* Contenu */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-lg bg-gradient-to-br from-primary to-primary-hover p-7 text-primary-foreground shadow-sm">
            <h2 className="font-display text-xl font-bold">
              {`Tu es ${metier.label.toLowerCase()} ?`}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-primary-foreground/90">
              Crée ton CV et publie ton profil pour être visible auprès des
              recruteurs qui cherchent ce métier.
            </p>
            <Link
              href="/creer-un-cv"
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-surface px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-surface-2"
            >
              Créer mon profil <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </article>

          <article className="rounded-lg bg-gradient-to-br from-accent to-accent-hover p-7 text-accent-foreground shadow-sm">
            <h2 className="font-display text-xl font-bold">
              {`Tu recherches un·e ${metier.label.toLowerCase()} ?`}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-accent-foreground/90">
              Inscris-toi pour publier une offre ou parcourir les profils
              disponibles sur Bara.
            </p>
            <Link
              href="/inscription"
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-surface px-5 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-surface-2"
            >
              Publier une offre <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </article>
        </div>

        {siblings.length > 0 && (
          <div className="mt-16">
            <h2 className="text-lg font-bold text-foreground">
              Autres métiers en {categorieInfo?.label.toLowerCase()}
            </h2>
            <ul className="mt-4 flex flex-wrap gap-3">
              {siblings.map((sibling) => {
                const SiblingIcon = getMetierIcon(sibling.slug);
                return (
                  <li key={sibling.slug}>
                    <Link
                      href={`/metiers/${sibling.slug}`}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <SiblingIcon aria-hidden className="h-4 w-4 shrink-0 text-primary" />
                      {sibling.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <p className="mt-10 text-sm text-muted-foreground">
          <Link href="/metiers" className="font-medium text-primary hover:underline">
            ← Voir tous les métiers sur Bara
          </Link>
        </p>
      </section>
    </main>
  );
}
