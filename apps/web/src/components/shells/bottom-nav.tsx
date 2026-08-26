"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui";
import { isNavItemActive, type NavItem } from "./sidebar-nav";

// Barre de navigation basse — mobile uniquement (masquée en lg+). Générique :
// chaque espace (candidat, recruteur) fournit ses propres items.

interface BottomNavMobileProps {
  items: NavItem[];
  ariaLabel: string;
}

export function BottomNavMobile({ items, ariaLabel }: BottomNavMobileProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label={ariaLabel}
      className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-border bg-surface px-4 py-2 lg:hidden"
    >
      {items.map((item) => {
        const active = isNavItemActive(pathname, item);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-w-16 flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-5 w-5" aria-hidden />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
