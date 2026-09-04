"use client";

// Espace « Votre CV » du candidat. Source de vérité = backend /cvs (jamais le
// localStorage). L'écran lit GET /cvs/me et gère les états : chargement, aucun CV,
// CV importé, CV généré, remplacement, suppression, erreur.
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  FilePlus2,
  FilePen,
  Trash2,
  Eye,
  Loader2,
  AlertCircle,
  RefreshCw,
  X,
} from "lucide-react";
import type { Cv } from "@bara/shared-types";
import { useAuth } from "@/lib/auth/auth-context";
import { getMyCv, deleteCv, cvFileUrl, ApiError } from "@/lib/api";
import { Button, buttonVariants, Card, CardContent, Badge } from "@/components/ui";
import { EmptyState } from "@/components/patterns";
import { ImportCvDropzone } from "./import-cv-dropzone";

function formatBytes(n?: number | null): string {
  if (!n || n <= 0) return "";
  if (n < 1024) return `${n} o`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} Ko`;
  return `${(n / (1024 * 1024)).toFixed(1)} Mo`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

type Status = "loading" | "ready" | "error";

export function CvManager() {
  const router = useRouter();
  const { me, loading: authLoading } = useAuth();

  const [cv, setCv] = useState<Cv | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [replacing, setReplacing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      setCv(await getMyCv());
      setStatus("ready");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de charger votre CV.");
      setStatus("error");
    }
  }, []);

  // Redirection si aucune session (une fois l'auth résolue).
  useEffect(() => {
    if (!authLoading && !me) router.replace("/connexion");
  }, [authLoading, me, router]);

  // Charge le CV réel dès que l'utilisateur connecté est connu.
  useEffect(() => {
    if (me) void load();
  }, [me, load]);

  function handleUploaded() {
    // Le CV n'est considéré actif qu'après refetch de la source de vérité.
    setReplacing(false);
    setConfirmDelete(false);
    void load();
  }

  async function handleDelete() {
    if (!cv) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteCv(cv.id);
      setConfirmDelete(false);
      await load(); // refetch → { cv: null } → retour à l'état « aucun CV »
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "La suppression a échoué.");
    } finally {
      setDeleting(false);
    }
  }

  // Évite le flash « aucun CV » tant que l'auth/CV n'a pas répondu.
  if (authLoading || (me && status === "loading")) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
        <span className="sr-only">Chargement…</span>
      </div>
    );
  }

  if (!me) return null; // redirection en cours

  return (
    <section aria-labelledby="cv-title">
      <h1 id="cv-title" className="text-2xl font-bold tracking-tight text-foreground">
        Votre CV
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Importez votre CV existant en PDF, ou créez-en un gratuitement avec l&apos;éditeur Bara.
        Vous n&apos;avez qu&apos;un seul CV actif à la fois.
      </p>

      {status === "error" ? (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <AlertCircle className="h-8 w-8 text-danger" aria-hidden />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" onClick={() => void load()}>
              <RefreshCw className="h-4 w-4" aria-hidden /> Réessayer
            </Button>
          </CardContent>
        </Card>
      ) : cv === null ? (
        // ---------------------------------------------------- ÉTAT 1 : aucun CV
        <EmptyState
          icon={FileText}
          title="Vous n'avez pas encore ajouté de CV."
          description="Importez votre CV existant au format PDF, ou créez-en un gratuitement avec l'éditeur Bara."
          className="mt-6"
          action={
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <ImportCvDropzone onUploaded={handleUploaded} label="Importer un PDF" />
              <Link
                href="/creer-un-cv/nouveau"
                className={buttonVariants({ variant: "outline" })}
              >
                <FilePlus2 className="h-4 w-4" aria-hidden /> Créer mon CV
              </Link>
            </div>
          }
        />
      ) : (
        // ------------------------------------------ ÉTAT 2 / 3 : CV actif
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <span
                aria-hidden
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary"
              >
                <FileText className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-semibold text-foreground">
                    {cv.source === "imported" ? cv.fileName ?? "CV.pdf" : cv.title}
                  </p>
                  <Badge variant={cv.source === "imported" ? "primary" : "success"}>
                    {cv.source === "imported" ? "CV importé" : "CV créé avec l'éditeur"}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {cv.source === "imported" && cv.sizeBytes
                    ? `${formatBytes(cv.sizeBytes)} · `
                    : ""}
                  Mis à jour le {formatDate(cv.updatedAt)}
                </p>
              </div>
            </div>

            {/* Actions principales */}
            <div className="mt-5 flex flex-wrap gap-3">
              {cv.source === "imported" ? (
                <a
                  href={cvFileUrl(cv.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: "secondary", size: "sm" })}
                >
                  <Eye className="h-4 w-4" aria-hidden /> Voir
                </a>
              ) : (
                <Link
                  href={`/creer-un-cv/nouveau?cvId=${cv.id}`}
                  className={buttonVariants({ variant: "secondary", size: "sm" })}
                >
                  <FilePen className="h-4 w-4" aria-hidden /> Modifier
                </Link>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setReplacing((v) => !v);
                  setConfirmDelete(false);
                }}
              >
                <RefreshCw className="h-4 w-4" aria-hidden /> Remplacer
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-danger hover:bg-danger-soft"
                onClick={() => {
                  setConfirmDelete((v) => !v);
                  setReplacing(false);
                }}
              >
                <Trash2 className="h-4 w-4" aria-hidden /> Supprimer
              </Button>
            </div>

            {/* Zone de remplacement (import PDF OU créer un nouveau CV) */}
            {replacing ? (
              <div className="mt-5 rounded-md border border-border bg-surface-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">Remplacer votre CV</p>
                  <button
                    type="button"
                    onClick={() => setReplacing(false)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Annuler le remplacement"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Le nouveau CV remplacera l&apos;actuel (un seul CV actif).
                </p>
                <div className="mt-3 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                  <ImportCvDropzone onUploaded={handleUploaded} label="Importer un nouveau PDF" />
                  <Link
                    href="/creer-un-cv/nouveau"
                    className={buttonVariants({ variant: "outline" })}
                  >
                    <FilePlus2 className="h-4 w-4" aria-hidden /> Créer un nouveau CV
                  </Link>
                </div>
              </div>
            ) : null}

            {/* Confirmation de suppression */}
            {confirmDelete ? (
              <div className="mt-5 rounded-md border border-danger-soft bg-danger-soft/40 p-4">
                <p className="text-sm font-medium text-foreground">
                  Supprimer définitivement votre CV ?
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Vous n&apos;aurez plus de CV actif tant que vous n&apos;en ajoutez pas un nouveau.
                </p>
                <div className="mt-3 flex gap-3">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => void handleDelete()}
                    disabled={deleting}
                    aria-busy={deleting}
                  >
                    {deleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                      <Trash2 className="h-4 w-4" aria-hidden />
                    )}
                    {deleting ? "Suppression…" : "Supprimer"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmDelete(false)}
                    disabled={deleting}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            ) : null}

            {error ? (
              <p role="alert" className="mt-4 flex items-center gap-1.5 text-sm text-danger">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden /> {error}
              </p>
            ) : null}
          </CardContent>
        </Card>
      )}
    </section>
  );
}
