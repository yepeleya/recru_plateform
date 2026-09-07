import type { Metadata } from "next";
import { OfferForm } from "@/components/recruteur/offer-form";

export const metadata: Metadata = {
  title: "Publier une offre",
};

export default function NouvelleOffrePage() {
  return <OfferForm />;
}
