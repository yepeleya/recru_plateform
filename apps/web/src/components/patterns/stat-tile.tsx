import type { LucideIcon } from "lucide-react";
import { cn } from "@/components/ui";

// StatTile — tuile de statistique (KPI) pour les tableaux de bord candidat,
// recruteur et admin. Présentational : la valeur et le libellé sont fournis.

type StatTone = "primary" | "success" | "warning" | "danger" | "neutral";

const VALUE_TONE: Record<StatTone, string> = {
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  neutral: "text-foreground",
};

interface StatTileProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: StatTone;
  className?: string;
}

export function StatTile({ label, value, hint, icon: Icon, tone = "primary", className }: StatTileProps) {
  return (
    <div className={cn("rounded-lg border border-border bg-surface p-5 shadow-sm", className)}>
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {Icon ? <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden /> : null}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className={cn("font-display text-3xl font-bold", VALUE_TONE[tone])}>{value}</span>
        {hint ? <span className="text-xs font-medium text-muted-foreground">{hint}</span> : null}
      </div>
    </div>
  );
}
