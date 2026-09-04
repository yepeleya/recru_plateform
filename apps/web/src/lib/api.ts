// Client API vers apps/api (NestJS). Routes versionnées /api/v1 (CLAUDE.md
// Partie 4 §9). La gestion d'erreurs distingue les échecs réseau/CORS (fetch qui
// lève) des erreurs HTTP (400/401/409/429/500), et journalise les détails
// techniques en console de dev sans les exposer à l'utilisateur.

import type { AccountType, VerificationStatus, Cv, CvContent } from "@bara/shared-types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4100/api/v1";

// Échec réseau : API arrêtée, hors ligne, ou CORS bloqué par le navigateur.
// fetch() lève une TypeError générique ("Failed to fetch") dans tous ces cas —
// on ne prétend pas que l'utilisateur n'a pas internet.
const NETWORK_ERROR_MESSAGE =
  "Impossible de joindre le serveur Bara. Vérifie que l'API est bien démarrée, puis réessaie.";

/** Erreur API structurée : conserve le statut HTTP et le message backend. */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function devLog(endpoint: string, status: number | "network", detail: unknown) {
  if (process.env.NODE_ENV !== "production") {
    // Détail technique pour le développeur (jamais affiché à l'utilisateur).
    console.error(`[Bara API] ${endpoint} → ${status}`, detail);
  }
}

// Traduit un statut HTTP + message backend en message compréhensible.
function messageForStatus(status: number, backendMessage: string | null): string {
  if (backendMessage) return backendMessage;
  switch (status) {
    case 400:
    case 422:
      return "Certaines informations sont invalides. Vérifie le formulaire.";
    case 401:
      return "Identifiants invalides.";
    case 409:
      return "Cet email est déjà utilisé.";
    case 429:
      return "Trop de tentatives. Réessaie dans une minute.";
    default:
      return status >= 500
        ? "Le serveur Bara a rencontré une erreur. Réessaie dans un instant."
        : "Une erreur est survenue.";
  }
}

async function readError(res: Response): Promise<string | null> {
  try {
    const data = (await res.json()) as { message?: string | string[] } | null;
    const msg = data?.message;
    if (!msg) return null;
    return Array.isArray(msg) ? msg.join(" ") : msg;
  } catch {
    return null;
  }
}

// Effectue le fetch et lève une ApiError typée. Sépare l'échec réseau (fetch qui
// lève) des erreurs HTTP.
async function call(endpoint: string, init: RequestInit): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${endpoint}`, { ...init, credentials: "include" });
  } catch (err) {
    devLog(endpoint, "network", err);
    throw new ApiError(NETWORK_ERROR_MESSAGE, 0);
  }
  if (!res.ok) {
    const backendMessage = await readError(res);
    devLog(endpoint, res.status, backendMessage);
    throw new ApiError(messageForStatus(res.status, backendMessage), res.status);
  }
  return res;
}

async function postJson<T>(endpoint: string, body: unknown): Promise<T> {
  const res = await call(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  return (text ? JSON.parse(text) : {}) as T;
}

export function loginWithCredentials(email: string, password: string) {
  return postJson<{ ok: boolean }>("/auth/login", { email, password });
}

// Les fichiers (pièce d'identité, RCCM) sont envoyés en multipart. On NE fixe PAS
// Content-Type manuellement : le navigateur ajoute le boundary automatiquement.
export async function registerAccount(formData: FormData): Promise<{ ok: boolean }> {
  const res = await call("/auth/register", { method: "POST", body: formData });
  return (await res.json()) as { ok: boolean };
}

// ============================================================================
// Utilisateur courant + CV (P0-4). Toutes ces fonctions s'exécutent côté client :
// le cookie de session HttpOnly est envoyé automatiquement (credentials:"include").
// ============================================================================

export type MeRole = "USER" | "ADMIN" | "SUPPORT";

/** Réponse plate de GET /users/me (cf. apps/api users.service.findById). */
export interface Me {
  id: string;
  email: string;
  role: MeRole;
  accountType: AccountType;
  phone: string;
  city: string;
  firstName?: string | null;
  lastName?: string | null;
  companyName?: string | null;
  sector?: string | null;
  rccmNumber?: string | null;
  representativeFirstName?: string | null;
  representativeLastName?: string | null;
  representativeRole?: string | null;
  verificationStatus: VerificationStatus;
  businessVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

/** GET /users/me — l'utilisateur connecté, ou null si aucune session (401). */
export async function getMe(): Promise<Me | null> {
  try {
    const res = await call("/users/me", { method: "GET" });
    return (await res.json()) as Me;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null;
    throw err;
  }
}

// Le backend enveloppe toujours la ressource CV dans { cv }.
interface CvEnvelope {
  cv: Cv | null;
}

/** GET /cvs/me — le CV actif du candidat, ou null s'il n'en a pas. */
export async function getMyCv(): Promise<Cv | null> {
  const res = await call("/cvs/me", { method: "GET" });
  const data = (await res.json()) as CvEnvelope;
  return data.cv;
}

/** GET /cvs/:id — consultation d'un CV (généré : contenu ; importé : métadonnées). */
export async function getCvById(id: string): Promise<Cv> {
  const res = await call(`/cvs/${id}`, { method: "GET" });
  const data = (await res.json()) as CvEnvelope;
  if (!data.cv) throw new ApiError("CV introuvable.", 404);
  return data.cv;
}

export interface SaveCvInput {
  content: CvContent;
  title?: string;
  templateId?: string;
}

/** POST /cvs — crée ou remplace le CV *généré* du candidat. */
export async function saveGeneratedCv(input: SaveCvInput): Promise<Cv> {
  const res = await call("/cvs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = (await res.json()) as CvEnvelope;
  if (!data.cv) throw new ApiError("Réponse inattendue du serveur.", 0);
  return data.cv;
}

/** PATCH /cvs/:id — met à jour le CV *généré* du candidat (édition). */
export async function updateGeneratedCv(id: string, input: SaveCvInput): Promise<Cv> {
  const res = await call(`/cvs/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = (await res.json()) as CvEnvelope;
  if (!data.cv) throw new ApiError("Réponse inattendue du serveur.", 0);
  return data.cv;
}

/**
 * POST /cvs/import — importe (ou remplace) un CV PDF. On ne fixe PAS Content-Type :
 * le navigateur ajoute le boundary multipart. La validation (PDF, magic-byte,
 * taille) reste la responsabilité du backend.
 */
export async function importCv(file: File, title?: string): Promise<Cv> {
  const form = new FormData();
  form.append("file", file);
  if (title) form.append("title", title);
  const res = await call("/cvs/import", { method: "POST", body: form });
  const data = (await res.json()) as CvEnvelope;
  if (!data.cv) throw new ApiError("Réponse inattendue du serveur.", 0);
  return data.cv;
}

/** DELETE /cvs/:id — supprime le CV du candidat. */
export async function deleteCv(id: string): Promise<void> {
  await call(`/cvs/${id}`, { method: "DELETE" });
}

/** URL de consultation/téléchargement du PDF d'un CV importé (endpoint protégé). */
export function cvFileUrl(id: string): string {
  return `${API_URL}/cvs/${id}/file`;
}
