// Façade « offres » — FRONT-2 : lit l'API réelle (GET /job-offers) via lib/api.
// Les pages publiques (Server Components) importent d'ici, jamais lib/mock.
// L'API renvoie des champs nullables ; `toJobOffer` normalise vers le type
// @bara/shared-types JobOffer (null → undefined). Aucun cast aveugle.
import type { JobOffer, JobType, OfferStatus } from "@bara/shared-types";
import { fetchPublicOffers, type JobOfferApi } from "@/lib/api";

export interface OfferFilters {
  metier?: string;
  type?: JobType;
}

// La liste publique de l'API est paginée (max 50 côté backend). Le navigateur
// d'offres pagine ensuite côté client sur cet ensemble. Limite connue : au-delà de
// 50 offres publiées, seule la première page alimente /offres — la pagination
// serveur côté frontend est une évolution ultérieure (hors P0-4.4).
const MAX_PUBLIC = 50;

function toJobOffer(o: JobOfferApi): JobOffer {
  return {
    id: o.id,
    slug: o.slug,
    title: o.title,
    description: o.description,
    metierSlug: o.metierSlug,
    type: o.type as JobType,
    city: o.city,
    area: o.area ?? undefined,
    budgetMin: o.budgetMin ?? undefined,
    budgetMax: o.budgetMax ?? undefined,
    budgetLabel: o.budgetLabel ?? undefined,
    startDate: o.startDate ?? undefined,
    endDate: o.endDate ?? undefined,
    status: o.status as OfferStatus,
    recruiterId: o.recruiterId,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

export async function getOffers(filters: OfferFilters = {}): Promise<JobOffer[]> {
  try {
    const page = await fetchPublicOffers({
      pageSize: MAX_PUBLIC,
      metier: filters.metier,
      type: filters.type,
    });
    return page.items.map(toJobOffer);
  } catch {
    // API indisponible : liste vide → EmptyState. Aucun faux contenu.
    return [];
  }
}

export async function getOfferBySlug(slug: string): Promise<JobOffer | null> {
  // L'API sert le détail par id (pas par slug) : on résout via la liste publique.
  try {
    const page = await fetchPublicOffers({ pageSize: MAX_PUBLIC });
    const found = page.items.find((o) => o.slug === slug);
    return found ? toJobOffer(found) : null;
  } catch {
    return null;
  }
}

export async function getFeaturedOffers(limit = 3): Promise<JobOffer[]> {
  try {
    const page = await fetchPublicOffers({ pageSize: Math.min(limit, MAX_PUBLIC) });
    return page.items.slice(0, limit).map(toJobOffer);
  } catch {
    return [];
  }
}
