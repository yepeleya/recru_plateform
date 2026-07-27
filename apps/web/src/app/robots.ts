import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/connexion", "/inscription", "/tableau-de-bord", "/creer-un-cv/nouveau"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
