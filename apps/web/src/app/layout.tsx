import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import { Heart } from "lucide-react";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Petits jobs et recrutement en Côte d'Ivoire`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Bara met en relation ceux qui cherchent un petit job et ceux qui recrutent en Côte d'Ivoire. Créez votre CV, publiez votre profil, trouvez votre bara.",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "fr_CI",
  },
};

const NAV_LINKS = [
  { href: "/offres", label: "Offres" },
  { href: "/profils", label: "Profils" },
  { href: "/metiers", label: "Métiers" },
] as const;

const FOOTER_PLATFORM_LINKS = [
  { href: "/offres", label: "Offres de jobs" },
  { href: "/profils", label: "Profils candidats" },
  { href: "/metiers", label: "Tous les métiers" },
  { href: "/creer-un-cv", label: "Créer un CV" },
  { href: "/recruteurs", label: "Espace recruteur" },
] as const;

const FOOTER_ABOUT_LINKS = [
  { href: "/comment-ca-marche", label: "Comment ça marche" },
  { href: "/jobs-vacances", label: "Jobs de vacances" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
] as const;

const FOOTER_LEGAL_LINKS = [
  { href: "/conditions", label: "Conditions d'utilisation" },
  { href: "/confidentialite", label: "Confidentialité" },
] as const;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${inter.variable} ${grotesk.variable}`}>
      <body className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 border-b border-stone-200/70 bg-white/85 backdrop-blur-md">
          <nav
            aria-label="Navigation principale"
            className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5"
          >
            <Link
              href="/"
              className="font-display text-2xl font-bold tracking-tight"
            >
              {SITE_NAME}
              <span className="text-brand">.</span>
            </Link>
            <ul className="flex items-center gap-2 sm:gap-6">
              {NAV_LINKS.map((link) => (
                <li key={link.href} className="hidden sm:block">
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-stone-600 transition-colors hover:text-brand"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/creer-un-cv"
                  className="btn-pop inline-block rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Créer mon CV
                </Link>
              </li>
            </ul>
          </nav>
        </header>

        {children}

        <footer className="mt-auto bg-night text-stone-300">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-3">
            <div>
              <p className="font-display text-2xl font-bold text-white">
                {SITE_NAME}
                <span className="text-brand">.</span>
              </p>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-stone-400">
                La mise en relation des petits jobs en Côte d’Ivoire. Crée ton
                CV, publie ton profil, trouve ton bara.
              </p>
            </div>
            <nav aria-label="Liens du pied de page">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">
                Plateforme
              </h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                {FOOTER_PLATFORM_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="transition-colors hover:text-brand"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Liens d'information">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">
                Bara
              </h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                {FOOTER_ABOUT_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="transition-colors hover:text-brand"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="border-t border-white/10">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-xs text-stone-500">
              <p className="inline-flex flex-wrap items-center gap-1">
                © {new Date().getFullYear()} {SITE_NAME}. Tous droits réservés —
                fait avec
                <Heart aria-label="passion" className="h-3.5 w-3.5 fill-danger text-danger" />
                à Abidjan.
              </p>
              <ul className="flex gap-4">
                {FOOTER_LEGAL_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="transition-colors hover:text-brand">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
