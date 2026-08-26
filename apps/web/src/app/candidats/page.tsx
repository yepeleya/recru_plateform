import type { Metadata } from "next";
import { getWorkerProfiles } from "@/lib/data";
import { ProfilesBrowser } from "./profiles-browser";

export const metadata: Metadata = {
  title: "Trouver un prestataire disponible en Côte d'Ivoire",
  description:
    "Parcours les profils prêts à travailler à Abidjan et dans toute la Côte d'Ivoire : filtre par métier, type de mission et disponibilité immédiate sur Bara.",
  alternates: { canonical: "/candidats" },
  openGraph: {
    title: "Trouver un prestataire disponible en Côte d'Ivoire",
    description:
      "Des profils prêts à travailler, filtrables par métier et disponibilité immédiate : la base de candidats Bara.",
    url: "/candidats",
  },
};

// Server Component : récupère les profils via la façade lib/data (FRONT-1 =
// mocks, FRONT-2 = API) puis délègue la navigation interactive au client
// ProfilesBrowser.
export default async function CandidatsPage() {
  const profiles = await getWorkerProfiles();
  return <ProfilesBrowser profiles={profiles} />;
}
