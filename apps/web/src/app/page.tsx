import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Rocket, Handshake, UserRound, Building2, Sparkles, ArrowRight } from "lucide-react";
import { METIER_CATEGORIES, METIERS, getMetiersByCategorie } from "@bara/shared-types";
import { getMetierIcon } from "@/lib/metier-icons";

export const metadata: Metadata = {
  title: "Petits jobs en Côte d'Ivoire : trouver ou recruter | Bara",
  description:
    "Trouvez un petit job, un gombo ou un prestataire en quelques minutes à Abidjan. Offres, profils et CV créés directement sur Bara. Gratuit au lancement.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Petits jobs en Côte d'Ivoire : trouver ou recruter | Bara",
    description:
      "Trouvez un petit job, un gombo ou un prestataire en quelques minutes à Abidjan. Offres, profils et CV créés directement sur Bara.",
    url: "/",
  },
};

const STEPS = [
  {
    icon: FileText,
    title: "Crée ton CV en quelques minutes",
    text: "Pas besoin de Word ni de modèle à télécharger : remplis tes informations, choisis un modèle et ton CV professionnel est prêt, directement dans l'application.",
  },
  {
    icon: Rocket,
    title: "Publie ton profil",
    text: "Ton profil devient visible par les entreprises et les particuliers qui recrutent : métier, disponibilités, ville et CV en un seul endroit.",
  },
  {
    icon: Handshake,
    title: "Décroche ton bara",
    text: "Réponds aux offres qui te correspondent ou laisse les recruteurs te contacter directement. Tu discutes, tu t'accordes, tu travailles.",
  },
] as const;

const STATS = [
  { value: "100%", label: "Gratuit au lancement" },
  { value: "0 FCFA", label: "de frais caché" },
  { value: "24/7", label: "profils visibles" },
] as const;

