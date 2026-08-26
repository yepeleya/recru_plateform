import Link from "next/link";
import { MapPin, Check } from "lucide-react";
import { getMetierBySlug, type WorkerProfile } from "@bara/shared-types";
import { getMetierIcon } from "@/lib/metier-icons";
import { jobTypeLabel } from "@/lib/offer-format";
import { cn } from "@/components/ui";

// CandidateCard — carte de profil candidat (maquettes Stitch). Deux variantes,
// même source de données (pas de doublon) :
//   - "grid" (défaut) : carte verticale centrée (accueil « Candidats disponibles »).
//   - "list" : carte avatar-à-gauche (page /candidats) — intitulé + métier + ville,
//     badge de disponibilité, tags, bouton « Voir le profil » pleine largeur.
// Tokens Bara.
//
// ⚠️ DONNÉES MANQUANTES (signalées, non contournées) : WorkerProfile (pré-v3) n'a
// NI photo, NI prénom/nom, NI statut vérifié, NI stats (expérience, projets, avis).
// On n'invente rien :
//   - l'avatar affiche l'icône du métier (neutre) au lieu d'une photo ;
//   - l'intitulé affiche le `headline` réel (pas un nom) ;
//   - le badge « vérifié » et la ligne de stats de la maquette sont OMIS ;
//   - les tags proviennent de `jobTypes` (réel), pas de compétences fabriquées.
// Ces champs seront branchés lors de la synchro shared-types ↔ DB v3.

interface CandidateCardProps {
  profile: WorkerProfile;
  /** Lien cible ; par défaut la fiche du contrat (/candidats/[slug]). */
  href?: string;
  variant?: "grid" | "list";
  className?: string;
}

export function CandidateCard({ profile, href, variant = "grid", className }: CandidateCardProps) {
  const metier = getMetierBySlug(profile.metierSlug);
  const MetierIcon = getMetierIcon(profile.metierSlug);
  const target = href ?? `/candidats/${profile.slug}`;

  if (variant === "list") {
    return (
      <div
        className={cn(
          "flex h-full flex-col gap-4 rounded-lg border border-border bg-surface p-5 transition-all hover:-translate-y-1 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
              <MetierIcon className="h-8 w-8" aria-hidden />
            </span>
            <div className="min-w-0">
              <h3 className="line-clamp-1 font-display text-base font-semibold text-foreground">
                {profile.headline}
              </h3>
              <p className="text-sm font-semibold text-primary">{metier?.label}</p>
              <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {profile.city}
              </p>
            </div>
          </div>
          {profile.isAvailableNow ? (
            <span className="shrink-0 rounded-full bg-success-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-success">
              Disponible
            </span>
          ) : (
            <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              {profile.availableFrom ? "Bientôt" : "Indispo."}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {profile.jobTypes.map((type) => (
            <span
              key={type}
              className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
            >
              {jobTypeLabel(type)}
            </span>
          ))}
        </div>

        <Link
          href={target}
          className="mt-auto w-full rounded-md border-2 border-primary py-2.5 text-center text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Voir le profil
        </Link>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex h-full flex-col items-center rounded-lg border border-border bg-surface p-4 text-center transition-all hover:shadow-md",
        className,
      )}
    >
      <div className="relative mx-auto mb-4 h-20 w-20">
        <div className="flex h-full w-full items-center justify-center rounded-full bg-primary-soft text-primary">
          <MetierIcon className="h-8 w-8" aria-hidden />
        </div>
        {profile.isAvailableNow ? (
          <span className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface bg-success text-success-foreground">
            <Check className="h-3.5 w-3.5" aria-hidden />
          </span>
        ) : null}
      </div>

      {profile.isAvailableNow ? (
        <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-bold text-success">
          <span className="h-2 w-2 rounded-full bg-success" aria-hidden />
          Disponible maintenant
        </p>
      ) : (
        <p className="mb-1 text-xs font-medium text-muted-foreground">
          {profile.availableFrom ? `Dispo le ${profile.availableFrom}` : "Indisponible"}
        </p>
      )}

      <h3 className="line-clamp-1 font-display font-bold text-foreground">{profile.headline}</h3>
      <p className="text-sm font-medium text-primary">{metier?.label}</p>
      <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
        <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
        {profile.city}
      </p>

      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
        {profile.jobTypes.slice(0, 2).map((type) => (
          <span
            key={type}
            className="rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
          >
            {jobTypeLabel(type)}
          </span>
        ))}
      </div>

      <Link
        href={target}
        className="mt-4 w-full rounded-md border border-primary py-2 text-center text-sm font-semibold text-primary transition-colors hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Voir profil
      </Link>
    </div>
  );
}
