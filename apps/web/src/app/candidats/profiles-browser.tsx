"use client";

import { useEffect, useMemo, useState, type ReactNode, type ButtonHTMLAttributes } from "react";
import {
  Search,
  Briefcase,
  Brain,
  MapPin,
  ChevronLeft,
  ChevronRight,
  UserSearch,
} from "lucide-react";
import { getMetierBySlug, type WorkerProfile, type JobType } from "@bara/shared-types";
import { cn } from "@/components/ui";
import { CandidateCard, EmptyState } from "@/components/patterns";
import { jobTypeLabel } from "@/lib/offer-format";

// Navigation des profils candidats (page /candidats) — reconstruction de la
// maquette Stitch bara_profils_des_candidats. Client component : recherche,
// filtres, tri et pagination interactifs, partageant le même état. Données via
// lib/data (page serveur). Aucune donnée inventée.
//
// ⚠️ Filtres « Expérience » et « Profils vérifiés » de la maquette OMIS :
// WorkerProfile (pré-v3) ne porte ni années d'expérience ni statut vérifié.

const PAGE_SIZE = 4;

type SortKey = "pertinence" | "disponibilite" | "recents";

const metierLabelOf = (slug: string) => getMetierBySlug(slug)?.label ?? slug;

export function ProfilesBrowser({ profiles }: { profiles: WorkerProfile[] }) {
  const [qMetier, setQMetier] = useState("");
  const [qComp, setQComp] = useState("");
  const [qVille, setQVille] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [metiers, setMetiers] = useState<Set<string>>(new Set());
  const [types, setTypes] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<SortKey>("pertinence");
  const [page, setPage] = useState(1);

  const metierOptions = useMemo(
    () =>
      [...new Set(profiles.map((p) => p.metierSlug))].map((slug) => ({
        slug,
        label: metierLabelOf(slug),
      })),
    [profiles],
  );
  const typeOptions = useMemo(
    () => [...new Set(profiles.flatMap((p) => p.jobTypes))] as JobType[],
    [profiles],
  );

  const filtered = useMemo(() => {
    let list = profiles;
    const m = qMetier.trim().toLowerCase();
    if (m) list = list.filter((p) => metierLabelOf(p.metierSlug).toLowerCase().includes(m));
    const c = qComp.trim().toLowerCase();
    if (c) list = list.filter((p) => `${p.headline} ${p.bio ?? ""}`.toLowerCase().includes(c));
    const v = qVille.trim().toLowerCase();
    if (v) list = list.filter((p) => p.city.toLowerCase().includes(v));
    if (availableOnly) list = list.filter((p) => p.isAvailableNow);
    if (metiers.size) list = list.filter((p) => metiers.has(p.metierSlug));
    if (types.size) list = list.filter((p) => p.jobTypes.some((t) => types.has(t)));

    const arr = [...list];
    if (sort === "disponibilite") {
      arr.sort((a, b) => Number(b.isAvailableNow) - Number(a.isAvailableNow));
    } else if (sort === "recents") {
      arr.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return arr;
  }, [profiles, qMetier, qComp, qVille, availableOnly, metiers, types, sort]);

  useEffect(() => {
    setPage(1);
  }, [qMetier, qComp, qVille, availableOnly, metiers, types, sort]);

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
    setQMetier("");
    setQComp("");
    setQVille("");
    setAvailableOnly(false);
    setMetiers(new Set());
    setTypes(new Set());
    setSort("pertinence");
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 pb-16 md:px-6">
      <header className="mb-8 text-center md:text-left">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Trouvez la bonne personne
        </h1>
        <p className="mt-1 text-lg text-muted-foreground">
          Recherchez des profils disponibles près de chez vous.
        </p>
      </header>

      {/* Barre de recherche */}
      <div className="mb-8 rounded-xl border border-border bg-surface p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:items-end">
          <SearchField label="Métier" icon={Briefcase} value={qMetier} onChange={setQMetier} placeholder="ex: Menuisier, Chef…" />
          <SearchField label="Compétence" icon={Brain} value={qComp} onChange={setQComp} placeholder="ex: Soudure, PHP…" />
          <SearchField label="Ville" icon={MapPin} value={qVille} onChange={setQVille} placeholder="Abidjan, Yamoussoukro…" />
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Search aria-hidden className="h-4 w-4" />
            Trouver
          </button>
        </div>
      </div>

      {/* Filtres + résultats */}
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Sidebar */}
        <aside className="w-full shrink-0 md:w-72">
          <div className="space-y-6 rounded-lg border border-border bg-surface p-5 md:sticky md:top-24">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">Filtres</h2>
              <button type="button" onClick={reset} className="text-xs font-bold text-primary hover:underline">
                Réinitialiser
              </button>
            </div>

            {/* Toggle mis en avant : Disponible maintenant */}
            <div className="rounded-lg border border-accent-soft bg-accent-soft/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-accent">Disponible maintenant</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={availableOnly}
                  onClick={() => setAvailableOnly((v) => !v)}
                  className={cn(
                    "relative h-6 w-11 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    availableOnly ? "bg-success" : "bg-muted",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                      availableOnly ? "translate-x-[22px]" : "translate-x-0.5",
                    )}
                  />
                </button>
              </div>
            </div>

            <FilterGroup title="Métier">
              {metierOptions.map((m) => (
                <CheckRow key={m.slug} label={m.label} checked={metiers.has(m.slug)} onChange={() => setMetiers((s) => toggleFrom(s, m.slug))} />
              ))}
            </FilterGroup>

            <hr className="border-border" />

            <FilterGroup title="Type de mission">
              {typeOptions.map((t) => (
                <CheckRow key={t} label={jobTypeLabel(t)} checked={types.has(t)} onChange={() => setTypes((s) => toggleFrom(s, t))} />
              ))}
            </FilterGroup>
          </div>
        </aside>

        {/* Résultats */}
        <div className="flex-1">
          <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="font-display text-lg font-semibold text-foreground">
                {filtered.length} {filtered.length > 1 ? "profils disponibles" : "profil disponible"}
              </p>
              <p className="text-xs text-muted-foreground">Basé sur vos critères de recherche</p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Trier par :</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="cursor-pointer rounded-md border border-input bg-surface px-2 py-1 text-sm font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="pertinence">Pertinence</option>
                <option value="disponibilite">Disponibilité</option>
                <option value="recents">Récents</option>
              </select>
            </label>
          </div>

          {pageItems.length === 0 ? (
            <EmptyState
              icon={UserSearch}
              title="Aucun profil ne correspond"
              description="Essayez de modifier vos filtres ou élargissez votre zone de recherche pour voir plus de candidats."
              action={
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Effacer les filtres
                </button>
              }
            />
          ) : (
            <>
              <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {pageItems.map((profile) => (
                  <li key={profile.id}>
                    <CandidateCard profile={profile} variant="list" />
                  </li>
                ))}
              </ul>

              {totalPages > 1 ? (
                <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
                  <PageBtn disabled={current === 1} onClick={() => setPage(current - 1)} aria-label="Page précédente">
                    <ChevronLeft className="h-5 w-5" aria-hidden />
                  </PageBtn>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PageBtn key={i} active={current === i + 1} onClick={() => setPage(i + 1)}>
                      {i + 1}
                    </PageBtn>
                  ))}
                  <PageBtn disabled={current === totalPages} onClick={() => setPage(current + 1)} aria-label="Page suivante">
                    <ChevronRight className="h-5 w-5" aria-hidden />
                  </PageBtn>
                </nav>
              ) : null}
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function SearchField({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  icon: typeof MapPin;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-1">
      <label className="px-1 text-xs font-bold text-muted-foreground">{label}</label>
      <div className="flex items-center gap-2 rounded-md border border-input bg-surface px-3 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-ring">
        <Icon aria-hidden className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={label}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="group flex cursor-pointer items-center gap-2.5">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 rounded border-input accent-primary" />
      <span className="text-sm text-foreground group-hover:text-primary">{label}</span>
    </label>
  );
}

function PageBtn({ active, className, children, ...rest }: { active?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40",
        active ? "bg-primary text-primary-foreground" : "border border-border text-foreground hover:border-primary hover:text-primary",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
