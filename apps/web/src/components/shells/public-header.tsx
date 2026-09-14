"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/components/ui";
import { SITE_NAME } from "@/lib/site";

// En-tête public — extrait de layout.tsx (F1.1 shells) + ajout d'un menu mobile
// (absent auparavant). Identité Bara : tokens sémantiques, Hanken (font-display),
// icônes Lucide. Client component pour l'état ouvert/fermé du menu mobile.

const NAV_LINKS = [
  { href: "/offres", label: "Offres" },
  { href: "/candidats", label: "Profils" },
  { href: "/metiers", label: "Métiers" },
  { href: "/comment-ca-marche", label: "Comment ça marche" },
] as const;

export function PublicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/85 backdrop-blur-md">
      <nav
        aria-label="Navigation principale"
        className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5"
      >
        <Link
          href="/"
          className="font-display text-2xl font-bold tracking-tight text-foreground"
        >
          {SITE_NAME}
          <span className="text-primary">.</span>
        </Link>

        {/* Navigation desktop */}
        <ul className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "rounded text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive(link.href)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary",
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Actions desktop */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/connexion"
            className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Connexion
          </Link>
          <Link
            href="/inscription"
            className="btn-pop inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Inscription
          </Link>
        </div>

        {/* Bouton menu mobile */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          className="inline-flex items-center justify-center rounded-md p-2 text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Panneau mobile */}
      {open ? (
        <div id="mobile-menu" className="border-t border-border bg-surface md:hidden">
          <ul className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={cn(
                    "block rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive(link.href)
                      ? "bg-primary-soft text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="mt-2 flex gap-2 border-t border-border pt-3">
              <Link
                href="/connexion"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-md border border-border px-4 py-2.5 text-center text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Connexion
              </Link>
              <Link
                href="/inscription"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-md bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground"
              >
                Inscription
              </Link>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  );
}
