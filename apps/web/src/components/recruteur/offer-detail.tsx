"use client";

// Détail d'une offre appartenant au recruteur connecté — LECTURE SEULE (P0-5.3).
// Publier / Fermer / Supprimer sont volontairement absents : ces actions
// appartiennent à P0-5.4. Données réelles via GET /recruiter/job-offers/:id, qui
// renvoie 403 si l'offre appartient à un autre recruteur et 404 si elle n'existe
// pas — le backend reste la seule autorité, le garde de route n'est qu'une
// couche de confort.
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  MapPin,
  CalendarDays,
  Banknote,
  Briefcase,
  Loader2,
  AlertCircle,
  RefreshCw,
  Lock,
  SearchX,
  Info,
  Check,
} from "lucide-react";
import { getMetierBySlug } from "@bara/shared-types";
import { fetchMyOffer, ApiError, type JobOfferApi } from "@/lib/api";
import { formatBudget, jobTypeLabel } from "@/lib/offer-format";
import { Button, buttonVariants } from "@/components/ui";
import { EmptyState, StatusBadge, OFFER_STATUS_META, type StatusTone } from "@/components/patterns";

/**
 * Traduit une erreur d'API en message français sûr, à partir du CODE HTTP —
 * jamais du texte renvoyé par le backend. Sans cela l'utilisateur lirait
 * « Forbidden », « Unauthorized » ou « title must be longer than or equal to 3
 * characters » dans une interface française (défauts backend connus, non
 * corrigeables dans cette phase).
 */
export function offerErrorMessage(err: unknown): string {
  if (!(err instanceof ApiError)) return "Une erreur est survenue. Réessayez dans un instant.";
  switch (err.status) {
    case 0:
      return "Impossible de joindre le serveur Bara. Veuillez réessayer.";
    case 400:
    case 422:
      return "Certaines informations du formulaire sont invalides. Vérifiez les champs indiqués.";
    case 401:
      return "Votre session a expiré. Reconnectez-vous pour continuer.";
    case 403:
      return "Cette offre ne vous appartient pas.";
    case 404:
      return "Cette offre n'existe pas ou a été supprimée.";
    default:
      return err.status >= 500
        ? "Le serveur Bara a rencontré une erreur. Réessayez dans un instant."
        : "Une erreur est survenue. Réessayez dans un instant.";
  }
}

export function statusMeta(status: string): { tone: StatusTone; label: string } {
  return OFFER_STATUS_META[status as keyof typeof OFFER_STATUS_META] ?? {
    tone: "neutral",
    label: status,
  };
}

export function formatDateLong(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

type Phase = "loading" | "ready" | "forbidden" | "notFound" | "error";

function BackLink() {
  return (
    <Link
      href="/recruteur/offres"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden /> Retour à mes offres
    </Link>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      <div className="min-w-0">
        <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </dt>
        <dd className="text-sm text-foreground">{value}</dd>
      </div>
    </div>
  );
}

export function OfferDetail({ offerId }: { offerId: string }) {
  const [offer, setOffer] = useState<JobOfferApi | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [error, setError] = useState<string | null>(null);
  const [justCreated, setJustCreated] = useState(false);

  // Confirmation après création. Lu depuis window plutôt qu'avec useSearchParams
  // pour ne pas imposer de frontière <Suspense> à la page.
  useEffect(() => {
    setJustCreated(new URLSearchParams(window.location.search).get("cree") === "1");
  }, []);

  const load = useCallback(async () => {
    setPhase("loading");
    setError(null);
    try {
      setOffer(await fetchMyOffer(offerId));
      setPhase("ready");
    } catch (err) {
      const status = err instanceof ApiError ? err.status : -1;
      if (status === 403) setPhase("forbidden");
      else if (status === 404) setPhase("notFound");
      else {
        setError(offerErrorMessage(err));
        setPhase("error");
      }
    }
  }, [offerId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (phase === "loading") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
        <span className="sr-only">Chargement de l&apos;offre…</span>
      </div>
    );
  }

  if (phase === "forbidden" || phase === "notFound") {
    const denied = phase === "forbidden";
    return (
      <section>
        <BackLink />
        <EmptyState
          icon={denied ? Lock : SearchX}
          title={denied ? "Cette offre ne vous appartient pas." : "Cette offre n'existe pas ou a été supprimée."}
          description={
            denied
              ? "Vous ne pouvez consulter que les offres que vous avez publiées."
              : "Vérifiez le lien utilisé, ou revenez à la liste de vos offres."
          }
          className="mt-6"
          action={
            <Link href="/recruteur/offres" className={buttonVariants({ variant: "outline" })}>
              Voir mes offres
            </Link>
          }
        />
      </section>
    );
  }

  if (phase === "error") {
    return (
      <section>
        <BackLink />
        <div className="mt-6 flex flex-col items-center gap-3 rounded-lg border border-border bg-surface p-8 text-center">
          <AlertCircle className="h-8 w-8 text-danger" aria-hidden />
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={() => void load()}>
            <RefreshCw className="h-4 w-4" aria-hidden /> Réessayer
          </Button>
        </div>
      </section>
    );
  }

  const o = offer!;
  const meta = statusMeta(o.status);
  const metier = getMetierBySlug(o.metierSlug)?.label ?? o.metierSlug;

  return (
    <section aria-labelledby="offre-title">
      <BackLink />

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 id="offre-title" className="text-2xl font-bold tracking-tight text-foreground">
              {o.title}
            </h1>
            <StatusBadge tone={meta.tone} label={meta.label} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{metier}</p>
        </div>
        <Link href={`/recruteur/offres/${o.id}/modifier`} className={buttonVariants()}>
          <Pencil className="h-4 w-4" aria-hidden /> Modifier
        </Link>
      </div>

      {justCreated ? (
        <p
          role="status"
          className="mt-4 flex items-start gap-2 rounded-md border border-success/40 bg-success-soft p-3 text-sm text-success"
        >
          <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          Offre enregistrée en brouillon.
        </p>
      ) : null}

      {o.status === "draft" ? (
        <p className="mt-4 flex items-start gap-2 rounded-md border border-border bg-surface-2 p-3 text-sm text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          Cette offre est un brouillon : elle n&apos;est pas encore visible par les candidats.
        </p>
      ) : null}

      <dl className="mt-6 grid grid-cols-1 gap-5 rounded-lg border border-border bg-surface p-5 sm:grid-cols-2">
        <InfoRow icon={Briefcase} label="Type de mission" value={jobTypeLabel(o.type)} />
        <InfoRow
          icon={MapPin}
          label="Localisation"
          value={`${o.city}${o.area ? ` · ${o.area}` : ""}`}
        />
        <InfoRow icon={Banknote} label="Budget" value={formatBudget(o)} />
        <InfoRow
          icon={CalendarDays}
          label="Période"
          value={
            o.startDate || o.endDate
              ? `${formatDateLong(o.startDate)} → ${formatDateLong(o.endDate)}`
              : "Non précisée"
          }
        />
      </dl>

      <div className="mt-6 rounded-lg border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Description
        </h2>
        {/* whitespace-pre-line : conserve les retours à la ligne saisis par le
            recruteur sans jamais interpréter de HTML. */}
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground">
          {o.description}
        </p>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Créée le {formatDateLong(o.createdAt)} · dernière modification le{" "}
        {formatDateLong(o.updatedAt)}
      </p>
    </section>
  );
}
