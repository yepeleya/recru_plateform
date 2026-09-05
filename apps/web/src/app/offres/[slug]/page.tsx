import type { Metadata } from "next";
import Link from "next/link";
import {
  MapPin,
  Banknote,
  CalendarDays,
  Clock,
  Heart,
  Building2,
  ArrowRight,
  ChevronRight,
  SearchX,
} from "lucide-react";
import { getMetierBySlug } from "@bara/shared-types";
import { getMetierIcon } from "@/lib/metier-icons";
import { formatBudget, jobTypeLabel } from "@/lib/offer-format";
import { getOffers, getOfferBySlug } from "@/lib/data";
import { JobCard, EmptyState } from "@/components/patterns";
import { ApplyButton } from "@/components/applications/apply-button";

// Génère les routes statiques depuis lib/data (jamais lib/mock directement).
export async function generateStaticParams() {
  const offers = await getOffers();
  return offers.map((offer) => ({ slug: offer.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const offer = await getOfferBySlug(slug);
  if (!offer) return { title: "Offre introuvable" };
  return {
    title: offer.title,
    description: offer.description.slice(0, 155),
    // noindex tant que les données sont des exemples (FRONT-1). Passera en index
    // quand les offres viendront de l'API réelle en FRONT-2.
    robots: { index: false, follow: true },
    alternates: { canonical: `/offres/${offer.slug}` },
  };
}

const APPLY_HREF = "/inscription"; // FRONT-1 : contacter/postuler nécessite un compte.

export default async function OffreDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const offer = await getOfferBySlug(slug);

  // État « offre introuvable » — EmptyState du design system (pas de 404 brut).
  if (!offer) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <EmptyState
          icon={SearchX}
          title="Offre introuvable"
          description="Cette offre n'existe pas ou n'est plus disponible."
          action={
            <Link
              href="/offres"
              className="rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Voir toutes les offres
            </Link>
          }
        />
      </main>
    );
  }

  const metier = getMetierBySlug(offer.metierSlug);
  const MetierIcon = getMetierIcon(offer.metierSlug);
  const period = offer.startDate
    ? `${offer.startDate}${offer.endDate ? ` → ${offer.endDate}` : ""}`
    : "Dès que possible";
  const location = `${offer.city}${offer.area ? ` · ${offer.area}` : ""}`;

  const allOffers = await getOffers();
  const rest = allOffers.filter((o) => o.slug !== offer.slug);
  const similar = [
    ...rest.filter((o) => o.metierSlug === offer.metierSlug),
    ...rest.filter((o) => o.metierSlug !== offer.metierSlug),
  ].slice(0, 3);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 pb-28 md:px-6 md:pb-8">
      {/* Fil d'Ariane */}
      <nav
        aria-label="Fil d'Ariane"
        className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
      >
        <Link href="/" className="transition-colors hover:text-primary">Accueil</Link>
        <ChevronRight aria-hidden className="h-4 w-4" />
        <Link href="/offres" className="transition-colors hover:text-primary">Offres</Link>
        <ChevronRight aria-hidden className="h-4 w-4" />
        <Link
          href={`/metiers/${offer.metierSlug}`}
          className="transition-colors hover:text-primary"
        >
          {metier?.label}
        </Link>
        <ChevronRight aria-hidden className="h-4 w-4" />
        <span className="line-clamp-1 font-semibold text-primary">{offer.title}</span>
      </nav>

      {/* Carte hero */}
      <section className="relative mb-8 overflow-hidden rounded-lg border border-border bg-surface p-6 shadow-sm">
        <div
          aria-hidden
          className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/5 blur-3xl"
        />
        <div className="relative">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
              <MetierIcon aria-hidden className="h-3.5 w-3.5 shrink-0" />
              {metier?.label}
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
              {jobTypeLabel(offer.type)}
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {offer.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <MapPin aria-hidden className="h-4 w-4 text-primary" />
              {location}
            </span>
            <span className="inline-flex items-center gap-1.5 font-bold text-primary">
              <Banknote aria-hidden className="h-4 w-4" />
              {formatBudget(offer)}
            </span>
          </div>
        </div>
      </section>

      {/* Grille principale */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Colonne gauche : contenu */}
        <div className="space-y-6 lg:col-span-8">
          <section>
            <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-foreground">
              <span aria-hidden className="h-6 w-1.5 rounded-full bg-primary" />
              À propos de la mission
            </h2>
            <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
              {offer.description}
            </p>
          </section>
        </div>

        {/* Colonne droite : récap sticky */}
        <aside className="lg:col-span-4">
          <div className="space-y-4 rounded-lg border border-border bg-surface p-6 shadow-sm lg:sticky lg:top-24">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Rémunération
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-primary">
                {formatBudget(offer)}
              </p>
            </div>

            <dl className="space-y-3 border-t border-border pt-4 text-sm">
              <RecapRow icon={CalendarDays} label="Type" value={jobTypeLabel(offer.type)} />
              <RecapRow icon={Clock} label="Période" value={period} />
              <RecapRow icon={MapPin} label="Localisation" value={location} />
            </dl>

            <div className="space-y-3 pt-1">
              <ApplyButton offerId={offer.id} offerSlug={offer.slug} className="w-full" />
              <Link
                href={APPLY_HREF}
                className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-primary px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Heart aria-hidden className="h-4 w-4" />
                Enregistrer l'offre
              </Link>
            </div>

            {/* Bloc recruteur — neutre : nom/logo/stats du recruteur ne sont pas
                dans JobOffer (pré-v3). Aucune donnée inventée. */}
            <div className="mt-1 border-t border-border pt-4">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <Building2 aria-hidden className="h-6 w-6" />
                </span>
                <div>
                  <p className="font-semibold text-foreground">Recruteur</p>
                  <p className="text-xs text-muted-foreground">
                    Coordonnées disponibles après contact
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Offres similaires */}
      {similar.length > 0 ? (
        <section className="mt-12 border-t border-border pt-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl font-bold text-foreground">Offres similaires</h2>
            <Link
              href="/offres"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Voir tout <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
          <ul className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {similar.map((o) => (
              <li key={o.id}>
                <JobCard offer={o} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Barre CTA mobile (fixe) */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex items-center gap-3 border-t border-border bg-surface p-4 shadow-lg md:hidden">
        <Link
          href={APPLY_HREF}
          aria-label="Enregistrer l'offre"
          className="rounded-md border border-border p-3 text-primary transition-colors hover:bg-primary-soft"
        >
          <Heart aria-hidden className="h-5 w-5" />
        </Link>
        <ApplyButton
          offerId={offer.id}
          offerSlug={offer.slug}
          label="Postuler maintenant"
          className="flex-1"
        />
      </div>
    </main>
  );
}

function RecapRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="inline-flex items-center gap-1.5 text-muted-foreground">
        <Icon aria-hidden className="h-4 w-4 shrink-0" />
        {label}
      </dt>
      <dd className="text-right font-semibold text-foreground">{value}</dd>
    </div>
  );
}
