// Fusion minimale de classes conditionnelles — sans dépendance externe
// (frugalité, CLAUDE.md Partie 2 §8). On contrôle nous-mêmes l'ordre des
// classes dans les composants, donc pas besoin de tailwind-merge ici.
export type ClassValue = string | false | null | undefined;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
