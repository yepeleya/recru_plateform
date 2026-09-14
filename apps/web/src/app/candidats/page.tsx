import type { Metadata } from "next";
import Link from "next/link";
import { UserSearch } from "lucide-react";
import { getWorkerProfiles } from "@/lib/data";
import { buttonVariants } from "@/components/ui";
import { EmptyState } from "@/components/patterns";
import { ProfilesBrowser } from "./profiles-browser";

export async function generateMetadata(): Promise<Metadata> {
  const profiles = await getWorkerProfiles();
  return {
    title: "Professionnels disponibles en Côte d'Ivoire",
    description: "L'annuaire des professionnels inscrits sur Bara.",
    alternates: { canonical: "/candidats" },
    // Non indexée tant qu'aucun profil réel n'est publié : une page vide ne
    // justifie pas son indexation.
    ...(profiles.length === 0 ? { robots: { index: false, follow: true } } : {}),
  };
}

// Server Component. Tant qu'aucun WorkerProfile réel n'existe (phase 4), la page
// affiche un état vide honnête : aucun profil, chiffre ni badge inventé.
export default async function CandidatsPage() {
  const profiles = await getWorkerProfiles();

  if (profiles.length === 0) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Professionnels</h1>
        <EmptyState
          icon={UserSearch}
          title="Aucun professionnel disponible pour le moment."
          className="mt-6"
          action={
            <Link href="/recruteur/offres/nouvelle" className={buttonVariants({ variant: "outline" })}>
              Publier une offre
            </Link>
          }
        />
      </main>
    );
  }

  return <ProfilesBrowser profiles={profiles} />;
}
