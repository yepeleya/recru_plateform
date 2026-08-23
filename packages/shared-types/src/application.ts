// Candidature d'un candidat à une offre (JobOffer). Le CV joint est le CV actif
// du candidat au moment de postuler (voir ./cv). Aucune donnée sensible (clé de
// stockage, hash) n'apparaît ici.

export type ApplicationStatus = 'received' | 'in_review' | 'accepted' | 'rejected';

export interface Application {
  id: string;
  candidateId: string;
  jobOfferId: string;
  cvId?: string | null;
  status: ApplicationStatus;
  message?: string | null;
  createdAt: string;
  updatedAt: string;
}
