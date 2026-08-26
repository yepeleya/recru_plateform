import type { Metadata } from "next";
import { getOffers } from "@/lib/data";
import { OffersBrowser } from "./offers-browser";

export const metadata: Metadata = {
  title: "Offres de petits jobs à Abidjan et en Côte d'Ivoire",
  description:
    "Parcours les offres de petits jobs, missions ponctuelles et jobs de vacances à Abidjan : graphisme, livraison, service, ménage… Postule directement sur Bara.",
  alternates: { canonical: "/offres" },
  openGraph: {
    title: "Offres de petits jobs à Abidjan et en Côte d'Ivoire",
    description:
      "Missions ponctuelles, jobs de vacances, temps partiel : les offres publiées par les recruteurs sur Bara.",
    url: "/offres",
  },
};

// Server Component : récupère les offres via la façade lib/data (FRONT-1 = mocks,
// FRONT-2 = API) puis délègue la navigation interactive (recherche, filtres,
// tri, pagination) au client OffersBrowser.
export default async function OffresPage() {
  const offers = await getOffers();
  return <OffersBrowser offers={offers} />;
}
