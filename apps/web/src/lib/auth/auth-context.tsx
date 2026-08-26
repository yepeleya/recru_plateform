"use client";

// État d'authentification partagé côté client. Interroge GET /users/me au montage
// et expose { me, loading, refresh } via useAuth. `me` vaut null si l'utilisateur
// n'est pas connecté (aucune session). `refresh()` permet de re-synchroniser après
// login / logout / création de compte.
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Me } from "@/lib/api";
import { getMe } from "@/lib/api";

interface AuthState {
  me: Me | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setMe(await getMe());
    } catch {
      // Erreur réseau/serveur : on considère l'utilisateur comme non connecté
      // côté UI ; les actions protégées échoueront explicitement à l'appel.
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return <AuthContext.Provider value={{ me, loading, refresh }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth doit être utilisé à l'intérieur de <AuthProvider>.");
  }
  return ctx;
}
