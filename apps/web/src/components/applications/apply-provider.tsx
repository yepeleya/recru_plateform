"use client";

// Source de vérité UNIQUE de l'état de candidature pour une page d'offre.
// Toute la logique métier vit ici : authentification (via le 401 de l'API), appel
// POST /applications, mapping des erreurs backend (401 / 422 CV_REQUIRED /
// 409 DUPLICATE_APPLICATION / 409 OFFER_NOT_OPEN / 403 / 404 / réseau), retry
// automatique après import de CV, redirections. Les modals sont rendus ICI une
// seule fois, quel que soit le nombre de CTA sur la page.
//
// Les CTA (aside + barre fixe mobile) consomment cet état via useApply() : ils
// affichent donc toujours le même statut, et une candidature réussie les désactive
// tous les deux immédiatement.
//
// Le provider rend un Fragment (aucun élément DOM ajouté) : le layout et la grille
// de la page restent strictement inchangés.
import { createContext, useContext, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, FilePlus2 } from "lucide-react";
import { createApplication, ApiError } from "@/lib/api";
import { Button, buttonVariants } from "@/components/ui";
import { Modal } from "@/components/patterns";
import { ImportCvDropzone } from "@/components/candidat/import-cv-dropzone";

export type ApplyPhase = "idle" | "loading" | "applied" | "duplicate" | "closed";

type ModalState =
  | null
  | { kind: "cv_required" }
  | { kind: "message"; title: string; body: string };

interface ApplyContextValue {
  phase: ApplyPhase;
  apply: () => void;
}

const ApplyContext = createContext<ApplyContextValue | undefined>(undefined);

export function useApply(): ApplyContextValue {
  const ctx = useContext(ApplyContext);
  if (!ctx) {
    throw new Error("useApply doit être utilisé à l'intérieur de <ApplyProvider>.");
  }
  return ctx;
}

interface ApplyProviderProps {
  offerId: string;
  offerSlug: string;
  children: React.ReactNode;
}

export function ApplyProvider({ offerId, offerSlug, children }: ApplyProviderProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<ApplyPhase>("idle");
  const [modal, setModal] = useState<ModalState>(null);

  async function run(opts: { fromImport?: boolean } = {}) {
    // Une seule requête à la fois, pour tous les CTA de la page.
    if (phase !== "idle") return;
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
    void run({ fromImport: true });
  }

  return (
    <ApplyContext.Provider value={{ phase, apply: () => void run() }}>
      {children}

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
    </ApplyContext.Provider>
  );
}
