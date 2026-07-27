// Client API vers apps/api (NestJS). Les routes sont versionnées /api/v1
// (CLAUDE.md Partie 4 §9). Si le serveur est injoignable, fetchOrFriendlyError
// transforme l'erreur réseau en message compréhensible.

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4100/api/v1";

const SERVER_UNAVAILABLE_MESSAGE =
  "La connexion à Bara a échoué. Vérifie ta connexion internet et réessaie dans un instant.";

// fetch() lève une TypeError générique ("Failed to fetch") quand le serveur est
// injoignable (backend absent, hors ligne, CORS...) — on la transforme en message
// compréhensible plutôt que de laisser remonter le jargon technique du navigateur.
async function fetchOrFriendlyError(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch {
    throw new Error(SERVER_UNAVAILABLE_MESSAGE);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetchOrFriendlyError(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const msg = data?.message ?? "Une erreur est survenue.";
    throw new Error(Array.isArray(msg) ? msg.join(" ") : msg);
  }

  const text = await res.text();
  return (text ? JSON.parse(text) : {}) as T;
}

function post<T>(path: string, body: unknown) {
  return request<T>(path, { method: "POST", body: JSON.stringify(body) });
}

export function loginWithCredentials(email: string, password: string) {
  return post<{ ok: boolean }>("/auth/login", { email, password });
}

// Les fichiers (pièce d'identité, RCCM) sont envoyés en multipart, pas en JSON —
// cette fonction contourne `request()` pour ne pas forcer Content-Type: application/json.
export async function registerAccount(formData: FormData): Promise<{ ok: boolean }> {
  const res = await fetchOrFriendlyError(`${API_URL}/auth/register`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const msg = data?.message ?? "Une erreur est survenue.";
    throw new Error(Array.isArray(msg) ? msg.join(" ") : msg);
  }

  return res.json();
}
