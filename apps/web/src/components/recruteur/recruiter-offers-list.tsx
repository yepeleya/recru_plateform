"use client";

// Liste des offres du recruteur connecté — DONNÉES RÉELLES uniquement
// (GET /recruiter/job-offers via fetchMyOffers). Le backend filtre déjà sur
// recruiterId dérivé de la session : le frontend ne demande jamais les offres
// d'un autre recruteur et n'en reçoit jamais. Aucun mock, aucun compteur inventé.
//
// L'endpoint n'accepte aucun paramètre de filtrage et renvoie déjà les offres
// triées par createdAt décroissant : le filtrage par statut est donc fait côté
// client sur le tableau chargé (décision P0-5.2), sans toucher au backend.
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  MapPin,
  CalendarDays,
  Loader2,
  AlertCircle,
  RefreshCw,
  FilePlus,
  SearchX,
} from "lucide-react";
import { getMetierBySlug } from "@bara/shared-types";
import { fetchMyOffers, ApiError, type JobOfferApi } from "@/lib/api";
import { Button, buttonVariants } from "@/components/ui";
import {
  DataTable,
  EmptyState,
  FilterBar,
  FilterChip,
  StatusBadge,
  OFFER_STATUS_META,
  type Column,
  type StatusTone,
} from "@/components/patterns";
import { formatBudget, jobTypeLabel } from "@/lib/offer-format";

// Le statut est une chaîne libre côté base (VARCHAR) : on ne suppose jamais
// qu'il fait partie du mapping connu. Repli neutre affichant la valeur brute
// plutôt qu'un crash sur un lookup undefined.
function statusMeta(status: string): { tone: StatusTone; label: string } {
  return OFFER_STATUS_META[status as keyof typeof OFFER_STATUS_META] ?? {
    tone: "neutral",
    label: status,
  };
}

