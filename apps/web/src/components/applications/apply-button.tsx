"use client";

// Bouton « Postuler » réel : POST /applications, avec gestion complète des retours
// backend (201, 401, 422 CV_REQUIRED, 409 DUPLICATE/OFFER_NOT_OPEN, 403, 404,
// réseau). Encapsule TOUTE la logique métier — la page d'offre reste un Server
// Component simple. Aucune candidature simulée : le succès n'est affiché qu'après
// la réponse 201 de l'API.
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle, FilePlus2 } from "lucide-react";
import { createApplication, ApiError } from "@/lib/api";
import { Button, buttonVariants } from "@/components/ui";
import { Modal } from "@/components/patterns";
import { ImportCvDropzone } from "@/components/candidat/import-cv-dropzone";

type Phase = "idle" | "loading" | "applied" | "duplicate" | "closed";
type ModalState =
  | null
  | { kind: "cv_required" }
  | { kind: "message"; title: string; body: string };

interface ApplyButtonProps {
  offerId: string;
  offerSlug: string;
  className?: string;
  label?: string;
}

export function ApplyButton({ offerId, offerSlug, className, label = "Postuler" }: ApplyButtonProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [modal, setModal] = useState<ModalState>(null);

  async function apply(opts: { fromImport?: boolean } = {}) {
    if (phase === "loading" || phase === "applied") return; // anti double-soumission
    setPhase("loading");
    try {
      await createApplication(offerId);
      // Succès UNIQUEMENT après 201.
      setPhase("applied");
      setModal(null);
    } catch (err) {
      setPhase("idle");
      if (!(err instanceof ApiError)) {
        setModal({ kind: "message", title: "Erreur", body: "Une erreur est survenue." });
        return;
      }
      // 401 → connexion en conservant le contexte de l'offre.
      if (err.status === 401) {
        router.push(`/connexion?next=/offres/${offerSlug}`);
        return;
      }
      // 422 CV_REQUIRED → panneau Importer / Créer (ou message si on vient déjà
      // d'importer, pour éviter une boucle).
      if (err.status === 422 && err.code === "CV_REQUIRED") {
        setModal(
          opts.fromImport
            ? { kind: "message", title: "CV requis", body: err.message }
            : { kind: "cv_required" },
        );
        return;
      }
      if (err.status === 409 && err.code === "DUPLICATE_APPLICATION") {
        setPhase("duplicate");
        setModal({ kind: "message", title: "Candidature déjà envoyée", body: err.message });
        return;
      }
      if (err.status === 409 && err.code === "OFFER_NOT_OPEN") {
        setPhase("closed");
        setModal({ kind: "message", title: "Offre fermée", body: err.message });
        return;
      }
      if (err.status === 404) {
        setModal({
          kind: "message",
          title: "Offre indisponible",
          body: "Cette offre n'est plus disponible.",
        });
        return;
      }
      // 403 (candidature à sa propre offre), 400, 500, réseau → message centralisé.
      setModal({ kind: "message", title: "Impossible de postuler", body: err.message });
    }
  }

  // CV importé et confirmé par l'API → re-soumission automatique de la candidature.
  function handleImported() {
    void apply({ fromImport: true });
  }

  const disabled = phase !== "idle";

  return (
    <>
      <Button
        type="button"
        onClick={() => void apply()}
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

      {/* CV_REQUIRED : importer un PDF (inline, contexte préservé) ou créer un CV */}
      <Modal
        open={modal?.kind === "cv_required"}
        onClose={() => setModal(null)}
        title="Ajoutez un CV pour postuler"
      >
        <p className="text-sm text-muted-foreground">
          Pour postuler à cette offre, vous devez d&apos;abord ajouter un CV.
        </p>
        <div className="mt-4 flex flex-col items-start gap-3">
          <ImportCvDropzone onUploaded={handleImported} label="Importer un PDF" />
          <Link
            href={`/creer-un-cv/nouveau?returnTo=/offres/${offerSlug}`}
            className={buttonVariants({ variant: "outline" })}
          >
            <FilePlus2 className="h-4 w-4" aria-hidden /> Créer mon CV
          </Link>
        </div>
        <div className="mt-5 flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => setModal(null)}>
            Annuler
          </Button>
        </div>
      </Modal>

      {/* Messages précis : déjà postulé / offre fermée / indisponible / erreur */}
      <Modal
        open={modal?.kind === "message"}
        onClose={() => setModal(null)}
        title={modal?.kind === "message" ? modal.title : ""}
        footer={
          <Button variant="outline" size="sm" onClick={() => setModal(null)}>
            Fermer
          </Button>
        }
      >
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden />
          {modal?.kind === "message" ? modal.body : ""}
        </p>
      </Modal>
    </>
  );
}
