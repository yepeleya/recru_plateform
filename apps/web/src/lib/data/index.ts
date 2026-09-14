// Façade d'accès aux données. Les pages et composants importent UNIQUEMENT
// depuis ici. Offres : API NestJS. Profils : aucune API avant la phase 4, donc
// aucune donnée — jamais de données fictives (V22).
export type { DataState } from "./types";
export { getOffers, getOfferBySlug, getFeaturedOffers } from "./offers";
export type { OfferFilters } from "./offers";
export { getWorkerProfiles, getWorkerProfileBySlug } from "./profiles";
export type { ProfileFilters } from "./profiles";
export { getCurrentUser } from "./user";
