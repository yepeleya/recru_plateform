import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/components/ui";

// ApplicationRow — ligne de candidature générique, réutilisée côté candidat
// (« mes candidatures ») et recruteur (« candidatures reçues »). Le statut est
// injecté (typiquement un <StatusBadge>), les actions aussi.

interface ApplicationRowProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  status?: ReactNode;
  action?: ReactNode;
  href?: string;
  className?: string;
}

export function ApplicationRow({
  icon: Icon,
  title,
  subtitle,
  status,
  action,
  href,
  className,
}: ApplicationRowProps) {
  const inner = (
    <>
      <div className="flex min-w-0 items-center gap-3">
        {Icon ? (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
        ) : null}
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">{title}</p>
          {subtitle ? <p className="truncate text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {status}
        {action}
      </div>
    </>
  );

  const base = "flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4";

  return href ? (
    <Link
      href={href}
      className={cn(
        base,
        "transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {inner}
    </Link>
  ) : (
    <div className={cn(base, className)}>{inner}</div>
  );
}
