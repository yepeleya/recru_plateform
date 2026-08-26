// Barrel des données mock (FRONT-1). Source unique de vérité des données de
// démonstration. NE PAS importer directement depuis les pages/composants :
// passer par lib/data (page → lib/data → lib/mock).
export { mockOffers } from "./mock-offers";
export { mockProfiles } from "./mock-profiles";
export { mockCurrentUser, mockRecruiterUser } from "./mock-users";
