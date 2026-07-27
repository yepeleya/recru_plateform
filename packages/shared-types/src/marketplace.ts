// Types du cœur "mise en relation" de Bara : offres de petits jobs et profils publics.
// Le référentiel des métiers (Metier, MetierCategorie) vit dans ./metiers.

export type JobType =
  | 'mission-ponctuelle' // un gombo : une tâche, une livraison
  | 'saisonnier'         // job de vacances, renfort périodique
  | 'temps-partiel'
  | 'temps-plein'
  | 'a-distance'         // job à distance / télétravail
  | 'stage';

export type OfferStatus = 'draft' | 'published' | 'closed' | 'expired';

/** Offre publiée par un recruteur (entreprise ou particulier). */
export interface JobOffer {
  id: string;
  slug: string; // ex: "graphiste-logo-abidjan-cocody"
  title: string;
  description: string;
  metierSlug: string; // référence Metier.slug (voir ./metiers)
  type: JobType;
  city: string;
  area?: string; // commune/quartier, ex: "Cocody"
  budgetMin?: number; // FCFA
  budgetMax?: number; // FCFA
  budgetLabel?: string; // ex: "à négocier"
  startDate?: string;
  endDate?: string;
  status: OfferStatus;
  recruiterId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Profil public d'un candidat — adossé à son CV cvmaker.
 * Un profil = un seul métier (choix produit : un candidat qui propose plusieurs
 * services crée un profil par service, ex. "Chauffeur" et "Livreur à moto" séparément).
 */
export interface WorkerProfile {
  id: string;
  slug: string; // ex: "graphiste-abidjan-jean-k"
  userId: string;
  headline: string; // ex: "Graphiste & illustrateur"
  bio?: string;
  metierSlug: string; // référence Metier.slug (voir ./metiers)
  city: string;
  // Disponibilité immédiate — bascule que le candidat contrôle lui-même (ex: "je suis
  // libre cette semaine"), distincte de `availableFrom` qui planifie une disponibilité
  // future. Sert de filtre principal sur /profils pour les recruteurs pressés.
  isAvailableNow: boolean;
  availableFrom?: string;
  jobTypes: JobType[];
  cvId?: string; // CV cvmaker rattaché, source des expériences/compétences
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}
