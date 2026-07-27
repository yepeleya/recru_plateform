// Mapping métier/catégorie → icône Lucide (SVG cohérent multi-OS).
// Règle produit : aucun emoji comme icône (CLAUDE.md Partie 3 / brief sprint).
// Les icônes sont une préoccupation de présentation → elles vivent côté web,
// pas dans @bara/shared-types (qui reste la donnée pure).
import {
  Baby,
  Bike,
  Box,
  CakeSlice,
  Camera,
  Car,
  ChefHat,
  Clapperboard,
  ConciergeBell,
  Dog,
  Droplets,
  GraduationCap,
  Headset,
  Home,
  KeyRound,
  Megaphone,
  Music,
  PackageOpen,
  PaintRoller,
  Palette,
  PenTool,
  Radio,
  Scissors,
  ShoppingBag,
  Smartphone,
  Soup,
  Sparkles,
  SprayCan,
  Trees,
  Truck,
  Utensils,
  UtensilsCrossed,
  WashingMachine,
  Wine,
  Wrench,
  Zap,
  Briefcase,
  type LucideIcon,
} from "lucide-react";
import type { MetierCategorie } from "@bara/shared-types";

const METIER_ICONS: Record<string, LucideIcon> = {
  nounou: Baby,
  cuisiniere: ChefHat,
  menagere: SprayCan,
  lessiveuse: WashingMachine,
  "agent-entretien": Sparkles,
  "jardinier-paysagiste": Trees,
  chauffeur: Car,
  "livreur-moto": Bike,
  rayonniste: PackageOpen,
  "serveur-temps-partiel": Utensils,
  "serveuse-temps-plein": Utensils,
  "vendeuse-nourriture": Soup,
  "vendeuse-boutique": ShoppingBag,
  "barman-barmaid": Wine,
  patissiere: CakeSlice,
  "reparateur-electronique": Smartphone,
  "reparateur-electromenager": Wrench,
  peintre: PaintRoller,
  serrurier: KeyRound,
  electricien: Zap,
  plombier: Droplets,
  couturier: Scissors,
  "createur-de-contenu": Megaphone,
  "live-streamer": Radio,
  graphiste: Palette,
  photographe: Camera,
  videaste: Clapperboard,
  "illustrateur-2d": PenTool,
  "animateur-3d": Box,
  "arrangeur-de-sons": Music,
  repetiteur: GraduationCap,
  receptionniste: ConciergeBell,
  standardiste: Headset,
  "promeneur-de-chiens": Dog,
};

const CATEGORIE_ICONS: Record<MetierCategorie, LucideIcon> = {
  "maison-et-services-a-la-personne": Home,
  "transport-et-livraison": Truck,
  "restauration-et-commerce": UtensilsCrossed,
  "reparation-et-artisanat": Wrench,
  "creation-et-digital": Palette,
  "education-et-accueil": GraduationCap,
  "services-divers": Sparkles,
};

export function getMetierIcon(slug: string): LucideIcon {
  return METIER_ICONS[slug] ?? Briefcase;
}

export function getCategorieIcon(slug: MetierCategorie): LucideIcon {
  return CATEGORIE_ICONS[slug] ?? Briefcase;
}
