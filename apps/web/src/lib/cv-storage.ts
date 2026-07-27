// Persistance locale du brouillon de CV — le tableau de bord + la sauvegarde en base
// arriveront avec le backend (apps/api). En attendant, on ne perd pas le travail de
// l'utilisateur : tout reste dans le navigateur (localStorage), rien n'est envoyé au réseau.
import type { CvContent } from "@bara/shared-types";

const STORAGE_KEY = "bara:cv-draft";

export interface CvDraft {
  title: string;
  content: CvContent;
  templateId?: string;
  updatedAt: string;
}

export function loadCvDraft(): CvDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CvDraft) : null;
  } catch {
    return null;
  }
}

export function saveCvDraft(title: string, content: CvContent, templateId?: string): void {
  if (typeof window === "undefined") return;
  const draft: CvDraft = { title, content, templateId, updatedAt: new Date().toISOString() };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Quota localStorage dépassé (ex: photo trop lourde) — on retente sans la
    // photo plutôt que de perdre tout le brouillon.
    const { photoUrl: _photoUrl, ...personalInfo } = draft.content.personalInfo;
    const lighter: CvDraft = {
      ...draft,
      content: { ...draft.content, personalInfo },
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lighter));
    } catch {
      // Stockage indisponible (mode privé, quota) : on abandonne silencieusement,
      // l'éditeur continue de fonctionner en mémoire.
    }
  }
}

export function clearCvDraft(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
