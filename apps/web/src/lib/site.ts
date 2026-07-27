// Configuration centrale du site (URL canonique, nom, description par défaut).
// NEXT_PUBLIC_SITE_URL est définie dans .env.local en local et sur l'hébergeur en prod.

export const SITE_NAME = "Bara";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100";
