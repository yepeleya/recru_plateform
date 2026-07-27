import type { Metadata } from "next";
import Link from "next/link";
import { Check, Circle } from "lucide-react";

export const metadata: Metadata = {
  title: "Tarifs Bara : plateforme gratuite au lancement",
  description:
    "Combien coûte Bara ? Rien au lancement : inscription, CV, profil et offres 100 % gratuits pour les candidats comme pour les recruteurs. Détail des tarifs ici.",
  alternates: { canonical: "/tarifs" },
  openGraph: {
    title: "Tarifs Bara : plateforme gratuite au lancement",
    description:
      "Inscription, CV, profil et offres 100 % gratuits pour les candidats comme pour les recruteurs au lancement.",
    url: "/tarifs",
  },
};

const FREE_FEATURES = [
  "Création de compte candidat ou recruteur",
  "Générateur de CV avec 4 modèles au choix",
  "Publication de ton profil dans la base de candidats",
  "Publication d'offres de jobs",
  "Consultation des profils et des offres",
] as const;

const FUTURE_FEATURES = [
  "Mise en avant de profil ou d'offre",
  "Accès partenaire pour les entreprises (envoi ciblé de profils)",
  "Paiement sécurisé des prestations dans l'app (séquestre)",
] as const;

export default function TarifsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
        Des tarifs simples : gratuit
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-stone-700">
        Au lancement, Bara est entièrement gratuit — pour les candidats comme
        pour les recruteurs. Notre priorité : construire la plus grande base
        de profils et d&apos;offres de Côte d&apos;Ivoire.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <section className="card-lift rounded-3xl border-2 border-brand bg-white p-8">
          <p className="text-sm font-bold uppercase tracking-widest text-brand">
            Aujourd&apos;hui
          </p>
          <p className="font-display mt-2 text-4xl font-bold">
            0 FCFA
          </p>
          <p className="mt-1 text-stone-500">pour tout le monde</p>
          <ul className="mt-6 space-y-2.5 text-sm leading-relaxed text-stone-700">
            {FREE_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                {feature}
              </li>
            ))}
          </ul>
          <Link
            href="/inscription"
            className="btn-pop mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 font-semibold text-white"
          >
            Commencer gratuitement
          </Link>
        </section>

        <section className="card-lift rounded-3xl border border-stone-200 bg-stone-50 p-8">
          <p className="text-sm font-bold uppercase tracking-widest text-stone-400">
            Demain (options payantes)
          </p>
          <p className="font-display mt-2 text-4xl font-bold text-stone-400">
            À venir
          </p>
          <p className="mt-1 text-stone-500">quand la plateforme aura grandi</p>
          <ul className="mt-6 space-y-2.5 text-sm leading-relaxed text-stone-600">
            {FUTURE_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <Circle aria-hidden className="mt-1 h-2.5 w-2.5 shrink-0 text-stone-400" />
                {feature}
              </li>
            ))}
          </ul>
          <p className="mt-8 rounded-xl border border-stone-200 bg-white px-4 py-3 text-xs leading-relaxed text-stone-500">
            Le gratuit d&apos;aujourd&apos;hui restera gratuit : créer son CV
            et son profil ne deviendra jamais payant pour les candidats.
          </p>
        </section>
      </div>
    </main>
  );
}
