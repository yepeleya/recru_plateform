"use client";

// Tableau de bord recruteur — compteurs calculés à partir des DONNÉES RÉELLES de
// l'API (GET /recruiter/job-offers + GET /recruiter/applications). Aucun mock,
// aucune valeur inventée : un compteur à 0 s'affiche comme 0.
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  CheckCircle2,
  FileEdit,
  Archive,
  ClipboardList,
  Loader2,
  AlertCircle,
  RefreshCw,
  FilePlus,
} from "lucide-react";
import { fetchMyOffers, fetchRecruiterApplications, ApiError } from "@/lib/api";
import { Button, buttonVariants } from "@/components/ui";
import { EmptyState, StatTile } from "@/components/patterns";

interface Counters {
  total: number;
  published: number;
  draft: number;
  closed: number;
  applications: number;
}

type Status = "loading" | "ready" | "error";

export function RecruiterDashboard() {
  const [counters, setCounters] = useState<Counters | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const [offers, applications] = await Promise.all([
        fetchMyOffers(),
        fetchRecruiterApplications(),
      ]);
      setCounters({
        total: offers.length,
        published: offers.filter((o) => o.status === "published").length,
        draft: offers.filter((o) => o.status === "draft").length,
        closed: offers.filter((o) => o.status === "closed").length,
        applications: applications.length,
      });
      setStatus("ready");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Impossible de charger votre tableau de bord.",
      );
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
        <span className="sr-only">Chargement du tableau de bord…</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-surface p-8 text-center">
        <AlertCircle className="h-8 w-8 text-danger" aria-hidden />
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" onClick={() => void load()}>
          <RefreshCw className="h-4 w-4" aria-hidden /> Réessayer
        </Button>
      </div>
    );
  }

  const c = counters!;

  return (
    <section aria-labelledby="recruteur-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 id="recruteur-title" className="text-2xl font-bold tracking-tight text-foreground">
            Tableau de bord
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Vue d&apos;ensemble de vos offres et des candidatures reçues.
          </p>
        </div>
        <Link href="/recruteur/offres/nouvelle" className={buttonVariants()}>
          <FilePlus className="h-4 w-4" aria-hidden /> Publier une offre
        </Link>
      </div>

      {c.total === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="Vous n'avez pas encore d'offre."
          description="Publiez votre première offre pour commencer à recevoir des candidatures."
          className="mt-6"
          action={
            <Link href="/recruteur/offres/nouvelle" className={buttonVariants()}>
              <FilePlus className="h-4 w-4" aria-hidden /> Publier une offre
            </Link>
          }
        />
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatTile label="Offres au total" value={c.total} icon={Briefcase} tone="neutral" />
          <StatTile label="Publiées" value={c.published} icon={CheckCircle2} tone="success" />
          <StatTile label="Brouillons" value={c.draft} icon={FileEdit} tone="warning" />
          <StatTile label="Fermées" value={c.closed} icon={Archive} tone="neutral" />
          <StatTile
            label="Candidatures reçues"
            value={c.applications}
            icon={ClipboardList}
            tone="primary"
            hint="toutes offres confondues"
          />
        </div>
      )}
    </section>
  );
}
