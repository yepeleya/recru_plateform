"use client";

// Import d'un CV PDF. Règle stricte : un fichier n'est « importé » qu'après la
// réponse API réussie (jamais côté client seulement). La validation faisant foi
// (type MIME + magic-byte %PDF- + taille) reste au backend ; on fait ici une
// pré-validation d'UX pour éviter un aller-retour inutile.
import { useRef, useState } from "react";
import { Upload, Loader2, AlertCircle } from "lucide-react";
import type { Cv } from "@bara/shared-types";
import { Button } from "@/components/ui";
import { importCv, ApiError } from "@/lib/api";

// Aligné sur le backend (apps/api cv-storage.ts : MAX_CV_FILE_SIZE = 5 Mo).
const MAX_SIZE = 5 * 1024 * 1024;

interface ImportCvDropzoneProps {
  onUploaded: (cv: Cv) => void;
  label?: string;
}

export function ImportCvDropzone({ onUploaded, label = "Importer un PDF" }: ImportCvDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    setError(null);
    if (!file) return;
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setError("Le fichier doit être un PDF.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("Le PDF ne doit pas dépasser 5 Mo.");
      return;
    }
    setUploading(true);
    try {
      // Succès UNIQUEMENT après la réponse API (201). Le parent refait ensuite
      // GET /cvs/me pour afficher le CV réellement enregistré.
      const cv = await importCv(file);
      onUploaded(cv);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "L'import a échoué. Réessaie.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        onChange={(e) => void handleFile(e.target.files?.[0])}
        disabled={uploading}
      />
      <Button
        type="button"
        variant="primary"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-busy={uploading}
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Upload className="h-4 w-4" aria-hidden />
        )}
        {uploading ? "Import en cours…" : label}
      </Button>
      <p className="mt-2 text-xs text-muted-foreground">PDF uniquement, 5 Mo maximum.</p>
      {error ? (
        <p role="alert" className="mt-2 flex items-center justify-center gap-1.5 text-sm text-danger sm:justify-start">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden /> {error}
        </p>
      ) : null}
    </div>
  );
}
