import type { Metadata } from "next";
import Link from "next/link";
import { UserRound, Briefcase, Star, Sparkles, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Créer un CV en ligne gratuit et professionnel",
  description:
    "Créez un CV en ligne gratuit en quelques minutes avec Bara : modèles professionnels, formulaire guidé et publication directe de votre profil candidat.",
  alternates: { canonical: "/creer-un-cv" },
  openGraph: {
    title: "Créer un CV en ligne gratuit et professionnel",
    description:
      "Modèles professionnels, formulaire guidé et publication directe de votre profil candidat : créez votre CV en quelques minutes.",
    url: "/creer-un-cv",
  },
};

const SECTIONS = [
  {
    icon: UserRound,
    title: "Informations personnelles",
    text: "Nom, contact, titre professionnel, photo : tout ce qui permet à un recruteur de t'identifier en un coup d'œil.",
  },
  {
    icon: Briefcase,
    title: "Expériences et formation",
    text: "Ajoute tes postes, missions et diplômes avec des descriptions claires. Même les petits jobs comptent : ils prouvent que tu sais travailler.",
  },
  {
    icon: Star,
    title: "Compétences et langues",
    text: "Indique ton niveau pour chaque compétence et chaque langue. C'est souvent ce qui fait la différence sur une mission ponctuelle.",
  },
] as const;

export default function CreerUnCvPage() {
  return (
    <main>
      <section className="relative isolate overflow-hidden bg-night">
        <div
          aria-hidden
          className="animate-blob absolute -right-20 -top-24 h-80 w-80 rounded-full bg-brand/40 blur-3xl"
        />
        <div className="relative mx-auto max-w-3xl px-4 py-20">
          <h1 className="animate-fade-up font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
            Créer un CV en ligne gratuit, directement dans Bara
          </h1>
          <p className="animate-fade-up anim-delay-1 mt-6 text-lg leading-relaxed text-stone-300">
            Pas un simple formulaire à remplir : un vrai générateur de CV. Tu
            renseignes tes informations une seule fois, tu choisis un modèle
            professionnel, et ton CV est prêt à être publié sur ton profil
            Bara ou téléchargé pour tes candidatures.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4">
        <section className="py-16">
          <p className="text-sm font-bold uppercase tracking-widest text-brand">
            Ton CV, section par section
          </p>
          <h2 className="font-display mt-2 text-2xl font-bold sm:text-3xl">
            Ce que contient ton CV
          </h2>
          <div className="mt-8 space-y-5">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
              <article
                key={section.title}
                className="card-lift flex gap-4 rounded-2xl border border-stone-200 bg-white p-6"
              >
                <span
                  aria-hidden
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand-dark"
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold">{section.title}</h3>
                  <p className="mt-1 leading-relaxed text-stone-600">
                    {section.text}
                  </p>
                </div>
              </article>
              );
            })}
          </div>
        </section>

        <section className="mb-20 rounded-3xl bg-gradient-to-br from-brand to-brand-dark p-9 text-center text-white sm:p-12">
          <span
            aria-hidden
            className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/15"
          >
            <Sparkles className="h-6 w-6" />
          </span>
          <h2 className="font-display mt-3 text-2xl font-bold sm:text-3xl">
            Essaie l&apos;éditeur maintenant
          </h2>
          <p className="mx-auto mt-3 max-w-xl leading-relaxed text-white/90">
            Remplis tes informations et regarde ton CV se construire en
            direct. Ton travail est gardé automatiquement pendant que tu
            remplis, sans même créer de compte.
          </p>
          <Link
            href="/creer-un-cv/nouveau"
            className="btn-pop mt-6 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-brand-dark"
          >
            Commencer mon CV <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </main>
  );
}
