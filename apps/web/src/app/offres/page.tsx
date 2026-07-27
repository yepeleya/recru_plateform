import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { METIERS, getMetierBySlug } from "@bara/shared-types";
import { DEMO_OFFERS, JOB_TYPE_LABELS, formatBudget } from "@/lib/demo-data";
import { getMetierIcon } from "@/lib/metier-icons";

export const metadata: Metadata = {
  title: "Offres de petits jobs à Abidjan et en Côte d'Ivoire",
  description:
    "Parcours les offres de petits jobs, missions ponctuelles et jobs de vacances à Abidjan : graphisme, livraison, service, ménage… Postule directement sur Bara.",
  alternates: { canonical: "/offres" },
  openGraph: {
    title: "Offres de petits jobs à Abidjan et en Côte d'Ivoire",
    description:
      "Missions ponctuelles, jobs de vacances, temps partiel : les offres publiées par les recruteurs sur Bara.",
    url: "/offres",
  },
};

export default async function OffresPage({
  searchParams,
}: {
  searchParams: Promise<{ metier?: string; type?: string }>;
}) {
  const { metier: metierFilter, type: typeFilter } = await searchParams;

  const offers = DEMO_OFFERS.filter(
    (offer) =>
      offer.status === "published" &&
      (!metierFilter || offer.metierSlug === metierFilter) &&
      (!typeFilter || offer.type === typeFilter)
  );

  const metiersWithOffers = [...new Set(DEMO_OFFERS.map((o) => o.metierSlug))]
    .map((slug) => getMetierBySlug(slug))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  const typesWithOffers = [...new Set(DEMO_OFFERS.map((o) => o.type))];

  function filterHref(next: { metier?: string; type?: string }): string {
    const params = new URLSearchParams();
    const metier = "metier" in next ? next.metier : metierFilter;
    const type = "type" in next ? next.type : typeFilter;
    if (metier) params.set("metier", metier);
    if (type) params.set("type", type);
    const qs = params.toString();
    return qs ? `/offres?${qs}` : "/offres";
  }

  return (
    <main>
      <section className="border-b border-stone-200 bg-brand-light">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h1 className="font-display max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
            Les offres de petits jobs
          </h1>
          <p className="mt-4 max-w-xl text-lg text-stone-700">
            Missions ponctuelles, jobs de vacances, temps partiel : trouve
            l&apos;offre qui te correspond et postule directement.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Aperçu de la plateforme : ces offres sont des exemples. Les vraies
          offres arrivent au lancement —{" "}
          <Link href="/inscription" className="font-semibold underline">
            inscris-toi
          </Link>{" "}
          pour être prêt.
        </div>

        <nav aria-label="Filtrer les offres" className="mt-8 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-stone-500">Métier :</span>
            <Link
              href={filterHref({ metier: undefined })}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium ${!metierFilter ? "border-brand bg-brand text-white" : "border-stone-200 bg-white hover:border-brand"}`}
            >
              Tous
            </Link>
            {metiersWithOffers.map((metier) => {
              const Icon = getMetierIcon(metier.slug);
              return (
                <Link
                  key={metier.slug}
                  href={filterHref({ metier: metier.slug })}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium ${metierFilter === metier.slug ? "border-brand bg-brand text-white" : "border-stone-200 bg-white hover:border-brand"}`}
                >
                  <Icon aria-hidden className="h-4 w-4 shrink-0" />
                  {metier.label}
                </Link>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-stone-500">Type :</span>
            <Link
              href={filterHref({ type: undefined })}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium ${!typeFilter ? "border-accent bg-accent text-white" : "border-stone-200 bg-white hover:border-accent"}`}
            >
              Tous
            </Link>
            {typesWithOffers.map((type) => (
              <Link
                key={type}
                href={filterHref({ type })}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium ${typeFilter === type ? "border-accent bg-accent text-white" : "border-stone-200 bg-white hover:border-accent"}`}
              >
                {JOB_TYPE_LABELS[type] ?? type}
              </Link>
            ))}
          </div>
        </nav>

        {offers.length === 0 ? (
          <p className="mt-12 rounded-xl border border-stone-200 bg-stone-50 p-8 text-center text-stone-600">
            Aucune offre ne correspond à ces filtres pour le moment.{" "}
            <Link href="/offres" className="font-semibold text-brand hover:underline">
              Voir toutes les offres
            </Link>
          </p>
        ) : (
          <ul className="mt-10 grid gap-5 sm:grid-cols-2">
            {offers.map((offer) => {
              const metier = getMetierBySlug(offer.metierSlug);
              const MetierIcon = getMetierIcon(offer.metierSlug);
              return (
                <li key={offer.id}>
                  <Link
                    href={`/offres/${offer.slug}`}
                    className="card-lift flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex items-center gap-1.5 rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand-dark">
                        <MetierIcon aria-hidden className="h-3.5 w-3.5 shrink-0" />
                        {metier?.label}
                      </span>
                      <span className="rounded-full bg-accent-light px-3 py-1 text-xs font-semibold text-accent">
                        {JOB_TYPE_LABELS[offer.type] ?? offer.type}
                      </span>
                    </div>
                    <h2 className="mt-4 text-lg font-bold leading-snug">{offer.title}</h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-600">
                      {offer.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4 text-sm">
                      <span className="inline-flex items-center gap-1 text-stone-500">
                        <MapPin aria-hidden className="h-3.5 w-3.5 shrink-0" />
                        {offer.city}
                        {offer.area ? ` · ${offer.area}` : ""}
                      </span>
                      <span className="font-bold text-brand-dark">{formatBudget(offer)}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
