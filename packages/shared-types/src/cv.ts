// Enregistrement CV d'un candidat — métadonnées exposées au frontend.
// Le contenu structuré (CvContent) vit dans ./cv-content.
// IMPORTANT : ce type ne contient JAMAIS la clé de stockage privé (`fileKey`).
// Le fichier importé est servi uniquement via l'endpoint sécurisé GET /cvs/:id/file.
import type { CvContent } from './cv-content';

export type CvSource = 'generated' | 'imported';

export interface Cv {
  id: string;
  userId: string;
  title: string;
  source: CvSource;

  // Présents si source === 'generated'
  templateId?: string | null;
  content?: CvContent | null;

  // Présents si source === 'imported' (métadonnées d'affichage seulement)
  fileName?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;

  createdAt: string;
  updatedAt: string;
}
