import type { Metadata } from "next";
import { RecruiterDashboard } from "@/components/recruteur/recruiter-dashboard";

export const metadata: Metadata = {
  title: "Tableau de bord",
};

export default function RecruteurPage() {
  return <RecruiterDashboard />;
}
