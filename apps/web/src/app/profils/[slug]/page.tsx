import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMetierBySlug } from "@bara/shared-types";
import { DEMO_PROFILES, JOB_TYPE_LABELS, getDemoProfileBySlug } from "@/lib/demo-data";
import { getMetierIcon } from "@/lib/metier-icons";

export function generateStaticParams() {
  return DEMO_PROFILES.map((profile) => ({ slug: profile.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const profile = getDemoProfileBySlug(slug);
  if (!profile) return {};
  return {
    title: profile.headline,
    description: profile.bio?.slice(0, 155) ?? profile.headline,
    // noindex tant que les données sont des exemples — passer en index quand
    // les profils viendront de la base de données réelle.
    robots: { index: false, follow: true },
    alternates: { canonical: `/profils/${profile.slug}` },
  };
}

export default async function ProfilDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = getDemoProfileBySlug(slug);
  if (!profile) notFound();

  const metier = getMetierBySlug(profile.metierSlug);
  const MetierIcon = getMetierIcon(profile.metierSlug);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <nav aria-label="Fil d'Ariane" className="text-sm text-stone-600">
        <Link href="/" className="hover:text-brand">
          Accueil
        </Link>{" "}
        <span aria-hidden>/</span>{" "}
        <Link href="/profils" className="hover:text-brand">
          Profils
        </Link>{" "}
        <span aria-hidden>/</span> <span className="text-ink">{profile.headline}</span>
      </nav>

      <div className="mt-8 flex items-start gap-4">
        <span
          aria-hidden
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand-dark"
        >
          <MetierIcon className="h-8 w-8" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold leading-tight sm:text-3xl">
            {profile.headline}
          </h1>
          <p className="mt-1 text-stone-500">
            <Link
              href={`/metiers/${profile.metierSlug}`}
              className="font-medium text-brand hover:underline"
            >
              {metier?.label}
            </Link>{" "}
            · {profile.city}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {profile.isAvailableNow ? (
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1.5 text-sm font-semibold text-emerald-700">
            <span aria-hidden className="h-2 w-2 rounded-full bg-emerald-500" />
            Disponible maintenant
          </span>
        ) : (
          <span className="rounded-full bg-stone-100 px-3.5 py-1.5 text-sm font-semibold text-stone-500">
            {profile.availableFrom
              ? `Disponible à partir du ${profile.availableFrom}`
              : "Indisponible actuellement"}
          </span>
        )}
        {profile.jobTypes.map((type) => (
          <span
            key={type}
            className="rounded-full bg-accent-light px-3.5 py-1.5 text-sm font-medium text-accent"
          >
            {JOB_TYPE_LABELS[type] ?? type}
          </span>
        ))}
      </div>

      {profile.bio && (
        <section className="mt-8">
          <h2 className="font-display text-xl font-bold">À propos</h2>
          <p className="mt-3 leading-relaxed text-stone-700">{profile.bio}</p>
        </section>
      )}

      <section className="mt-10 rounded-3xl bg-gradient-to-br from-accent to-violet-800 p-8 text-center text-white">
        <h2 className="font-display text-2xl font-bold">
          Ce profil correspond à ton besoin ?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-white/90">
          Crée ton compte recruteur pour contacter directement les candidats
          dès l&apos;ouverture de la messagerie Bara.
        </p>
        <Link
          href="/inscription"
          className="btn-pop mt-5 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 font-semibold text-accent"
        >
          Créer mon compte recruteur <span aria-hidden>→</span>
        </Link>
      </section>

      <p className="mt-8 text-sm">
        <Link href="/profils" className="font-medium text-brand hover:underline">
          ← Voir tous les profils
        </Link>
      </p>
    </main>
  );
}
