import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/components/ui";

// FilterBar — conteneur d'une ligne de filtres (libellé optionnel + chips).
// FilterChip — puce de filtre réutilisable (rend un <Link> pour les filtres
// SSR par query-string, ou un <button> si onClick est fourni). Mutualise le
// markup de chip répété dans /offres et /profils.

interface FilterBarProps {
  label?: string;
  children: ReactNode;
  className?: string;
}

export function FilterBar({ label, children, className }: FilterBarProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {label ? <span className="text-sm font-semibold text-muted-foreground">{label}</span> : null}
      {children}
    </div>
  );
}

interface FilterChipProps {
  active?: boolean;
  icon?: LucideIcon;
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}

const chipClass = (active: boolean, className?: string) =>
  cn(
    "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    active
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border bg-surface text-foreground hover:border-primary hover:text-primary",
    className,
  );

export function FilterChip({ active = false, icon: Icon, children, href, onClick, className }: FilterChipProps) {
  const body = (
    <>
      {Icon ? <Icon aria-hidden className="h-4 w-4 shrink-0" /> : null}
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} aria-current={active ? "true" : undefined} className={chipClass(active, className)}>
        {body}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={chipClass(active, className)}>
      {body}
    </button>
  );
}
