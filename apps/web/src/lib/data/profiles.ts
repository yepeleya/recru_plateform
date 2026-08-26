// Façade « profils candidats ». FRONT-1 : lit lib/mock. FRONT-2 : appels API
// (GET /profiles…) sans changer les signatures.
import type { WorkerProfile } from "@bara/shared-types";
import { mockProfiles } from "@/lib/mock";

export interface ProfileFilters {
  metier?: string;
  availableNow?: boolean;
}

export async function getWorkerProfiles(filters: ProfileFilters = {}): Promise<WorkerProfile[]> {
  return mockProfiles.filter(
    (profile) =>
      profile.isVisible &&
      (!filters.metier || profile.metierSlug === filters.metier) &&
      (!filters.availableNow || profile.isAvailableNow),
  );
}

export async function getWorkerProfileBySlug(slug: string): Promise<WorkerProfile | null> {
  return mockProfiles.find((profile) => profile.slug === slug) ?? null;
}
