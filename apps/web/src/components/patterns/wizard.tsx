import { Check } from "lucide-react";
import { cn } from "@/components/ui";

// Wizard — indicateur d'étapes (stepper) réutilisé par l'inscription (5 étapes)
// et la création d'offre (5 étapes). Présentational : la page possède l'état
// (étape courante), le contenu et les boutons Précédent/Suivant. Ici on affiche
// seulement la progression.

interface WizardProps {
  /** Libellés des étapes, dans l'ordre. */
  steps: string[];
  /** Index (0-based) de l'étape courante. */
  current: number;
  className?: string;
}

export function Wizard({ steps, current, className }: WizardProps) {
  return (
    <div className={className}>
      {/* Résumé compact (mobile) */}
      <div className="mb-3 flex items-center justify-between md:hidden">
        <span className="text-sm font-semibold text-foreground">
          {steps[current] ?? ""}
        </span>
        <span className="text-xs font-medium text-muted-foreground">
          Étape {Math.min(current + 1, steps.length)} / {steps.length}
        </span>
      </div>

      {/* Stepper détaillé (desktop) */}
      <ol className="hidden items-center gap-2 md:flex" aria-label="Progression">
        {steps.map((label, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <li key={label} className="flex flex-1 items-center gap-2 last:flex-none">
              <div className="flex items-center gap-2">
                <span
                  aria-current={active ? "step" : undefined}
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
                    done && "border-primary bg-primary text-primary-foreground",
                    active && "border-primary bg-primary-soft text-primary",
                    !done && !active && "border-border bg-surface text-muted-foreground",
                  )}
                >
                  {done ? <Check className="h-4 w-4" aria-hidden /> : index + 1}
                </span>
                <span
                  className={cn(
                    "text-sm font-medium",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </div>
              {index < steps.length - 1 ? (
                <span
                  aria-hidden
                  className={cn(
                    "h-px flex-1",
                    index < current ? "bg-primary" : "bg-border",
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
