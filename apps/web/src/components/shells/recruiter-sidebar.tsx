"use client";

import Link from "next/link";
import { FilePlus } from "lucide-react";
import { SidebarNav } from "./sidebar-nav";
import { recruiterNavItems } from "./nav-config";

// Sidebar de l'espace recruteur (desktop) + CTA principal « Publier une offre ».
export function RecruiterSidebar() {
  return (
    <SidebarNav
      items={recruiterNavItems}
      tagline="Espace recruteur"
      ariaLabel="Navigation recruteur"
      footer={
        <Link
          href="/recruteur/offres/nouvelle"
          className="flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <FilePlus className="h-4 w-4" aria-hidden />
          Publier une offre
        </Link>
      }
    />
  );
}
