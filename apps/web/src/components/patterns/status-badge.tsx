import type { LucideIcon } from "lucide-react";
import type { OfferStatus } from "@bara/shared-types";
import { Badge, type BadgeVariant } from "@/components/ui";

// StatusBadge — pastille de statut générique, pilotée par un « tone » sémantique
// (mappé sur les variantes du Badge du design system). Le mapping statut→tone
// est fourni par l'appelant afin de ne pas coupler ce composant à un enum métier
// précis (les enums v3 — AccountStatus, ApplicationStatus… — ne sont pas encore
// dans @bara/shared-types). Le teal (variant success) est réservé aux états
// succès/vérifié, conformément au design verrouillé.

export type StatusTone = BadgeVariant;

interface StatusBadgeProps {
  tone?: StatusTone;
  label: string;
  icon?: LucideIcon;
  className?: string;
}

export function StatusBadge({ tone = "neutral", label, icon: Icon, className }: StatusBadgeProps) {
  return (
    <Badge variant={tone} className={className}>
      {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden /> : null}
      {label}
    </Badge>
  );
}

// Mapping prêt à l'emploi pour OfferStatus (seul statut « liste » présent dans
// shared-types aujourd'hui). Les autres statuts v3 seront ajoutés ici une fois
// définis dans le modèle (06 / Prisma).
export const OFFER_STATUS_META: Record<OfferStatus, { tone: StatusTone; label: string }> = {
  draft: { tone: "neutral", label: "Brouillon" },
  published: { tone: "success", label: "Publiée" },
  closed: { tone: "warning", label: "Fermée" },
  expired: { tone: "danger", label: "Expirée" },
};
