import type { Metadata } from "next";
import Link from "next/link";
import { PackageOpen, Utensils, Bike, ShoppingBag, PartyPopper, GraduationCap } from "lucide-react";

export const metadata: Metadata = {
  title: "Job de vacances étudiant à Abidjan : trouve le tien",
  description:
    "Rayonniste, serveur, livreur, vente en boutique… Trouve un job de vacances étudiant à Abidjan avec Bara : crée ton CV et postule aux offres saisonnières.",
  alternates: { canonical: "/jobs-vacances" },
  openGraph: {
    title: "Job de vacances étudiant à Abidjan : trouve le tien",
    description:
      "Crée ton CV et postule aux offres saisonnières : rayonniste, serveur, livreur, vente en boutique…",
    url: "/jobs-vacances",
  },
};

const IDEAS = [
  { icon: PackageOpen, label: "Rayonniste en supermarché" },
  { icon: Utensils, label: "Serveur / serveuse en renfort" },
  { icon: Bike, label: "Livreur à moto" },
  { icon: ShoppingBag, label: "Vente en boutique" },
  { icon: PartyPopper, label: "Événementiel" },
  { icon: GraduationCap, label: "Répétiteur pendant les congés" },
] as const;

export default function JobsVacancesPage() {
  return (
    <main>
      <section className="border-b border-stone-200 bg-brand-light">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h1 className="font-display max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
            Ton job de vacances t&apos;attend à Abidjan
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-stone-700">
            Étudiant, élève, jeune diplômé : les vacances sont le bon moment
            pour gagner ton argent et ajouter une vraie expérience à ton CV.
            Les supermarchés, boutiques et restaurants recrutent des renforts
            — Bara te met en relation directement.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/creer-un-cv"
              className="btn-pop inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 font-semibold text-white"
            >
              Créer mon CV gratuitement <span aria-hidden>→</span>
            </Link>
            <Link
              href="/offres?type=saisonnier"
              className="btn-pop inline-flex items-center rounded-full border border-brand px-7 py-3.5 font-semibold text-brand hover:bg-white"
            >
              Voir les offres saisonnières
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-3xl font-bold">Des idées de jobs de vacances</h2>
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {IDEAS.map((idea) => {
            const Icon = idea.icon;
            return (
              <li
                key={idea.label}
                className="card-lift flex items-center gap-2.5 rounded-xl border border-stone-200 bg-white px-4 py-3.5 text-sm font-medium"
              >
                <Icon aria-hidden className="h-5 w-5 shrink-0 text-brand" />
                {idea.label}
              </li>
            );
          })}
        </ul>

        <h2 className="font-display mt-16 text-3xl font-bold">Comment faire ?</h2>
        <ol className="mt-6 max-w-2xl list-decimal space-y-3 pl-5 leading-relaxed text-stone-700">
          <li>
            <strong>Crée ton CV sur Bara</strong> — même sans expérience, tes
            études, tes compétences et ta motivation comptent.
          </li>
          <li>
            <strong>Publie ton profil</strong> en précisant que tu cherches un
            job saisonnier et tes disponibilités.
          </li>
          <li>
            <strong>Postule aux offres</strong> marquées « Saisonnier /
            vacances » ou laisse les recruteurs venir à toi.
          </li>
        </ol>
      </section>
    </main>
  );
}