// L'API renvoie null pour les budgets absents, formatBudget (partagé avec le
// parcours public) attend undefined : conversion locale, sans toucher au helper.
function budgetOf(o: JobOfferApi): string {
  return formatBudget({
    budgetLabel: o.budgetLabel ?? undefined,
    budgetMin: o.budgetMin ?? undefined,
    budgetMax: o.budgetMax ?? undefined,
  });
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

// Le parcours recruteur travaille sur l'id interne (GET /recruiter/job-offers/:id
// et les futures actions l'attendent) ; le slug reste réservé au public /offres.
const offerHref = (offer: JobOfferApi) => `/recruteur/offres/${offer.id}`;

const FILTERS = [
  { key: "all", label: "Toutes", match: () => true },
  { key: "published", label: "Publiées", match: (o: JobOfferApi) => o.status === "published" },
  { key: "draft", label: "Brouillons", match: (o: JobOfferApi) => o.status === "draft" },
  { key: "closed", label: "Fermées", match: (o: JobOfferApi) => o.status === "closed" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];
type Status = "loading" | "ready" | "error";

export function RecruiterOffersList() {
  const [offers, setOffers] = useState<JobOfferApi[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      setOffers(await fetchMyOffers());
      setStatus("ready");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de charger vos offres.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Compteurs calculés sur les données réelles chargées, jamais codés en dur.
  const counts = useMemo(
    () =>
      FILTERS.reduce<Record<FilterKey, number>>(
        (acc, f) => {
          acc[f.key] = offers.filter(f.match).length;
          return acc;
        },
        { all: 0, published: 0, draft: 0, closed: 0 },
      ),
    [offers],
  );

  const visible = useMemo(() => {
    const active = FILTERS.find((f) => f.key === filter) ?? FILTERS[0];
    return offers.filter(active.match);
  }, [offers, filter]);

  const columns: Column<JobOfferApi>[] = [
    {
      key: "title",
      header: "Offre",
      cell: (o) => (
        <Link
          href={offerHref(o)}
          className="block min-w-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="line-clamp-1 font-semibold text-foreground hover:text-primary">
            {o.title}
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {getMetierBySlug(o.metierSlug)?.label ?? o.metierSlug}
          </span>
        </Link>
      ),
    },
    {
      key: "city",
      header: "Ville",
      cell: (o) => (
        <span className="whitespace-nowrap">
          {o.city}
          {o.area ? ` · ${o.area}` : ""}
        </span>
      ),
    },
    { key: "type", header: "Type", cell: (o) => jobTypeLabel(o.type) },
    {
      key: "budget",
      header: "Budget",
      cell: (o) => <span className="whitespace-nowrap">{budgetOf(o)}</span>,
    },
    {
      key: "status",
      header: "Statut",
      cell: (o) => {
        const meta = statusMeta(o.status);
        return <StatusBadge tone={meta.tone} label={meta.label} />;
      },
    },
    {
      key: "createdAt",
      header: "Créée le",
      cell: (o) => (
        <span className="whitespace-nowrap text-muted-foreground">{formatDate(o.createdAt)}</span>
      ),
    },
  ];

  // Carte mobile : le titre redevient un vrai titre et toute la carte est
  // cliquable (cible tactile pleine largeur), au lieu des paires libellé/valeur
  // alignées à droite du rendu générique de DataTable.
  const mobileCard = (o: JobOfferApi) => {
    const meta = statusMeta(o.status);
    return (
      <Link
        href={offerHref(o)}
        className="block rounded-lg border border-border bg-surface p-4 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 font-semibold text-foreground">{o.title}</h3>
          <StatusBadge tone={meta.tone} label={meta.label} className="shrink-0" />
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {getMetierBySlug(o.metierSlug)?.label ?? o.metierSlug}
        </p>
        <div className="mt-3 flex flex-col gap-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden />
            {o.city}
            {o.area ? ` · ${o.area}` : ""}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 shrink-0" aria-hidden />
            {jobTypeLabel(o.type)}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
          <span className="font-semibold text-primary">{budgetOf(o)}</span>
          <span className="text-xs text-muted-foreground">Créée le {formatDate(o.createdAt)}</span>
        </div>
      </Link>
    );
  };

  const header = (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 id="offres-title" className="text-2xl font-bold tracking-tight text-foreground">
          Mes offres
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {status === "ready"
            ? `${counts.all} ${counts.all > 1 ? "offres publiées ou en préparation" : "offre publiée ou en préparation"}`
            : "Vos offres, tous statuts confondus."}
        </p>
      </div>
      <Link href="/recruteur/offres/nouvelle" className={buttonVariants()}>
        <FilePlus className="h-4 w-4" aria-hidden /> Publier une offre
      </Link>
    </div>
  );

  if (status === "error") {
    return (
      <section aria-labelledby="offres-title">
        {header}
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

  if (status === "loading") {
    return (
      <section aria-labelledby="offres-title">
        {header}
        <div className="mt-6">
          <DataTable
            columns={columns}
            rows={[]}
            getRowKey={(o) => o.id}
            loading
            renderMobileCard={mobileCard}
          />
          <span className="sr-only" role="status">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Chargement de vos offres…
          </span>
        </div>
      </section>
    );
  }

  // Aucune offre du tout : les filtres n'auraient rien à filtrer.
  if (counts.all === 0) {
    return (
      <section aria-labelledby="offres-title">
        {header}
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
      </section>
    );
  }

  return (
    <section aria-labelledby="offres-title">
      {header}

      <FilterBar label="Statut" className="mt-6">
        {FILTERS.map((f) => (
          <FilterChip key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>
            {f.label} ({counts[f.key]})
          </FilterChip>
        ))}
      </FilterBar>

      <div className="mt-4">
        <DataTable
          columns={columns}
          rows={visible}
          getRowKey={(o) => o.id}
          renderMobileCard={mobileCard}
          empty={
            <EmptyState
              icon={SearchX}
              title="Aucune offre dans ce filtre."
              description="Vos autres offres restent visibles dans « Toutes »."
              action={
                <Button variant="outline" onClick={() => setFilter("all")}>
                  Voir toutes les offres
                </Button>
              }
            />
          }
        />
      </div>
    </section>
  );
}
