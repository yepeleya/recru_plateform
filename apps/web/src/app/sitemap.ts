import type { MetadataRoute } from "next";
import { METIERS } from "@bara/shared-types";
import { SITE_URL } from "@/lib/site";

// Pages statiques. Les pages dynamiques (offres, profils) seront injectées ici
// depuis la base de données quand elles existeront. Les pages métiers sont déjà
// générées depuis @bara/shared-types (données statiques, pas de DB nécessaire).
const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/offres", changeFrequency: "daily", priority: 0.9 },
  { path: "/profils", changeFrequency: "daily", priority: 0.9 },
  { path: "/comment-ca-marche", changeFrequency: "monthly", priority: 0.8 },
  { path: "/creer-un-cv", changeFrequency: "monthly", priority: 0.9 },
  { path: "/metiers", changeFrequency: "weekly", priority: 0.8 },
  { path: "/recruteurs", changeFrequency: "monthly", priority: 0.8 },
  { path: "/jobs-vacances", changeFrequency: "monthly", priority: 0.7 },
  { path: "/tarifs", changeFrequency: "monthly", priority: 0.6 },
  { path: "/a-propos", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const metierEntries = METIERS.map((metier) => ({
    url: `${SITE_URL}/metiers/${metier.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...metierEntries];
}
