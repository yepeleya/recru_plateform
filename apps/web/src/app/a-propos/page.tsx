import type { Metadata } from "next";
import Link from "next/link";
import { Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "À propos de Bara, plateforme de mise en relation",
  description:
    "Bara connecte ceux qui cherchent un petit job et ceux qui recrutent en Côte d'Ivoire. Découvrez notre mission : rendre le travail accessible à tous, vite.",
  alternates: { canonical: "/a-propos" },
  openGraph: {
    title: "À propos de Bara, plateforme de mise en relation",
    description:
      "Notre mission : rendre le travail accessible à tous en Côte d'Ivoire, en connectant candidats et recruteurs.",
    url: "/a-propos",
  },
};

export default function AProposPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
        Bara, c&apos;est le travail qui circule
      </h1>

      <section className="mt-10 space-y-5 leading-relaxed text-stone-700">
        <p>
          <strong>« Bara »</strong>, en nouchi, c&apos;est le travail. Et notre
          constat est simple : en Côte d&apos;Ivoire, le travail existe — des
          familles cherchent des ménagères, des entreprises cherchent des
          renforts, des marques cherchent des graphistes — mais il circule
          mal. Les recherches se font de bouche à oreille ou dans des groupes
          Facebook où les annonces se perdent en quelques heures.
        </p>
        <p>
          Bara est né pour ça : une plateforme où{" "}
          <strong>ceux qui cherchent un job créent leur CV et publient leur
          profil</strong>, et où <strong>ceux qui recrutent trouvent en
          quelques minutes une personne fiable et disponible</strong> —
          entreprise comme particulier.
        </p>
        <p>
          Nous croyons aux petits jobs comme tremplin : un job de vacances
          devient une première expérience, une mission ponctuelle devient un
          client régulier, un renfort saisonnier devient une embauche.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold">Nos engagements</h2>
        <ul className="mt-5 space-y-4">
          <li className="card-lift rounded-2xl border border-stone-200 bg-white p-5">
            <h3 className="font-semibold">La confiance d&apos;abord</h3>
            <p className="mt-1 text-sm leading-relaxed text-stone-600">
              Chaque compte est adossé à une pièce d&apos;identité vérifiée par
              notre équipe. Les badges « Profil vérifié » et « Entreprise
              vérifiée » vous disent à qui vous avez affaire.
            </p>
          </li>
          <li className="card-lift rounded-2xl border border-stone-200 bg-white p-5">
            <h3 className="font-semibold">Gratuit pour démarrer</h3>
            <p className="mt-1 text-sm leading-relaxed text-stone-600">
              Créer son CV et son profil est gratuit, et le restera. Voir{" "}
              <Link href="/tarifs" className="font-medium text-brand hover:underline">
                nos tarifs
              </Link>
              .
            </p>
          </li>
          <li className="card-lift rounded-2xl border border-stone-200 bg-white p-5">
            <h3 className="font-semibold">Fait ici, pour ici</h3>
            <p className="mt-1 text-sm leading-relaxed text-stone-600">
              Bara est pensé pour la réalité ivoirienne : les gombos, les jobs
              de vacances, les métiers de la débrouille comme ceux du digital.
              Fait avec{" "}
              <Heart aria-label="passion" className="inline h-4 w-4 fill-danger align-[-2px] text-danger" />{" "}
              à Abidjan.
            </p>
          </li>
        </ul>
      </section>

      <section className="mt-12 rounded-3xl bg-gradient-to-br from-brand to-brand-dark p-8 text-center text-white">
        <h2 className="font-display text-2xl font-bold">Rejoins l&apos;aventure</h2>
        <p className="mx-auto mt-2 max-w-md text-white/90">
          Candidat ou recruteur, la plateforme se construit avec ses premiers
          utilisateurs.
        </p>
        <Link
          href="/inscription"
          className="btn-pop mt-5 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 font-semibold text-brand-dark"
        >
          Créer mon compte <span aria-hidden>→</span>
        </Link>
      </section>
    </main>
  );
}
