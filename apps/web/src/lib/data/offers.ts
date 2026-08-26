// Façade « offres ». FRONT-1 : lit lib/mock. FRONT-2 : le corps de ces
// fonctions sera remplacé par des appels à l'API NestJS (GET /offers…), sans
// changer la signature — les pages n'ont pas à être réécrites.
import type { JobOffer, JobType } from "@bara/shared-types";
import { mockOffers } from "@/lib/mock";

export interface OfferFilters {
  metier?: string;
  type?: JobType;
}

export async function getOffers(filters: OfferFilters = {}): Promise<JobOffer[]> {
  return mockOffers.filter(
    (offer) =>
      offer.status === "published" &&
      (!filters.metier || offer.metierSlug === filters.metier) &&
      (!filters.type || offer.type === filters.type),
  );
}

export async function getOfferBySlug(slug: string): Promise<JobOffer | null> {
  return mockOffers.find((offer) => offer.slug === slug) ?? null;
}

export async function getFeaturedOffers(limit = 3): Promise<JobOffer[]> {
  return mockOffers.filter((offer) => offer.status === "published").slice(0, limit);
}
