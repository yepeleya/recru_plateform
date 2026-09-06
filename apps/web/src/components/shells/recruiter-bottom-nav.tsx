"use client";

import { BottomNavMobile } from "./bottom-nav";
import { recruiterBottomNavItems } from "./nav-config";

// Barre de navigation basse de l'espace recruteur (mobile). Composant client qui
// importe lui-même ses items : les icônes sont des composants React et ne peuvent
// pas être passées en props depuis un Server Component (même pattern que
// RecruiterSidebar). Permet au layout /recruteur de rester un Server Component.
export function RecruiterBottomNav() {
  return <BottomNavMobile items={recruiterBottomNavItems} ariaLabel="Navigation recruteur" />;
}
