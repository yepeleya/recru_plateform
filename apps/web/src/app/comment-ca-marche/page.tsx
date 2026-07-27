import type { Metadata } from "next";
import Link from "next/link";
import { UserPlus, Megaphone, MessageCircle, ClipboardList, Search, Handshake } from "lucide-react";

export const metadata: Metadata = {
  title: "Comment trouver un petit job rapidement en Côte d'Ivoire",
  description:
    "Découvrez comment trouver un petit job rapidement avec Bara : créez votre CV, publiez votre profil et répondez aux offres près de chez vous à Abidjan.",
  alternates: { canonical: "/comment-ca-marche" },
  openGraph: {
    title: "Comment trouver un petit job rapidement en Côte d'Ivoire",
    description:
      "Créez votre CV, publiez votre profil et répondez aux offres près de chez vous : le fonctionnement de Bara expliqué pas à pas.",
    url: "/comment-ca-marche",
  },
};

const CANDIDATE_STEPS = [
  {
    icon: UserPlus,
    title: "Crée ton compte et ton CV",
    text: "Le générateur de CV intégré te guide section par section : expériences, formation, compétences, langues. Aucun logiciel à installer.",
  },
  {
    icon: Megaphone,
    title: "Publie ton profil",
    text: "Choisis ton métier, ta ville et tes disponibilités. Ton profil devient visible dans la base de candidats consultée par les recruteurs.",
  },
  {
    icon: MessageCircle,
    title: "Réponds aux offres ou laisse-toi contacter",
    text: "Les recruteurs publient des missions avec le budget et la période. Tu peux postuler, ou être contacté directement en privé.",
  },
] as const;

const RECRUITER_STEPS = [
  {
    icon: ClipboardList,
    title: "Publie ton offre",
    text: "Décris la mission, ce que tu es prêt à payer et la période. C'est gratuit au lancement.",
  },
  {
    icon: Search,
    title: "Ou parcours les profils",
    text: "Filtre par métier et par ville, consulte les CV, et contacte directement les candidats qui t'intéressent.",
  },
  {
    icon: Handshake,
    title: "Mets-toi d'accord et travaillez",
    text: "L'échange se fait en direct : messagerie, appel, rencontre. Bara fait la mise en relation, vous faites le reste.",
  },
] as const;

export default function CommentCaMarchePage() {
  return (
    <main>
      <section className="relative isolate overflow-hidden bg-night">
        <div
          aria-hidden
          className="animate-blob absolute -left-20 -top-20 h-80 w-80 rounded-full bg-accent/40 blur-3xl"
        />
        <div className="relative mx-auto max-w-3xl px-4 py-20">
          <h1 className="animate-fade-up font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
            Comment trouver un petit job rapidement avec Bara
          </h1>
          <p className="animate-fade-up anim-delay-1 mt-6 text-lg leading-relaxed text-stone-300">
            Bara fonctionne comme un pont entre deux mondes : d&apos;un côté,
            des personnes prêtes à travailler — freelances, étudiants,
            artisans, personnel de maison — et de l&apos;autre, des
            entreprises et des particuliers qui ont besoin de
            main-d&apos;œuvre, tout de suite.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4">
        <section className="py-16">
          <p className="text-sm font-bold uppercase tracking-widest text-brand">
            Candidats
          </p>
          <h2 className="font-display mt-2 text-2xl font-bold sm:text-3xl">
            Si tu cherches un job
          </h2>
          <ol className="mt-8 space-y-5">
            {CANDIDATE_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
              <li
                key={step.title}
                className="card-lift flex gap-4 rounded-2xl border border-stone-200 bg-white p-6"
              >
                <span
                  aria-hidden
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand-dark"
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-stone-400">
                    Étape {i + 1}
                  </p>
                  <h3 className="mt-0.5 text-lg font-semibold">
                    {step.title}
                  </h3>
                  <p className="mt-1 leading-relaxed text-stone-600">
                    {step.text}
                  </p>
                </div>
              </li>
              );
            })}
          </ol>
        </section>

        <section className="py-16">
          <p className="text-sm font-bold uppercase tracking-widest text-accent">
            Recruteurs
          </p>
          <h2 className="font-display mt-2 text-2xl font-bold sm:text-3xl">
            Si tu recrutes
          </h2>
          <ol className="mt-8 space-y-5">
            {RECRUITER_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
              <li
                key={step.title}
                className="card-lift flex gap-4 rounded-2xl border border-stone-200 bg-white p-6"
              >
                <span
                  aria-hidden
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent"
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-stone-400">
                    Étape {i + 1}
                  </p>
                  <h3 className="mt-0.5 text-lg font-semibold">
                    {step.title}
                  </h3>
                  <p className="mt-1 leading-relaxed text-stone-600">
                    {step.text}
                  </p>
                </div>
              </li>
              );
            })}
          </ol>
        </section>

        <section className="py-16">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            Combien ça coûte ?
          </h2>
          <p className="mt-4 leading-relaxed text-stone-700">
            Au lancement, Bara est entièrement gratuit, pour les candidats
            comme pour les recruteurs. Des options payantes (mise en avant de
            profil, offres premium pour les entreprises partenaires)
            arriveront quand la plateforme aura fait ses preuves.
          </p>
        </section>

        <section className="mb-20 rounded-3xl bg-gradient-to-br from-brand to-brand-dark p-9 text-center text-white sm:p-12">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            Prêt à commencer ?
          </h2>
          <p className="mt-2 text-white/90">
            La première étape, c&apos;est ton CV. Il te suit partout sur Bara.
          </p>
          <Link
            href="/creer-un-cv"
            className="btn-pop mt-6 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-brand-dark"
          >
            Créer mon CV gratuitement <span aria-hidden>→</span>
          </Link>
        </section>
      </div>
    </main>
  );
}
