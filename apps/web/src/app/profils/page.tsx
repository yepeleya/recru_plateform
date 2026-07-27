import type { Metadata } from "next";
import Link from "next/link";
import { getMetierBySlug } from "@bara/shared-types";
import { DEMO_PROFILES, JOB_TYPE_LABELS } from "@/lib/demo-data";
import { getMetierIcon } from "@/lib/metier-icons";

export const metadata: Metadata = {
  title: "Trouver un prestataire disponible en Côte d'Ivoire",
  description:
    "Parcours les profils prêts à travailler à Abidjan : graphistes, chauffeurs, ménagères, électriciens… Filtre par métier et disponibilité immédiate sur Bara.",
  alternates: { canonical: "/profils" },
  openGraph: {
    title: "Trouver un prestataire disponible en Côte d'Ivoire",
    description:
      "Des profils prêts à travailler, filtrables par métier et disponibilité immédiate : la base de candidats Bara.",
    url: "/profils",
  },
};

export default async function ProfilsPage({
  searchParams,
}: {
  searchParams: Promise<{ metier?: string; dispo?: string }>;
}) {
  const { metier: metierFilter, dispo } = await searchParams;
  const onlyAvailable = dispo === "maintenant";

  const profiles = DEMO_PROFILES.filter(
    (profile) =>
      profile.isVisible &&
      (!metierFilter || profile.metierSlug === metierFilter) &&
      (!onlyAvailable || profile.isAvailableNow)
  );

  const metiersWithProfiles = [...new Set(DEMO_PROFILES.map((p) => p.metierSlug))]
    .map((slug) => getMetierBySlug(slug))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  function filterHref(next: { metier?: string; dispo?: boolean }): string {
    const params = new URLSearchParams();
    const metier = "metier" in next ? next.metier : metierFilter;
    const available = "dispo" in next ? next.dispo : onlyAvailable;
    if (metier) params.set("metier", metier);
    if (available) params.set("dispo", "maintenant");
    const qs = params.toString();
    return qs ? `/profils?${qs}` : "/profils";
  }

  return (
    <main>
      <section className="border-b border-stone-200 bg-brand-light">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h1 className="font-display max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
            Des profils prêts à travailler
          </h1>
          <p className="mt-4 max-w-xl text-lg text-stone-700">
            Besoin de quelqu&apos;un rapidement ? Filtre par métier et par
            disponibilité, consulte les profils et contacte directement.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Aperçu de la plateforme : ces profils sont des exemples. Les vrais
          profils arrivent au lancement —{" "}
          <Link href="/creer-un-cv" className="font-semibold underline">
            crée ton CV
          </Link>{" "}
          pour faire partie des premiers.
        </div>

        <nav aria-label="Filtrer les profils" className="mt-8 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-stone-500">Disponibilité :</span>
            <Link
              href={filterHref({ dispo: false })}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium ${!onlyAvailable ? "border-brand bg-brand text-white" : "border-stone-200 bg-white hover:border-brand"}`}
            >
              Tous les profils
            </Link>
            <Link
              href={filterHref({ dispo: true })}
              className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium ${onlyAvailable ? "border-emerald-600 bg-emerald-600 text-white" : "border-stone-200 bg-white hover:border-emerald-600"}`}
            >
              <span
                aria-hidden
                className={`h-2 w-2 rounded-full ${onlyAvailable ? "bg-white" : "bg-emerald-500"}`}
              />
              Disponible maintenant
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-stone-500">Métier :</span>
            <Link
              href={filterHref({ metier: undefined })}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium ${!metierFilter ? "border-brand bg-brand text-white" : "border-stone-200 bg-white hover:border-brand"}`}
            >
              Tous
            </Link>
            {metiersWithProfiles.map((metier) => {
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
        </nav>

        {profiles.length === 0 ? (
          <p className="mt-12 rounded-xl border border-stone-200 bg-stone-50 p-8 text-center text-stone-600">
            Aucun profil ne correspond à ces filtres pour le moment.{" "}
            <Link href="/profils" className="font-semibold text-brand hover:underline">
              Voir tous les profils
            </Link>
          </p>
        ) : (
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile) => {
              const metier = getMetierBySlug(profile.metierSlug);
              const MetierIcon = getMetierIcon(profile.metierSlug);
              return (
                <li key={profile.id}>
                  <Link
                    href={`/profils/${profile.slug}`}
                    className="card-lift flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-6"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        aria-hidden
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-light text-brand-dark"
                      >
                        <MetierIcon className="h-5 w-5" />
                      </span>
                      {profile.isAvailableNow ? (
                        <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          <span aria-hidden className="h-2 w-2 rounded-full bg-emerald-500" />
                          Disponible
                        </span>
                      ) : (
                        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-500">
                          {profile.availableFrom
                            ? `Dispo le ${profile.availableFrom}`
                            : "Indisponible"}
                        </span>
                      )}
                    </div>
                    <h2 className="mt-4 font-bold leading-snug">{profile.headline}</h2>
                    <p className="mt-1 text-sm text-stone-500">
                      {metier?.label} · {profile.city}
                    </p>
                    {profile.bio && (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-600">
                        {profile.bio}
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-1.5 border-t border-stone-100 pt-4">
                      {profile.jobTypes.map((type) => (
                        <span
                          key={type}
                          className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600"
                        >
                          {JOB_TYPE_LABELS[type] ?? type}
                        </span>
                      ))}
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
