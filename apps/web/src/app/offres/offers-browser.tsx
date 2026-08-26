"use client";

import { useEffect, useMemo, useState, type ReactNode, type ButtonHTMLAttributes } from "react";
import Link from "next/link";
import {
  Search,
  Briefcase,
  MapPin,
  ChevronLeft,
  ChevronRight,
  SearchX,
} from "lucide-react";
import { getMetierBySlug, type JobOffer } from "@bara/shared-types";
import { cn } from "@/components/ui";
import { JobCard, EmptyState } from "@/components/patterns";

// Expérience de navigation des offres (page /offres) — reconstruction de la
// maquette Stitch bara_offres_d_emploi. Client component : la recherche, les
// filtres (localisation, métier, rémunération), le tri et la pagination sont
// interactifs et partagent le même état. Les données viennent de lib/data (via
// la page serveur) — aucune donnée inventée.

const PAGE_SIZE = 4;
const BUDGET_MIN = 5000;
const BUDGET_MAX = 250000;

type SortKey = "pertinence" | "recent" | "remuneration";

export function OffersBrowser({ offers }: { offers: JobOffer[] }) {
  const [q, setQ] = useState("");
  const [ville, setVille] = useState("");
  const [cities, setCities] = useState<Set<string>>(new Set());
  const [metiers, setMetiers] = useState<Set<string>>(new Set());
  const [maxBudget, setMaxBudget] = useState(BUDGET_MAX);
  const [verifiedOnly, setVerifiedOnly] = useState(false); // ⚠️ pas de champ dans JobOffer → non appliqué (voir rapport)
  const [sort, setSort] = useState<SortKey>("pertinence");
  const [page, setPage] = useState(1);

  const cityOptions = useMemo(
    () => [...new Set(offers.map((o) => o.city))].sort(),
    [offers],
  );
  const metierOptions = useMemo(
    () =>
      [...new Set(offers.map((o) => o.metierSlug))].map((slug) => ({
        slug,
        label: getMetierBySlug(slug)?.label ?? slug,
      })),
    [offers],
  );

  const filtered = useMemo(() => {
    let list = offers;
    const s = q.trim().toLowerCase();
    if (s) {
      list = list.filter(
        (o) =>
          o.title.toLowerCase().includes(s) ||
          (getMetierBySlug(o.metierSlug)?.label ?? "").toLowerCase().includes(s),
      );
    }
    const v = ville.trim().toLowerCase();
    if (v) {
      list = list.filter(
        (o) =>
          o.city.toLowerCase().includes(v) ||
          (o.area ?? "").toLowerCase().includes(v),
      );
    }
    if (cities.size) list = list.filter((o) => cities.has(o.city));
    if (metiers.size) list = list.filter((o) => metiers.has(o.metierSlug));
    list = list.filter((o) => o.budgetMin == null || o.budgetMin <= maxBudget);

    const arr = [...list];
    if (sort === "recent") arr.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    else if (sort === "remuneration") arr.sort((a, b) => (b.budgetMin ?? 0) - (a.budgetMin ?? 0));
    return arr;
  }, [offers, q, ville, cities, metiers, maxBudget, sort]);

  useEffect(() => {
    setPage(1);
  }, [q, ville, cities, metiers, maxBudget, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageItems = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const toggleFrom = (set: Set<string>, key: string) => {
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    return next;
  };

  const reset = () => {
    setQ("");
    setVille("");
    setCities(new Set());
    setMetiers(new Set());
    setMaxBudget(BUDGET_MAX);
    setVerifiedOnly(false);
    setSort("pertinence");
  };

  return (
    <main className="flex-grow">
      {/* Hero + recherche */}
      <section className="bg-surface-2 px-4 pb-8 pt-12 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
              Trouvez votre prochain job
            </h1>
            <p className="mt-1 text-lg text-muted-foreground">
              Des missions ponctuelles et emplois saisonniers près de chez vous.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm md:flex-row">
            <div className="flex w-full flex-1 items-center gap-2 rounded-md border border-transparent bg-surface-2 px-4 py-2.5 focus-within:border-primary">
              <Briefcase aria-hidden className="h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Métier ou mot-clé"
                aria-label="Métier ou mot-clé"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex w-full flex-1 items-center gap-2 rounded-md border border-transparent bg-surface-2 px-4 py-2.5 focus-within:border-primary">
              <MapPin aria-hidden className="h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                type="text"
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                placeholder="Ville"
                aria-label="Ville"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <button
              type="button"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:w-auto"
            >
              <Search aria-hidden className="h-4 w-4" />
              Rechercher
            </button>
          </div>
        </div>
      </section>

      {/* Grille : filtres + résultats */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-12 md:px-6">
        {/* Sidebar filtres */}
        <aside className="space-y-6 md:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-foreground">Filtres</h2>
            <button
              type="button"
              onClick={reset}
              className="text-xs font-bold text-primary hover:underline"
            >
              Réinitialiser
            </button>
          </div>

          <FilterGroup title="Localisation">
            {cityOptions.map((city) => (
              <CheckRow
                key={city}
                label={city}
                checked={cities.has(city)}
                onChange={() => setCities((s) => toggleFrom(s, city))}
              />
            ))}
          </FilterGroup>

          <hr className="border-border" />

          <FilterGroup title="Métier">
            {metierOptions.map((m) => (
              <CheckRow
                key={m.slug}
                label={m.label}
                checked={metiers.has(m.slug)}
                onChange={() => setMetiers((s) => toggleFrom(s, m.slug))}
              />
            ))}
          </FilterGroup>

          <hr className="border-border" />

          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Rémunération (FCFA)
            </h3>
            <input
              type="range"
              min={BUDGET_MIN}
              max={BUDGET_MAX}
              step={5000}
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
              aria-label="Rémunération maximale"
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
            />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>{BUDGET_MIN.toLocaleString("fr-FR")}</span>
              <span>{maxBudget >= BUDGET_MAX ? "250 000+" : maxBudget.toLocaleString("fr-FR")}</span>
            </div>
          </div>

          <hr className="border-border" />

          {/* ⚠️ Recruteur vérifié : présent dans la maquette mais absent de JobOffer
              (pré-v3) → l'interrupteur est rendu pour la fidélité mais NE filtre pas. */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Recruteur vérifié</span>
            <button
              type="button"
              role="switch"
              aria-checked={verifiedOnly}
              onClick={() => setVerifiedOnly((v) => !v)}
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                verifiedOnly ? "bg-primary" : "bg-muted",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                  verifiedOnly ? "translate-x-[22px]" : "translate-x-0.5",
                )}
              />
            </button>
          </div>
        </aside>

        {/* Résultats */}
        <div className="md:col-span-9">
          <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-sm text-muted-foreground">
              <span className="font-bold text-foreground">{filtered.length}</span>{" "}
              {filtered.length > 1 ? "offres disponibles" : "offre disponible"}
            </p>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Trier par :</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="cursor-pointer rounded-md border border-input bg-surface px-2 py-1 text-sm font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="pertinence">Pertinence</option>
                <option value="recent">Plus récentes</option>
                <option value="remuneration">Rémunération</option>
              </select>
            </label>
          </div>

          {pageItems.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="Aucun job ne correspond à votre recherche"
              description="Essayez de modifier vos filtres ou vos mots-clés pour voir plus de résultats."
              action={
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Modifier les filtres
                </button>
              }
            />
          ) : (
            <>
              <ul className="space-y-4">
                {pageItems.map((offer) => (
                  <li key={offer.id}>
                    <JobCard offer={offer} variant="list" />
                  </li>
                ))}
              </ul>

              {totalPages > 1 ? (
                <nav
                  aria-label="Pagination"
                  className="mt-10 flex items-center justify-center gap-2 py-4"
                >
                  <PageBtn
                    disabled={current === 1}
                    onClick={() => setPage(current - 1)}
                    aria-label="Page précédente"
                  >
                    <ChevronLeft className="h-5 w-5" aria-hidden />
                  </PageBtn>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PageBtn key={i} active={current === i + 1} onClick={() => setPage(i + 1)}>
                      {i + 1}
                    </PageBtn>
                  ))}
                  <PageBtn
                    disabled={current === totalPages}
                    onClick={() => setPage(current + 1)}
                    aria-label="Page suivante"
                  >
                    <ChevronRight className="h-5 w-5" aria-hidden />
                  </PageBtn>
                </nav>
              ) : null}
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="group flex cursor-pointer items-center gap-2.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-input accent-primary"
      />
      <span className="text-sm text-foreground group-hover:text-primary">{label}</span>
    </label>
  );
}

function PageBtn({
  active,
  className,
  children,
  ...rest
}: { active?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40",
        active
          ? "bg-primary text-primary-foreground"
          : "border border-border text-foreground hover:border-primary hover:text-primary",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
