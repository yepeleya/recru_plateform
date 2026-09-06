"use client";

// Garde d'accès de l'espace recruteur.
//  - session absente        → redirection /connexion?next=<chemin courant>
//  - compte candidat        → refus explicite (l'espace ne le concerne pas)
//  - compte recruteur/admin → accès
// Le backend reste la source de vérité (403 à la création d'offre, ownership sur
// chaque route) : cette garde est une couche UX, pas une protection.
import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { buttonVariants } from "@/components/ui";
import { EmptyState } from "@/components/patterns";

export function RecruiterGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { me, loading } = useAuth();

  const isCandidate = me?.accountType === "candidat";

  useEffect(() => {
    if (!loading && !me) {
      router.replace(`/connexion?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, me, pathname, router]);

  // Évite tout flash : on n'affiche rien de définitif tant que l'auth n'a pas répondu.
  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
        <span className="sr-only">Chargement…</span>
      </div>
    );
  }

  if (!me) return null; // redirection en cours

  if (isCandidate) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Espace réservé aux recruteurs"
        description="Votre compte est un compte candidat. Retrouvez les offres et vos candidatures depuis votre espace."
        action={
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <Link href="/offres" className={buttonVariants()}>
              Voir les offres
            </Link>
            <Link href="/candidat/cv" className={buttonVariants({ variant: "outline" })}>
              Mon CV
            </Link>
          </div>
        }
      />
    );
  }

  return <>{children}</>;
}
