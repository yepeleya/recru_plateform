// COMPAT SHIM — la source mock principale vit désormais dans lib/mock (offres,
// profils) et les helpers de présentation dans lib/offer-format. Ce fichier ne
// fait que ré-exporter, sous leurs anciens noms, ce qu'utilisent encore les
// pages existantes (/offres, /profils et leurs pages détail), afin de ne rien
// casser. Les NOUVELLES pages doivent passer par lib/data, pas par ce fichier.
import type { JobOffer, WorkerProfile } from "@bara/shared-types";
import { mockOffers, mockProfiles } from "./mock";

export const DEMO_OFFERS: JobOffer[] = mockOffers;
export const DEMO_PROFILES: WorkerProfile[] = mockProfiles;

export function getDemoOfferBySlug(slug: string): JobOffer | undefined {
  return mockOffers.find((offer) => offer.slug === slug);
}

export function getDemoProfileBySlug(slug: string): WorkerProfile | undefined {
  return mockProfiles.find((profile) => profile.slug === slug);
}

export { JOB_TYPE_LABELS, jobTypeLabel, formatBudget } from "./offer-format";
