import {
  LayoutDashboard,
  Briefcase,
  ClipboardList,
  CircleUser,
  FileText,
  Mail,
  Bell,
  Settings,
  FilePlus,
  UserSearch,
  ShieldCheck,
  FileCheck,
  Users,
  Flag,
  ShieldAlert,
  History,
  LifeBuoy,
  UserCog,
  LineChart,
  Activity,
  Home,
} from "lucide-react";
import type { NavItem } from "./sidebar-nav";

// Configurations de navigation par espace. Les routes suivent
// docs/architecture/05-mapping-stitch.md. Séparé des composants pour rester
// une simple donnée réutilisable (sidebar desktop + bottom nav mobile).

export const candidateNavItems: NavItem[] = [
  { href: "/candidat", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/offres", label: "Trouver un job", icon: Briefcase },
  { href: "/candidat/candidatures", label: "Mes candidatures", icon: ClipboardList },
  { href: "/candidat/profil", label: "Mon profil", icon: CircleUser },
  { href: "/candidat/cv", label: "Mon CV", icon: FileText },
  { href: "/messagerie", label: "Messages", icon: Mail },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/parametres", label: "Paramètres", icon: Settings },
];

export const candidateBottomNavItems: NavItem[] = [
  { href: "/candidat", label: "Tableau", icon: Home, exact: true },
  { href: "/offres", label: "Jobs", icon: Briefcase },
  { href: "/messagerie", label: "Messages", icon: Mail },
  { href: "/candidat/profil", label: "Profil", icon: CircleUser },
];

export const recruiterNavItems: NavItem[] = [
  { href: "/recruteur", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/recruteur/offres", label: "Mes offres", icon: Briefcase },
  { href: "/recruteur/offres/nouvelle", label: "Publier une offre", icon: FilePlus },
  { href: "/candidats", label: "Trouver un candidat", icon: UserSearch },
  { href: "/recruteur/candidatures", label: "Candidatures", icon: ClipboardList },
  { href: "/messagerie", label: "Messages", icon: Mail },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/parametres", label: "Paramètres", icon: Settings },
];

export const recruiterBottomNavItems: NavItem[] = [
  { href: "/recruteur", label: "Tableau", icon: Home, exact: true },
  { href: "/recruteur/offres", label: "Offres", icon: Briefcase },
  { href: "/messagerie", label: "Messages", icon: Mail },
  { href: "/recruteur/candidatures", label: "Candidats", icon: ClipboardList },
];

export const adminNavItems: NavItem[] = [
  { href: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard, exact: true },
  { href: "/admin/validation-comptes", label: "Validation des comptes", icon: ShieldCheck },
  { href: "/admin/identites", label: "Vérifications d'identité", icon: FileCheck },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
  { href: "/admin/offres", label: "Offres", icon: Briefcase },
  { href: "/admin/profils", label: "Profils", icon: CircleUser },
  { href: "/admin/signalements", label: "Signalements", icon: Flag },
  { href: "/admin/sessions", label: "Sessions & sécurité", icon: ShieldAlert },
  { href: "/admin/audit", label: "Journal d'audit", icon: History },
  { href: "/admin/support", label: "Support", icon: LifeBuoy },
  { href: "/admin/administrateurs", label: "Administrateurs", icon: UserCog },
  { href: "/admin/analytics", label: "Analytics", icon: LineChart },
  { href: "/admin/monitoring", label: "Monitoring", icon: Activity },
  { href: "/admin/parametres", label: "Paramètres", icon: Settings },
];
