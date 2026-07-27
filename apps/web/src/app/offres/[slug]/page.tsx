import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMetierBySlug } from "@bara/shared-types";
import {
  DEMO_OFFERS,
  JOB_TYPE_LABELS,
  formatBudget,
  getDemoOfferBySlug,
} from "@/lib/demo-data";
import { getMetierIcon } from "@/lib/metier-icons";

export function generateStaticParams() {
  return DEMO_OFFERS.map((offer) => ({ slug: offer.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const offer = getDemoOfferBySlug(slug);
  if (!offer) return {};
  return {
    title: offer.title,
    description: offer.description.slice(0, 155),
    // noindex tant que les données sont des exemples — passer en index quand
    // les offres viendront de la base de données réelle.
    robots: { index: false, follow: true },
    alternates: { canonical: `/offres/${offer.slug}` },
  };
}

export default async function OffreDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const offer = getDemoOfferBySlug(slug);
  if (!offer) notFound();

  const metier = getMetierBySlug(offer.metierSlug);
  const MetierIcon = getMetierIcon(offer.metierSlug);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <nav aria-label="Fil d'Ariane" className="text-sm text-stone-600">
        <Link href="/" className="hover:text-brand">
          Accueil
        </Link>{" "}
        <span aria-hidden>/</span>{" "}
        <Link href="/offres" className="hover:text-brand">
          Offres
        </Link>{" "}
        <span aria-hidden>/</span> <span className="text-ink">{offer.title}</span>
      </nav>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Link
          href={`/metiers/${offer.metierSlug}`}
          className="flex items-center gap-1.5 rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand-dark hover:bg-brand hover:text-white"
        >
          <MetierIcon aria-hidden className="h-3.5 w-3.5 shrink-0" />
          {metier?.label}
        </Link>
        <span className="rounded-full bg-accent-light px-3 py-1 text-xs font-semibold text-accent">
          {JOB_TYPE_LABELS[offer.type] ?? offer.type}
        </span>
      </div>

      <h1 className="font-display mt-4 text-3xl font-bold leading-tight sm:text-4xl">
        {offer.title}
      </h1>

      <dl className="mt-6 grid gap-4 rounded-2xl border border-stone-200 bg-stone-50 p-6 sm:grid-cols-3">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">Lieu</dt>
          <dd className="mt-1 font-semibold">
            {offer.city}
            {offer.area ? ` · ${offer.area}` : ""}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Rémunération
          </dt>
          <dd className="mt-1 font-semibold text-brand-dark">{formatBudget(offer)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Période
          </dt>
          <dd className="mt-1 font-semibold">
            {offer.startDate
              ? `${offer.startDate}${offer.endDate ? ` → ${offer.endDate}` : ""}`
              : "Dès que possible"}
          </dd>
        </div>
      </dl>

      <section className="mt-8">
        <h2 className="font-display text-xl font-bold">Description de la mission</h2>
        <p className="mt-3 leading-relaxed text-stone-700">{offer.description}</p>
      </section>

      <section className="mt-10 rounded-3xl bg-gradient-to-br from-brand to-brand-dark p-8 text-center text-white">
        <h2 className="font-display text-2xl font-bold">Cette offre t&apos;intéresse ?</h2>
        <p className="mx-auto mt-2 max-w-md text-white/90">
          Crée ton compte et ton CV pour postuler dès l&apos;ouverture des
          candidatures sur Bara.
        </p>
        <Link
          href="/inscription"
          className="btn-pop mt-5 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 font-semibold text-brand-dark"
        >
          Créer mon compte <span aria-hidden>→</span>
        </Link>
      </section>

      <p className="mt-8 text-sm">
        <Link href="/offres" className="font-medium text-brand hover:underline">
          ← Voir toutes les offres
        </Link>
      </p>
    </main>
  );
}
