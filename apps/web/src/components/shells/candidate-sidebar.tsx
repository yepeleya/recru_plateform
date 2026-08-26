"use client";

import { SidebarNav } from "./sidebar-nav";
import { candidateNavItems } from "./nav-config";

// Sidebar de l'espace candidat (desktop). Le mobile utilise BottomNavMobile
// avec candidateBottomNavItems.
export function CandidateSidebar() {
  return (
    <SidebarNav
      items={candidateNavItems}
      tagline="Espace candidat"
      ariaLabel="Navigation candidat"
    />
  );
}