export default function HomePage() {
  const loopedMetiers = [...METIERS, ...METIERS];

  return (
    <main>
      {/* ---------------------------------------------------------- HERO */}
      <section className="relative isolate overflow-hidden bg-night">
        <div
          aria-hidden
          className="animate-blob absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand/40 blur-3xl"
        />
        <div
          aria-hidden
          className="animate-blob absolute -bottom-32 -right-16 h-[28rem] w-[28rem] rounded-full bg-accent/40 blur-3xl"
          style={{ animationDelay: "-6s" }}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(255_255_255/0.08)_1px,transparent_0)] [background-size:28px_28px]"
        />

        <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-16 sm:pt-24">
          <div
            className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm"
          >
            <Sparkles aria-hidden className="h-4 w-4 text-brand" /> Fait pour la jeunesse ivoirienne
          </div>

          <h1 className="animate-fade-up anim-delay-1 font-display mt-6 max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
            Le bon <span className="text-brand">bara</span>{" "}
            pour chaque petit job en Côte d&apos;Ivoire
          </h1>

          <p className="animate-fade-up anim-delay-2 mt-6 max-w-xl text-lg leading-relaxed text-stone-300">
            Bara met en relation les personnes qui cherchent des missions
            ponctuelles, des jobs de vacances ou des prestations freelance
            avec les entreprises et les particuliers qui recrutent. Crée ton
            CV, publie ton profil, trouve ton bara.
          </p>

          <div className="animate-fade-up anim-delay-3 mt-9 flex flex-wrap gap-4">
            <Link
              href="/creer-un-cv"
              className="btn-pop inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 font-semibold text-white"
            >
              Créer mon CV gratuitement
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
            <Link
              href="/comment-ca-marche"
              className="btn-pop inline-flex items-center rounded-full border border-white/20 bg-white/5 px-7 py-3.5 font-semibold text-white backdrop-blur-sm hover:bg-white/10"
            >
              Comment ça marche
            </Link>
          </div>

          <dl className="animate-fade-up anim-delay-4 mt-16 grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-8">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="font-display text-2xl font-bold text-white sm:text-3xl">
                  {stat.value}
                </dt>
                <dd className="mt-1 text-xs text-stone-400 sm:text-sm">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ------------------------------------------------ MARQUEE MÉTIERS */}
      <section
        aria-label="Métiers représentés sur Bara"
        className="overflow-hidden border-b border-stone-200 bg-brand-light py-4"
      >
        <div className="animate-marquee flex w-max gap-3">
          {loopedMetiers.map((metier, i) => {
            const Icon = getMetierIcon(metier.slug);
            return (
              <span
                key={`${metier.slug}-${i}`}
                className="flex items-center gap-2 whitespace-nowrap rounded-full bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm"
              >
                <Icon aria-hidden className="h-4 w-4 shrink-0 text-brand" />
                {metier.label}
              </span>
            );
          })}
        </div>
      </section>

      {/* --------------------------------------------------- COMMENT ÇA MARCHE */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <div className="max-w-xl">
          <p className="text-sm font-bold uppercase tracking-widest text-brand">
            Simple et rapide
          </p>
          <h2 className="font-display mt-2 text-3xl font-bold sm:text-4xl">
            Comment ça marche
          </h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <article
                key={step.title}
                className="card-lift group relative rounded-2xl border border-stone-200 bg-white p-7"
              >
                <span
                  aria-hidden
                  className="absolute -top-4 -left-1 font-display text-6xl font-bold text-stone-100 transition-colors group-hover:text-brand-light"
                >
                  {i + 1}
                </span>
                <div className="relative">
                  <span
                    aria-hidden
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-light text-brand-dark"
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
                  <p className="mt-2 leading-relaxed text-stone-600">
                    {step.text}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ----------------------------------------- CANDIDATS / RECRUTEURS */}
      <section className="bg-stone-50">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-24 sm:grid-cols-2">
          <article className="card-lift rounded-3xl bg-gradient-to-br from-brand to-brand-dark p-9 text-white">
            <span
              aria-hidden
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15"
            >
              <UserRound className="h-6 w-6" />
            </span>
            <h2 className="font-display mt-4 text-2xl font-bold sm:text-3xl">
              Tu cherches un job ?
            </h2>
            <p className="mt-4 leading-relaxed text-white/90">
              Que tu sois graphiste, monteur vidéo, chauffeur, serveuse ou
              étudiant à la recherche d&apos;un job de vacances, Bara te rend
              visible auprès de ceux qui recrutent. Ton CV et ton profil
              travaillent pour toi, même pendant que tu dors.
            </p>
            <Link
              href="/creer-un-cv"
              className="btn-pop mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-brand-dark"
            >
              Créer mon profil <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </article>

          <article className="card-lift rounded-3xl bg-gradient-to-br from-accent to-violet-800 p-9 text-white">
            <span
              aria-hidden
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15"
            >
              <Building2 className="h-6 w-6" />
            </span>
            <h2 className="font-display mt-4 text-2xl font-bold sm:text-3xl">
              Tu recrutes ?
            </h2>
            <p className="mt-4 leading-relaxed text-white/90">
              Entreprise ou particulier, publie une offre en précisant la
              mission, le budget et la période — ou parcours directement
              notre base de profils prêts à travailler. Fini les recherches
              interminables sur les réseaux sociaux.
            </p>
            <Link
              href="/comment-ca-marche"
              className="btn-pop mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-accent"
            >
              Publier une offre <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </article>
        </div>
      </section>

      {/* --------------------------------------------------------- MÉTIERS */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <div className="max-w-xl">
          <p className="text-sm font-bold uppercase tracking-widest text-brand">
            Tous les talents
          </p>
          <h2 className="font-display mt-2 text-3xl font-bold sm:text-4xl">
            Des profils pour tous les métiers
          </h2>
          <p className="mt-4 leading-relaxed text-stone-600">
            {METIERS.length} métiers déjà couverts par Bara, du renfort à
            domicile à la création de contenu. Et la liste s&apos;agrandit
            avec vous.
          </p>
        </div>

        <div className="mt-12 space-y-12">
          {METIER_CATEGORIES.map((categorie) => (
            <div key={categorie.slug}>
              <h3 className="text-lg font-bold text-stone-900">
                {categorie.label}
              </h3>
              <ul className="mt-4 flex flex-wrap gap-3">
                {getMetiersByCategorie(categorie.slug).map((metier) => {
                  const Icon = getMetierIcon(metier.slug);
                  return (
                    <li key={metier.slug}>
                      <Link
                        href={`/metiers/${metier.slug}`}
                        className="card-lift flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium hover:border-brand"
                      >
                        <Icon aria-hidden className="h-4 w-4 shrink-0 text-brand" />
                        {metier.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <Link
          href="/metiers"
          className="mt-10 inline-flex items-center gap-1.5 font-semibold text-brand hover:underline"
        >
          Voir tous les métiers <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </section>

      {/* ------------------------------------------------------------ CTA */}
      <section className="relative isolate overflow-hidden bg-night">
        <div
          aria-hidden
          className="animate-blob absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/30 blur-3xl"
        />
        <div className="relative mx-auto max-w-2xl px-4 py-24 text-center">
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Ton bara t&apos;attend.
          </h2>
          <p className="mt-4 text-lg text-stone-300">
            Crée ton CV maintenant, c&apos;est gratuit et ça prend cinq
            minutes.
          </p>
          <Link
            href="/creer-un-cv"
            className="btn-pop mt-8 inline-flex items-center gap-2 rounded-full bg-brand px-8 py-4 font-semibold text-white"
          >
            Créer mon CV gratuitement <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
