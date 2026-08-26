// Façade d'accès aux données (FRONT-1 = mocks ; FRONT-2 = API NestJS).
// Les pages et composants importent UNIQUEMENT depuis ici, jamais depuis
// lib/mock directement. Ainsi le branchement API en FRONT-2 ne touche que cette
// couche, sans réécrire les pages.
export type { DataState } from "./types";
export { getOffers, getOfferBySlug, getFeaturedOffers } from "./offers";
export type { OfferFilters } from "./offers";
export { getWorkerProfiles, getWorkerProfileBySlug } from "./profiles";
export type { ProfileFilters } from "./profiles";
export { getCurrentUser } from "./user";
