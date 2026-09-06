"use client";

// CTA « Postuler ». Consommateur léger de <ApplyProvider> : aucune machine à états
// locale, aucune logique métier, aucun modal. Plusieurs CTA sur une même page
// (aside + barre fixe mobile) partagent donc exactement le même état.
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui";
import { useApply } from "./apply-provider";

interface ApplyButtonProps {
  className?: string;
  label?: string;
}

export function ApplyButton({ className, label = "Postuler" }: ApplyButtonProps) {
  const { phase, apply } = useApply();
  const disabled = phase !== "idle";

  return (
    <Button
      type="button"
      onClick={apply}
      disabled={disabled}
      aria-busy={phase === "loading"}
      className={className}
    >
      {phase === "loading" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
      {phase === "applied" ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : null}
      {phase === "loading"
        ? "Candidature en cours…"
        : phase === "applied"
          ? "Candidature envoyée"
          : phase === "duplicate"
            ? "Déjà postulé"
            : phase === "closed"
              ? "Offre fermée"
              : label}
    </Button>
  );
}
