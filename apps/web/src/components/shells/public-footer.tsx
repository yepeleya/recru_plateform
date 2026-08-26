import Link from "next/link";
import { QrCode, Share2, Link2, Mail, Phone, MapPin } from "lucide-react";
import { SITE_NAME } from "@/lib/site";

// Pied de page public — style de la maquette Stitch (accueil) : fond clair
// bleuté, 4 colonnes (marque + réseaux, Navigation, Support & Légal, Contact),
// puis barre inférieure. Tokens Bara, icônes Lucide.

const NAVIGATION = [
  { href: "/a-propos", label: "À propos" },
  { href: "/offres", label: "Offres d'emploi" },
  { href: "/candidats", label: "Profils candidats" },
  { href: "/metiers", label: "Métiers" },
] as const;

const SUPPORT = [
  { href: "/tarifs", label: "Tarifs" },
  { href: "/contact", label: "Aide / FAQ" },
  { href: "/conditions", label: "Conditions d'utilisation" },
  { href: "/confidentialite", label: "Confidentialité" },
] as const;

export function PublicFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-primary-soft">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-14 md:grid-cols-4">
        {/* Marque + réseaux */}
        <div className="col-span-2 space-y-4 md:col-span-1">
          <p className="font-display text-xl font-bold text-foreground">
            {SITE_NAME}
          </p>
          <p className="max-w-xs text-sm text-muted-foreground">
            La plateforme de référence pour le travail temporaire et les missions
            rapides en Côte d'Ivoire.
          </p>
          <div className="flex gap-3">
            <a href="#" aria-label="QR code" className="text-muted-foreground transition-colors hover:text-primary">
              <QrCode className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Partager" className="text-muted-foreground transition-colors hover:text-primary">
              <Share2 className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Lien" className="text-muted-foreground transition-colors hover:text-primary">
              <Link2 className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Navigation */}
        <nav aria-label="Navigation">
          <h2 className="mb-4 text-sm font-bold text-foreground">Navigation</h2>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            {NAVIGATION.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-primary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Support & Légal */}
        <nav aria-label="Support et informations légales">
          <h2 className="mb-4 text-sm font-bold text-foreground">Support &amp; Légal</h2>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            {SUPPORT.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-primary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact */}
        <div>
          <h2 className="mb-4 text-sm font-bold text-foreground">Contact</h2>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" aria-hidden /> contact@bara.ci
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" aria-hidden /> +225 07 00 00 00 00
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden /> Abidjan, Plateau
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} {SITE_NAME} Côte d'Ivoire. Tous droits réservés.</p>
          <div className="flex gap-4">
            <Link href="/confidentialite" className="transition-colors hover:text-primary">Cookies</Link>
            <Link href="/conditions" className="transition-colors hover:text-primary">Mentions légales</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
