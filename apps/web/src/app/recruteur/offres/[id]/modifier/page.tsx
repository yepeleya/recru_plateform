import type { Metadata } from "next";
import { OfferForm } from "@/components/recruteur/offer-form";

export const metadata: Metadata = {
  title: "Modifier l'offre",
};

export default async function ModifierOffrePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OfferForm offerId={id} />;
}
