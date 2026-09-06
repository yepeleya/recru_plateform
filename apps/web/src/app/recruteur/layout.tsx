import type { Metadata } from "next";
import { RecruiterSidebar, RecruiterBottomNav } from "@/components/shells";
import { RecruiterGuard } from "@/components/recruteur/recruiter-guard";

export const metadata: Metadata = {
  title: { default: "Espace recruteur", template: "%s | Espace recruteur" },
  // Espace privé : jamais indexé.
  robots: { index: false, follow: false },
};

export default function RecruteurLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-7xl">
      {/* Sidebar desktop (lg+) — réutilise le shell existant */}
      <RecruiterSidebar />

      {/* pb-24 en mobile pour ne pas passer sous la barre de navigation basse */}
      <div className="min-w-0 flex-1 px-4 py-8 pb-24 md:px-6 lg:pb-8">
        <RecruiterGuard>{children}</RecruiterGuard>
      </div>

      {/* Navigation basse mobile (lg:hidden) — réutilise le shell existant */}
      <RecruiterBottomNav />
    </div>
  );
}
