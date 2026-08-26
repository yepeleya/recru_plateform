import type { Metadata } from "next";
import Link from "next/link";
import {
  Search,
  MapPin,
  Briefcase,
  ArrowRight,
  Sparkles,
  BadgeCheck,
  ShieldCheck,
  Fingerprint,
  Info,
  MessageSquare,
  UserPlus,
  Phone,
  FilePlus,
  Users,
  CheckCircle2,
  Check,
  type LucideIcon,
} from "lucide-react";
import { METIERS } from "@bara/shared-types";
import { getMetierIcon } from "@/lib/metier-icons";
import { getFeaturedOffers, getWorkerProfiles } from "@/lib/data";
import { buttonVariants, cn } from "@/components/ui";
import { JobCard, CandidateCard, FilterChip } from "@/components/patterns";

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

const TRUST = [
  { icon: ShieldCheck, title: "Profils vérifiés", text: "Chaque profil est soumis à une vérification avant d'être visible sur la plateforme." },
  { icon: Fingerprint, title: "Identité contrôlée", text: "Une pièce d'identité valide (CNI, passeport) est demandée à l'inscription." },
  { icon: Info, title: "Informations claires", text: "Tarifs, horaires et missions sont définis explicitement dès le départ." },
  { icon: MessageSquare, title: "Mise en relation directe", text: "Discutez et accordez-vous en direct avec les recruteurs ou les candidats." },
] as const;

const CANDIDATE_STEPS = [
  { icon: UserPlus, title: "Créez votre profil", text: "Complétez vos infos, vos expériences et votre pièce d'identité." },
  { icon: Search, title: "Trouvez une mission", text: "Parcourez les offres autour de vous et postulez en un clic." },
  { icon: Phone, title: "Contactez le recruteur", text: "Discutez des détails et démarrez la mission." },
] as const;

const RECRUITER_STEPS = [
  { icon: FilePlus, title: "Publiez votre besoin", text: "Détaillez la mission, le lieu et la rémunération proposée." },
  { icon: Users, title: "Trouvez un candidat", text: "Recevez des candidatures ou contactez directement les profils." },
  { icon: CheckCircle2, title: "Concluez", text: "Validez les compétences et fixez le rendez-vous de la mission." },
] as const;

const CV_BULLETS = [
  "Modèles modernes et élégants",
  "Téléchargement PDF gratuit",
  "Optimisé pour les recruteurs Bara",
] as const;

