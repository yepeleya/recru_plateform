import Link from "next/link";
import { MapPin, CalendarDays } from "lucide-react";
import { getMetierBySlug, type JobOffer } from "@bara/shared-types";
import { getMetierIcon } from "@/lib/metier-icons";
import { formatBudget, jobTypeLabel } from "@/lib/offer-format";
import { cn } from "@/components/ui";

// JobCard — carte d'offre au style de la maquette Stitch. Deux variantes,
// même source de données (pas de doublon) :
//   - "grid" (défaut) : carte verticale compacte (accueil « Offres récentes »).
//   - "list" : ligne horizontale (page /offres) — icône à gauche, titre +
//     métier, budget à droite, méta, description, bouton « Voir l'offre ».
// Tokens Bara (#0050CB). Le métier (libellé + icône Lucide) vient du référentiel
// partagé — lookup pur, pas d'API ni de mock.
//
// ⚠️ Champs absents de JobOffer (pré-v3, signalés, non inventés) : nom
// d'entreprise et « recruteur vérifié » → la sous-ligne affiche le libellé
// métier, pas de badge Vérifié ; l'horodatage « il y a 2h » n'est pas affiché
// (createdAt mock non pertinent en relatif).

interface JobCardProps {
  offer: JobOffer;
  /** Lien cible ; par défaut la fiche offre du contrat (/offres/[slug]). */
  href?: string;
  variant?: "grid" | "list";
  className?: string;
}

export function JobCard({ offer, href, variant = "grid", className }: JobCardProps) {
  const metier = getMetierBySlug(offer.metierSlug);
  const MetierIcon = getMetierIcon(offer.metierSlug);
  const target = href ?? `/offres/${offer.slug}`;

  if (variant === "list") {
    return (
      <article
        className={cn(
          "flex flex-col gap-4 rounded-lg border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 md:flex-row",
          className,
        )}
      >
        <div className="shrink-0">
          <div className="flex h-16 w-16 items-center justify-center rounded-md bg-primary-soft text-primary">
            <MetierIcon className="h-8 w-8" aria-hidden />
          </div>
        </div>
        <div className="min-w-0 flex-grow">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-display text-lg font-semibold text-foreground">{offer.title}</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">{metier?.label}</p>
            </div>
            <div className="shrink-0 text-right">
              <span className="font-display text-lg font-bold text-primary">{formatBudget(offer)}</span>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden />
              {offer.city}
              {offer.area ? ` · ${offer.area}` : ""}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 shrink-0" aria-hidden />
              {jobTypeLabel(offer.type)}
            </span>
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{offer.description}</p>
          <div className="mt-4 flex justify-end">
            <Link
              href={target}
              className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Voir l'offre
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-lg border border-border bg-surface p-4 transition-all hover:-translate-y-1 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        className,
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-soft text-primary">
          <MetierIcon className="h-5 w-5" aria-hidden />
        </span>
        <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
          {jobTypeLabel(offer.type)}
        </span>
      </div>

      <h3 className="font-display text-base font-bold leading-snug text-foreground">{offer.title}</h3>
      <p className="mt-0.5 text-sm text-muted-foreground">{metier?.label}</p>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {offer.city}
          {offer.area ? ` · ${offer.area}` : ""}
        </span>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
        <span className="font-bold text-primary">{formatBudget(offer)}</span>
        <Link
          href={target}
          className="rounded-md bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Détails
        </Link>
      </div>
    </div>
  );
}
