import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { SITE_NAME } from "@/lib/site";

// Pied de page public — style de la maquette Stitch (accueil) : fond clair
// bleuté, 4 colonnes (marque, Navigation, Support & Légal, Contact), puis barre
// inférieure. Tokens Bara, icônes Lucide. Aucun lien factice ni coordonnée
// inventée (V22).

const NAVIGATION = [
  { href: "/a-propos", label: "À propos" },
  { href: "/offres", label: "Offres d'emploi" },
  { href: "/candidats", label: "Profils candidats" },
  { href: "/metiers", label: "Métiers" },
] as const;

const SUPPORT = [
  { href: "/tarifs", label: "Tarifs" },
  { href: "/contact", label: "Contact" },
  { href: "/conditions", label: "Conditions d'utilisation" },
  { href: "/confidentialite", label: "Confidentialité" },
] as const;

export function PublicFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-primary-soft">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-14 md:grid-cols-4">
        {/* Marque */}
        <div className="col-span-2 space-y-4 md:col-span-1">
          <p className="font-display text-xl font-bold text-foreground">
            {SITE_NAME}
          </p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Petits jobs et missions en Côte d'Ivoire.
          </p>
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

        {/* Contact — uniquement des coordonnées réelles (V22). */}
        <div>
          <h2 className="mb-4 text-sm font-bold text-foreground">Contact</h2>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" aria-hidden />
              <a href="tel:+2250708239807" className="transition-colors hover:text-primary">
                07 08 23 98 07
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden /> Abidjan, Abobo Dokui
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
