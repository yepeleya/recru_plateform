// Génère des titres (50-60 caractères) et descriptions (~140-165 caractères) uniques
// par métier, calibrés selon la longueur du libellé pour respecter les contraintes SEO
// sur les 34 pages /metiers/[slug] sans les rédiger une par une.
import type { Metier } from "@bara/shared-types";

// Ne pas ajouter "| Bara" ici : le template du layout racine l'ajoute déjà
// automatiquement (voir title.template dans app/layout.tsx).
export function buildMetierTitle(metier: Pick<Metier, "label">): string {
  const { label } = metier;
  if (label.length <= 12) {
    return `${label} : trouver un profil ou publier une offre`;
  }
  if (label.length <= 22) {
    return `${label} : trouver ou publier une offre`;
  }
  return `${label} en Côte d'Ivoire`;
}

export function buildMetierDescription(metier: Pick<Metier, "label" | "blurb">): string {
  return `${metier.label} sur Bara : ${metier.blurb} Publie ton profil ou ton offre en Côte d'Ivoire.`;
}
