import type { Metadata } from "next";
import Link from "next/link";
import { Zap, ShieldCheck, FileText, Building2, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Recruter du personnel ponctuel en Côte d'Ivoire",
  description:
    "Entreprise ou particulier : publiez une offre ou parcourez des profils vérifiés et disponibles à Abidjan. Bara vous trouve la bonne personne, rapidement.",
  alternates: { canonical: "/recruteurs" },
  openGraph: {
    title: "Recruter du personnel ponctuel en Côte d'Ivoire",
    description:
      "Publiez une offre ou parcourez des profils vérifiés et disponibles : Bara vous trouve la bonne personne, rapidement.",
    url: "/recruteurs",
  },
};

const BENEFITS = [
  {
    icon: Zap,
    title: "Trouvez vite, même en urgence",
    text: "Pénurie de main-d'œuvre ? Le filtre « Disponible maintenant » montre uniquement les candidats prêts à commencer tout de suite.",
  },
  {
    icon: ShieldCheck,
    title: "Des profils vérifiés",
    text: "Chaque candidat fournit une pièce d'identité à l'inscription. Le badge « Profil vérifié » distingue les profils validés par notre équipe.",
  },
  {
    icon: FileText,
    title: "De vrais CV, pas des fiches",
    text: "Les candidats créent leur CV directement sur Bara : vous consultez un dossier complet avant de contacter.",
  },
  {
    icon: Building2,
    title: "Pensé pour les entreprises",
    text: "Startups, boutiques, supermarchés, agences : compte entreprise dédié, badge « Entreprise vérifiée » avec le RCCM, et offres partenaires à venir.",
  },
] as const;

export default function RecruteursPage() {
  return (
    <main>
      <section className="relative isolate overflow-hidden bg-night">
        <div
          aria-hidden
          className="animate-blob absolute -right-24 -top-24 h-96 w-96 rounded-full bg-accent/40 blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20">
          <h1 className="animate-fade-up font-display max-w-2xl text-4xl font-bold leading-tight text-white sm:text-5xl">
            Recrutez la bonne personne, sans perdre de temps
          </h1>
          <p className="animate-fade-up anim-delay-1 mt-6 max-w-xl text-lg leading-relaxed text-stone-300">
            Entreprise ou particulier, Bara vous connecte à une base de
            candidats prêts à travailler : missions ponctuelles, renforts
            saisonniers, temps partiel ou temps plein.
          </p>
          <div className="animate-fade-up anim-delay-2 mt-8 flex flex-wrap gap-4">
            <Link
              href="/inscription"
              className="btn-pop inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 font-semibold text-white"
            >
              Créer mon compte recruteur <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
            <Link
              href="/profils"
              className="btn-pop inline-flex items-center rounded-full border border-white/20 bg-white/5 px-7 py-3.5 font-semibold text-white backdrop-blur-sm hover:bg-white/10"
            >
              Voir les profils
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">
          Pourquoi recruter sur Bara
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {BENEFITS.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <article
                key={benefit.title}
                className="card-lift rounded-2xl border border-stone-200 bg-white p-7"
              >
                <span
                  aria-hidden
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-light text-brand-dark"
                >
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-3 text-xl font-semibold">{benefit.title}</h3>
                <p className="mt-2 leading-relaxed text-stone-600">{benefit.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-stone-50">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Besoin de volume ? Devenez partenaire
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-stone-700">
            Vous recrutez régulièrement — personnel saisonnier, renforts en
            magasin, ouvriers de chantier ? Nous préparons une offre
            partenaire : envoi ciblé de profils correspondant à vos besoins et
            accès privilégié à la base de candidats.{" "}
            <Link href="/contact" className="font-semibold text-brand hover:underline">
              Parlons-en dès maintenant
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
