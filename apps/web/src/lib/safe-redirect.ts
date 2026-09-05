// Valide qu'une valeur de redirection (`?next`, `?returnTo`) est un chemin INTERNE
// de l'application. Empêche les open redirects : schémas (http:, javascript:…),
// URLs protocol-relative (//evil), backslashes et caractères de contrôle.
export function safeInternalPath(value: string | null | undefined, fallback = "/"): string {
  if (!value || typeof value !== "string") return fallback;
  const v = value.trim();
  // Doit être un chemin absolu interne : commence par "/" mais pas "//".
  if (!v.startsWith("/") || v.startsWith("//")) return fallback;
  // Rejette les schémas déguisés et backslashes.
  if (v.includes("\\") || v.toLowerCase().includes("://")) return fallback;
  // Rejette tout caractère de contrôle (< 0x20).
  for (let i = 0; i < v.length; i++) {
    if (v.charCodeAt(i) < 0x20) return fallback;
  }
  return v;
}
