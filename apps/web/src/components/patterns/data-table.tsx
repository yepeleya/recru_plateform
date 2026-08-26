import type { ReactNode } from "react";
import { cn } from "@/components/ui";

// DataTable<T> — table générique pour les listes d'administration. Table sur
// desktop, cartes empilées sur mobile (contrat 05 : « tables → cartes en
// mobile »). Gère les états loading (skeleton) et empty. Aucune donnée métier
// codée en dur : colonnes et lignes sont fournies par l'appelant.

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  loading?: boolean;
  empty?: ReactNode;
  className?: string;
}

function TableSkeleton({ columns, rows = 5 }: { columns: number; rows?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border" aria-hidden>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 border-b border-border p-4 last:border-b-0">
          {Array.from({ length: columns }).map((__, c) => (
            <div key={c} className="h-4 flex-1 animate-pulse rounded bg-muted" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  loading = false,
  empty,
  className,
}: DataTableProps<T>) {
  if (loading) {
    return <TableSkeleton columns={columns.length} />;
  }

  if (rows.length === 0) {
    return (
      <div className={className}>
        {empty ?? (
          <p className="rounded-lg border border-dashed border-border bg-surface-2 p-8 text-center text-sm text-muted-foreground">
            Aucune donnée à afficher.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Desktop : vraie table */}
      <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface-2 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              {columns.map((col) => (
                <th key={col.key} scope="col" className={cn("px-4 py-3 font-semibold", col.headerClassName)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={getRowKey(row)} className="bg-surface transition-colors hover:bg-surface-2">
                {columns.map((col) => (
                  <td key={col.key} className={cn("px-4 py-3 align-middle text-foreground", col.className)}>
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile : cartes empilées */}
      <div className="flex flex-col gap-3 md:hidden">
        {rows.map((row) => (
          <div key={getRowKey(row)} className="rounded-lg border border-border bg-surface p-4">
            <dl className="flex flex-col gap-2">
              {columns.map((col) => (
                <div key={col.key} className="flex items-start justify-between gap-3">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {col.header}
                  </dt>
                  <dd className="min-w-0 text-right text-sm text-foreground">{col.cell(row)}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
