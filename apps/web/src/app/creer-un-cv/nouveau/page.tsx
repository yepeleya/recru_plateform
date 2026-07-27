import type { Metadata } from "next";
import { CvEditor } from "@/components/cv-editor/cv-editor";

export const metadata: Metadata = {
  title: "Éditeur de CV",
  robots: { index: false, follow: false },
};

export default function NouveauCvPage() {
  return (
    <main className="bg-stone-50 py-10">
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Ton CV</h1>
        <p className="mt-2 text-stone-600">
          Remplis tes informations à gauche, ton CV se met à jour en direct à
          droite.
        </p>
        <div className="mt-8">
          <CvEditor />
        </div>
      </div>
    </main>
  );
}
