"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/components/ui";

// Primitive de navigation latérale, mutualisée par CandidateSidebar,
// RecruiterSidebar et AdminSidebar (aucune duplication de structure).
// Desktop uniquement (lg+) ; le mobile passe par BottomNavMobile / le header.

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Actif uniquement sur correspondance exacte (racines de tableau de bord). */
  exact?: boolean;
}

interface SidebarNavProps {
  items: NavItem[];
  /** Sous-titre sous la marque (ex. « Espace candidat »). */
  tagline?: string;
  /** Encart optionnel en bas (ex. CTA « Publier une offre »). */
  footer?: ReactNode;
  /** Libellé accessible de la zone de navigation. */
  ariaLabel: string;
}

export function isNavItemActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(item.href + "/");
}

export function SidebarNav({ items, tagline, footer, ariaLabel }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <aside className="sticky left-0 top-0 hidden h-screen w-64 shrink-0 flex-col gap-1 border-r border-border bg-surface p-4 lg:flex">
      <div className="mb-6 px-3">
        <Link
          href="/"
          className="font-display text-3xl font-extrabold leading-none text-primary"
        >
          Bara
        </Link>
        {tagline ? (
          <p className="mt-1 text-xs text-muted-foreground">{tagline}</p>
        ) : null}
      </div>

      <nav className="flex flex-1 flex-col gap-1" aria-label={ariaLabel}>
        {items.map((item) => {
          const active = isNavItemActive(pathname, item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "bg-primary-soft font-semibold text-primary"
                  : "font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {footer ? <div className="mt-auto pt-4">{footer}</div> : null}
    </aside>
  );
}
