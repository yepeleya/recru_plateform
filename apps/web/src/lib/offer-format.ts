// Helpers de présentation des offres (libellés de type de job, formatage du
// budget). Volontairement séparés de demo-data (mock) pour que les patterns
// puissent les consommer sans dépendre des données de démonstration.
import type { JobType } from "@bara/shared-types";

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  "mission-ponctuelle": "Mission ponctuelle",
  saisonnier: "Saisonnier / vacances",
  "temps-partiel": "Temps partiel",
  "temps-plein": "Temps plein",
  "a-distance": "À distance",
  stage: "Stage",
};

export function jobTypeLabel(type: JobType | string): string {
  return JOB_TYPE_LABELS[type as JobType] ?? String(type);
}

// Accepte indifféremment un JobOffer (champs optionnels `?: T`) et une réponse
// d'API JobOfferApi (champs `T | null`) : évite de recopier une conversion
// null → undefined dans chaque écran recruteur.
export function formatBudget(offer: {
  budgetLabel?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
}): string {
  if (offer.budgetLabel) return offer.budgetLabel;
  if (offer.budgetMin && offer.budgetMax) {
    return `${offer.budgetMin.toLocaleString("fr-FR")} – ${offer.budgetMax.toLocaleString("fr-FR")} FCFA`;
  }
  if (offer.budgetMin) return `à partir de ${offer.budgetMin.toLocaleString("fr-FR")} FCFA`;
  return "Budget à discuter";
}
