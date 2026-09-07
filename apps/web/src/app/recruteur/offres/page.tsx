import type { Metadata } from "next";
import { RecruiterOffersList } from "@/components/recruteur/recruiter-offers-list";

export const metadata: Metadata = {
  title: "Mes offres",
};

export default function RecruteurOffresPage() {
  return <RecruiterOffersList />;
}
