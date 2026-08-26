import type { Metadata } from "next";
import Link from "next/link";
import {
  Mail,
  Bookmark,
  User,
  Briefcase,
  CalendarDays,
  MapPin,
  Layers,
  FileText,
  Eye,
  Download,
  UserSearch,
} from "lucide-react";
import { getMetierBySlug } from "@bara/shared-types";
import { getMetierIcon } from "@/lib/metier-icons";
import { jobTypeLabel } from "@/lib/offer-format";
import { getWorkerProfiles, getWorkerProfileBySlug } from "@/lib/data";
import { EmptyState } from "@/components/patterns";

export async function generateStaticParams() {
  const profiles = await getWorkerProfiles();
  return profiles.map((profile) => ({ slug: profile.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getWorkerProfileBySlug(slug);
  if (!profile) return { title: "Profil introuvable" };
  return {
    title: profile.headline,
    description: profile.bio?.slice(0, 155) ?? profile.headline,
    // noindex tant que les données sont des exemples (FRONT-1).
    robots: { index: false, follow: true },
    alternates: { canonical: `/candidats/${profile.slug}` },
  };
}

const CONTACT_HREF = "/inscription"; // FRONT-1 : contacter nécessite un compte recruteur.

export default async function CandidatDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await getWorkerProfileBySlug(slug);

  if (!profile) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <EmptyState
          icon={UserSearch}
          title="Profil introuvable"
          description="Ce profil n'existe pas ou n'est plus disponible."
          action={
            <Link
              href="/candidats"
              className="rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Voir tous les candidats
            </Link>
          }
        />
      </main>
    );
  }

  const metier = getMetierBySlug(profile.metierSlug);
  const MetierIcon = getMetierIcon(profile.metierSlug);
  const availability = profile.jobTypes.map(jobTypeLabel).join(", ") || "À discuter";

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      {/* En-tête profil : bannière + avatar + identité + actions */}
      <section className="mb-8 overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
        <div aria-hidden className="h-32 bg-gradient-to-r from-primary to-accent" />
        <div className="relative -mt-12 flex flex-col gap-6 px-4 pb-6 md:flex-row md:items-end md:px-8">
          {/* Avatar (placeholder icône métier — pas de photo dans le modèle) */}
          <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl border-4 border-surface bg-primary-soft text-primary shadow-lg md:h-36 md:w-36">
            <MetierIcon className="h-14 w-14 md:h-16 md:w-16" aria-hidden />
          </div>

          <div className="min-w-0 flex-grow">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-foreground">{profile.headline}</h1>
              {profile.isAvailableNow ? (
                <span className="rounded-full bg-success-soft px-3 py-1 text-xs font-bold text-success">
                  Disponible maintenant
                </span>
              ) : (
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
                  {profile.availableFrom ? `Dispo le ${profile.availableFrom}` : "Indisponible"}
                </span>
              )}
            </div>
            <p className="mt-1 text-lg font-semibold text-primary">
              <Link href={`/metiers/${profile.metierSlug}`} className="hover:underline">
                {metier?.label}
              </Link>
            </p>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin aria-hidden className="h-4 w-4 shrink-0" />
              {profile.city}
            </p>
          </div>

          <div className="flex gap-2 pb-1">
            <Link
              href={CONTACT_HREF}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Mail aria-hidden className="h-4 w-4" />
              Contacter
            </Link>
            <Link
              href={CONTACT_HREF}
              aria-label="Enregistrer le profil"
              className="inline-flex items-center justify-center rounded-md border border-border px-3 py-2.5 text-primary transition-colors hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Bookmark aria-hidden className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Grille principale */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Colonne gauche */}
        <div className="space-y-6 lg:col-span-8">
          <article className="rounded-lg border border-border bg-surface p-5 shadow-sm md:p-6">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-foreground">
              <User aria-hidden className="h-5 w-5 text-primary" />
              Présentation
            </h2>
            {profile.bio ? (
              <p className="mb-6 leading-relaxed text-muted-foreground">{profile.bio}</p>
            ) : (
              <p className="mb-6 text-muted-foreground">Ce candidat n'a pas encore ajouté de présentation.</p>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <InfoCard icon={Briefcase} label="Métier" value={metier?.label ?? profile.metierSlug} />
              <InfoCard icon={CalendarDays} label="Disponibilité" value={availability} />
              <InfoCard icon={MapPin} label="Localisation" value={profile.city} />
            </div>
          </article>
        </div>

        {/* Colonne droite */}
        <aside className="space-y-6 lg:col-span-4">
          {/* Type de missions (jobTypes réels — pas de compétences fabriquées) */}
          <article className="rounded-lg border border-border bg-surface p-5 shadow-sm md:p-6">
            <h2 className="mb-4 flex items-center gap-2 font-display text-base font-bold text-foreground">
              <Layers aria-hidden className="h-5 w-5 text-primary" />
              Type de missions
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.jobTypes.map((type) => (
                <span
                  key={type}
                  className="rounded-md border border-border bg-muted px-3 py-1.5 text-xs font-semibold text-foreground"
                >
                  {jobTypeLabel(type)}
                </span>
              ))}
            </div>
          </article>

          {/* CV Bara — uniquement si le profil a un CV rattaché */}
          {profile.cvId ? (
            <article className="relative overflow-hidden rounded-lg bg-primary p-5 text-primary-foreground shadow-md md:p-6">
              <FileText aria-hidden className="pointer-events-none absolute -bottom-4 -right-4 h-28 w-28 opacity-10" />
              <h2 className="relative z-10 mb-1 font-display text-base font-bold">CV Bara</h2>
              <p className="relative z-10 mb-5 text-sm text-primary-foreground/90">
                Le CV de ce candidat, généré sur la plateforme.
              </p>
              <div className="relative z-10 flex flex-col gap-2">
                <Link href={CONTACT_HREF} className="flex w-full items-center justify-center gap-2 rounded-md bg-surface px-4 py-2.5 text-sm font-semibold text-primary hover:bg-surface-2">
                  <Eye aria-hidden className="h-4 w-4" /> Voir le CV
                </Link>
                <Link href={CONTACT_HREF} className="flex w-full items-center justify-center gap-2 rounded-md border border-primary-foreground/30 px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/10">
                  <Download aria-hidden className="h-4 w-4" /> Télécharger (PDF)
                </Link>
              </div>
            </article>
          ) : null}

          {/* Carte contact (CTA principal) */}
          <article className="rounded-lg border-2 border-primary bg-surface p-5 text-center shadow-sm md:p-6">
            <p className="mb-4 font-display text-lg font-bold text-foreground">
              Prêt à recruter ce candidat ?
            </p>
            <Link
              href={CONTACT_HREF}
              className="flex w-full items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Contacter ce candidat
            </Link>
          </article>
        </aside>
      </div>

      {/* Zone de mobilité — panneau neutre (pas d'image de carte réelle) */}
      <section className="mt-6 overflow-hidden rounded-lg border border-border bg-surface p-5 shadow-sm md:p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-foreground">
          <MapPin aria-hidden className="h-5 w-5 text-primary" />
          Zone de mobilité
        </h2>
        <div className="flex h-48 items-center justify-center rounded-lg bg-primary-soft">
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15">
              <span className="h-3.5 w-3.5 rounded-full bg-primary" aria-hidden />
            </span>
            <span className="rounded-full border border-border bg-surface px-4 py-1 text-xs font-bold text-foreground">
              {profile.city} &amp; environs
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface-2 p-4">
      <span className="mb-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon aria-hidden className="h-3.5 w-3.5 shrink-0" />
        {label}
      </span>
      <p className="font-display text-base font-semibold text-foreground">{value}</p>
    </div>
  );
}
