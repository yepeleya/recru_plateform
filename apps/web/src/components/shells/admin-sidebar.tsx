"use client";

import { SidebarNav } from "./sidebar-nav";
import { adminNavItems } from "./nav-config";

// Sidebar du back-office admin (desktop). L'affichage réel des entrées reste
// soumis au RBAC côté API (AccountStatus ACTIVE → AdminRole → permission) ;
// masquer un lien ici est purement UX, jamais une garantie de sécurité.
export function AdminSidebar() {
  return (
    <SidebarNav
      items={adminNavItems}
      tagline="Administration"
      ariaLabel="Navigation administration"
    />
  );
}
