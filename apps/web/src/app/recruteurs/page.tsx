import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, FileText, Building2, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Recruter du personnel ponctuel en Côte d'Ivoire",
  description:
    "Entreprise ou particulier : publiez une offre de mission ou d'emploi en Côte d'Ivoire et recevez des candidatures sur Bara.",
  alternates: { canonical: "/recruteurs" },
  openGraph: {
    title: "Recruter du personnel ponctuel en Côte d'Ivoire",
    description:
      "Publiez une offre de mission ou d'emploi et recevez des candidatures sur Bara.",
    url: "/recruteurs",
  },
};

// Chaque avantage décrit une capacité réellement disponible aujourd'hui (V22).
const BENEFITS = [
  {
    icon: FileText,
    title: "Des candidatures avec CV",
    text: "Pour postuler, un candidat doit avoir un CV sur Bara : chaque candidature est accompagnée du sien.",
  },
  {
    icon: ShieldCheck,
    title: "Une pièce d'identité à l'inscription",
    text: "Chaque compte, candidat comme recruteur, fournit une pièce d'identité lors de son inscription.",
  },
  {
    icon: Building2,
    title: "Entreprises et particuliers",
    text: "Startups, boutiques, supermarchés, agences ou particuliers : un compte adapté à chacun, avec votre numéro RCCM si vous êtes une entreprise.",
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
            Publiez votre offre, recevez des candidatures
          </h1>
          <p className="animate-fade-up anim-delay-1 mt-6 max-w-xl text-lg leading-relaxed text-stone-300">
            Entreprise ou particulier, publiez sur Bara vos missions
            ponctuelles, renforts saisonniers, postes à temps partiel ou à
            temps plein, et recevez les candidatures des personnes intéressées.
          </p>
          <div className="animate-fade-up anim-delay-2 mt-8 flex flex-wrap gap-4">
            <Link
              href="/inscription"
              className="btn-pop inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 font-semibold text-white"
            >
              Créer mon compte recruteur <ArrowRight aria-hidden className="h-4 w-4" />
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
