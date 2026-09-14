// Façade « profils professionnels ». Aucune API de profils n'existe encore
// (phase 4) : la façade renvoie une liste vide plutôt que des profils fictifs
// (V22 — le produit ne prétend jamais). Les signatures sont celles que l'API
// alimentera, pour ne pas réécrire les pages.
import type { WorkerProfile } from "@bara/shared-types";

export interface ProfileFilters {
  metier?: string;
  availableNow?: boolean;
}

export async function getWorkerProfiles(_filters: ProfileFilters = {}): Promise<WorkerProfile[]> {
  return [];
}

export async function getWorkerProfileBySlug(_slug: string): Promise<WorkerProfile | null> {
  return null;
}
