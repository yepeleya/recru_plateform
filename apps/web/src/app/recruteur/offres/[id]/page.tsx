import type { Metadata } from "next";
import { OfferDetail } from "@/components/recruteur/offer-detail";

export const metadata: Metadata = {
  title: "Détail de l'offre",
};

// Le titre réel de l'offre n'est pas mis dans les métadonnées : la donnée est
// privée (chargée côté client avec la session) et l'espace recruteur est déjà
// noindex via le layout /recruteur.
export default async function OffreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OfferDetail offerId={id} />;
}
