// État de données optionnel pour les pages/hooks côté client qui veulent gérer
// explicitement loading/success/empty/error/forbidden. Volontairement minimal
// (pas de state management). Les Server Components peuvent l'ignorer et gérer
// loading/error via les conventions Next (loading.tsx / error.tsx).

export type DataState<T> =
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "empty" }
  | { status: "error"; message: string }
  | { status: "forbidden"; reason?: string };