export default async function HomePage() {
  const [featuredOffers, availableProfiles] = await Promise.all([
    getFeaturedOffers(3),
    getWorkerProfiles({ availableNow: true }),
  ]);
  const featuredProfiles = availableProfiles.slice(0, 4);
  const popularMetiers = METIERS.slice(0, 12);

  return (
    <main>
      {/* ----------------------------------------------------------- HERO */}
      <section className="bg-surface">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles aria-hidden className="h-3.5 w-3.5" />
              Le travail temporaire en Côte d'Ivoire
            </span>
            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl">
              Le bon job.
              <br />
              La bonne personne.
              <br />
              <span className="text-primary">Au bon moment.</span>
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
              Bara met en relation les personnes qui cherchent des petits jobs,
              missions ponctuelles et emplois saisonniers avec ceux qui
              recrutent. Simple, rapide et sécurisé.
            </p>

            {/* Barre de recherche — navigue vers /offres (câblage fin en FRONT-2) */}
            <form
              action="/offres"
              method="get"
              className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-3 shadow-sm md:flex-row md:items-center"
            >
              <div className="flex flex-1 items-center gap-2 rounded-md border border-transparent bg-surface-2 px-3 py-2 focus-within:border-primary">
                <Briefcase aria-hidden className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  type="text"
                  name="q"
                  placeholder="Métier ou mot-clé"
                  aria-label="Métier ou mot-clé"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex flex-1 items-center gap-2 rounded-md border border-transparent bg-surface-2 px-3 py-2 focus-within:border-primary">
                <MapPin aria-hidden className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  type="text"
                  name="lieu"
                  placeholder="Abidjan, Bouaké…"
                  aria-label="Lieu"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Search aria-hidden className="h-4 w-4" />
                Rechercher
              </button>
            </form>

            <div className="flex flex-wrap gap-3">
              <Link href="/offres" className={buttonVariants({ variant: "primary" })}>
                Trouver un job
              </Link>
              <Link
                href="/candidats"
                className="inline-flex h-11 items-center justify-center rounded-md bg-accent-soft px-6 text-sm font-semibold text-accent transition-colors hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Trouver un candidat
              </Link>
            </div>
          </div>

          {/* Visuel incliné + carte flottante (placeholder CSP-safe, vrai asset en FRONT-2) */}
          <div className="relative hidden lg:block">
            <div
              aria-hidden
              className="absolute -right-8 -top-8 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
            />
            <div
              aria-hidden
              className="relative aspect-[4/5] rotate-2 rounded-2xl border-4 border-surface bg-gradient-to-br from-primary via-primary-hover to-accent shadow-2xl transition-transform duration-500 hover:rotate-0"
            />
            <div className="absolute -bottom-6 -left-6 flex items-center gap-3 rounded-lg border border-border bg-surface p-4 shadow-xl">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-success-soft text-success">
                <BadgeCheck className="h-6 w-6" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-bold text-foreground">+5000 candidats</p>
                <p className="text-xs text-muted-foreground">vérifiés ce mois</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------- CATÉGORIES */}
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Parcourir par métier</h2>
              <p className="text-sm text-muted-foreground">Les opportunités les plus demandées</p>
            </div>
            <Link
              href="/metiers"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Voir tous les métiers <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularMetiers.map((metier) => (
              <FilterChip key={metier.slug} href={`/metiers/${metier.slug}`} icon={getMetierIcon(metier.slug)}>
                {metier.label}
              </FilterChip>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- OFFRES RÉCENTES */}
      {featuredOffers.length > 0 ? (
        <section className="bg-primary-soft">
          <div className="mx-auto max-w-7xl px-4 py-16">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="font-display text-2xl font-bold text-foreground">Offres récentes</h2>
              <Link href="/offres" className="text-sm font-semibold text-primary hover:underline">
                Voir toutes les offres
              </Link>
            </div>
            <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {featuredOffers.map((offer) => (
                <li key={offer.id}>
                  <JobCard offer={offer} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* --------------------------------------------- CANDIDATS DISPONIBLES */}
      {featuredProfiles.length > 0 ? (
        <section className="bg-background">
          <div className="mx-auto max-w-7xl px-4 py-16">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="font-display text-2xl font-bold text-foreground">Candidats disponibles</h2>
              <Link href="/candidats" className="text-sm font-semibold text-primary hover:underline">
                Trouver un candidat
              </Link>
            </div>
            <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {featuredProfiles.map((profile) => (
                <li key={profile.id}>
                  <CandidateCard profile={profile} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* -------------------------------------------------------- CONFIANCE */}
      <section className="bg-primary-soft">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Pourquoi faire confiance à Bara ?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Nous sécurisons chaque étape de la mise en relation pour garantir
              votre sérénité.
            </p>
            <ul className="mt-8 space-y-5">
              {TRUST.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.title} className="flex gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface text-primary shadow-sm">
                      <Icon className="h-6 w-6" aria-hidden />
                    </span>
                    <div>
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          {/* Visuel de confiance (placeholder décoratif) */}
          <div aria-hidden className="hidden lg:block">
            <div className="flex aspect-square items-center justify-center rounded-3xl bg-gradient-to-br from-primary via-primary-hover to-accent shadow-xl">
              <ShieldCheck className="h-32 w-32 text-primary-foreground/90" />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ COMMENT ÇA MARCHE */}
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="mb-10 text-center">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Comment ça marche ?</h2>
            <p className="mt-2 text-muted-foreground">Choisissez votre profil pour commencer</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <StepColumn title="Je suis candidat" index={1} tone="primary" steps={CANDIDATE_STEPS} />
            <StepColumn title="Je suis recruteur" index={2} tone="accent" steps={RECRUITER_STEPS} />
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- CV BANNER */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid items-stretch overflow-hidden rounded-3xl bg-primary text-primary-foreground lg:grid-cols-2">
          <div className="space-y-4 p-8 lg:p-12">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              Créez votre CV directement sur Bara
            </h2>
            <p className="text-primary-foreground/90">
              Pas besoin d'ordinateur ni de logiciel : un CV professionnel prêt à
              l'emploi en quelques minutes.
            </p>
            <ul className="space-y-2">
              {CV_BULLETS.map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm">
                  <Check aria-hidden className="h-4 w-4 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
            <Link
              href="/creer-un-cv"
              className="inline-flex items-center gap-2 rounded-md bg-surface px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-surface-2"
            >
              Créer mon CV <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
          {/* Panneau droit distinct (plus clair) avec aperçu CV */}
          <div aria-hidden className="hidden items-center justify-center bg-white/10 p-10 lg:flex">
            <div className="w-full max-w-sm rotate-3 space-y-3 rounded-lg bg-surface p-5 shadow-2xl">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <div className="h-12 w-12 rounded-full bg-muted" />
                <div className="space-y-1.5">
                  <div className="h-3 w-32 rounded bg-muted" />
                  <div className="h-2 w-20 rounded bg-muted" />
                </div>
              </div>
              <div className="h-2 w-full rounded bg-muted" />
              <div className="h-2 w-full rounded bg-muted" />
              <div className="h-2 w-2/3 rounded bg-muted" />
              <div className="mt-4 border-t border-border pt-3">
                <div className="mb-2 h-3 w-24 rounded bg-primary-soft" />
                <div className="flex gap-2">
                  <div className="h-4 w-12 rounded bg-primary-soft" />
                  <div className="h-4 w-12 rounded bg-primary-soft" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- CTA FINAL */}
      <section className="relative overflow-hidden bg-surface-2">
        <Briefcase
          aria-hidden
          className="pointer-events-none absolute -right-6 top-0 h-64 w-64 text-primary/10"
        />
        <div className="relative mx-auto max-w-3xl px-4 py-20 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            Une opportunité peut commencer aujourd'hui.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Rejoignez ceux qui font bouger la Côte d'Ivoire.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/inscription" className={buttonVariants({ variant: "primary", size: "lg" })}>
              Je cherche un job
            </Link>
            <Link href="/inscription" className={buttonVariants({ variant: "outline", size: "lg" })}>
              Je recrute
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

// Colonne « Comment ça marche » — spécifique à l'accueil. Couleur par profil :
// candidat = primary (bleu), recruteur = accent (teal), avec ligne de liaison.
function StepColumn({
  title,
  index,
  tone,
  steps,
}: {
  title: string;
  index: number;
  tone: "primary" | "accent";
  steps: readonly { icon: LucideIcon; title: string; text: string }[];
}) {
  const isTeal = tone === "accent";
  const numBg = isTeal ? "bg-accent" : "bg-primary";
  const circle = isTeal ? "border-accent text-accent" : "border-primary text-primary";
  const line = isTeal ? "bg-accent/20" : "bg-primary/20";
  const panel = isTeal ? "border-accent-soft bg-accent-soft/40" : "border-border bg-surface";

  return (
    <div className={cn("rounded-lg border p-6", panel)}>
      <div className="mb-6 flex items-center gap-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-full font-bold text-white", numBg)}>
          {index}
        </div>
        <h3 className="font-display text-xl font-bold text-foreground">{title}</h3>
      </div>
      <ol className="relative space-y-6">
        <span aria-hidden className={cn("absolute bottom-3 left-5 top-3 w-0.5", line)} />
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <li key={step.title} className="relative flex gap-4">
              <span className={cn("relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-surface", circle)}>
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div className="pt-1.5">
                <h4 className="font-semibold text-foreground">{step.title}</h4>
                <p className="mt-0.5 text-sm text-muted-foreground">{step.text}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
