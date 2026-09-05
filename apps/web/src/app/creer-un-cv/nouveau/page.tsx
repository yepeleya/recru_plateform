import type { Metadata } from "next";
import { CvEditor } from "@/components/cv-editor/cv-editor";

export const metadata: Metadata = {
  title: "Éditeur de CV",
  robots: { index: false, follow: false },
};

export default async function NouveauCvPage({
  searchParams,
}: {
  searchParams: Promise<{ cvId?: string; returnTo?: string }>;
}) {
  const { cvId, returnTo } = await searchParams;
  return (
    <main className="bg-surface-2 py-10">
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          {cvId ? "Modifier mon CV" : "Créer mon CV"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Remplissez vos informations à gauche, votre CV se met à jour en direct à droite.
        </p>
        <div className="mt-8">
          <CvEditor cvId={cvId} returnTo={returnTo} />
        </div>
      </div>
    </main>
  );
}
