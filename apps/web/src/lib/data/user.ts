// Façade « utilisateur courant ». FRONT-2 : appelle GET /users/me via lib/api.
// Renvoie null si aucune session (401). Le type est `Me` (plat, aligné sur la
// réponse API) — plus l'ancien mock UserAccount.
//
// NOTE : getMe s'exécute côté client (cookie de session HttpOnly envoyé
// automatiquement). Pour l'état d'auth partagé dans l'UI, préférer le hook
// useAuth (AuthProvider) plutôt que d'appeler cette fonction directement.
import type { Me } from "@/lib/api";
import { getMe } from "@/lib/api";

export async function getCurrentUser(): Promise<Me | null> {
  return getMe();
}
