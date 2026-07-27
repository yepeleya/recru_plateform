// DONNÉES DE DÉMONSTRATION — à remplacer par les appels API quand le backend
// (apps/api) existera. Elles permettent de construire et tester les pages
// /offres et /profils avec les vrais types @bara/shared-types dès maintenant.
// Les pages détail restent en noindex tant que ces données sont fictives.
import type { JobOffer, WorkerProfile } from "@bara/shared-types";

export const DEMO_OFFERS: JobOffer[] = [
  {
    id: "offer-1",
    slug: "graphiste-logo-marque-cocody",
    title: "Création de logo pour une marque de cosmétiques",
    description:
      "Nous lançons une marque de cosmétiques naturels et cherchons un graphiste pour créer notre logo et notre charte graphique (couleurs, typographie, déclinaisons réseaux sociaux). Brief complet disponible, 2 à 3 propositions attendues.",
    metierSlug: "graphiste",
    type: "mission-ponctuelle",
    city: "Abidjan",
    area: "Cocody",
    budgetMin: 50000,
    budgetMax: 100000,
    status: "published",
    recruiterId: "demo-recruiter-1",
    createdAt: "2026-07-01T09:00:00Z",
    updatedAt: "2026-07-01T09:00:00Z",
  },
  {
    id: "offer-2",
    slug: "serveuses-renfort-restaurant-plateau",
    title: "Serveuses / serveurs en renfort pour un restaurant",
    description:
      "Restaurant au Plateau cherche 4 serveuses/serveurs en renfort pour la période des fêtes. Service midi et soir, week-ends inclus. Expérience en salle exigée, tenue correcte fournie.",
    metierSlug: "serveur-temps-partiel",
    type: "saisonnier",
    city: "Abidjan",
    area: "Plateau",
    budgetLabel: "5 000 FCFA / jour",
    startDate: "2026-12-15",
    endDate: "2027-01-05",
    status: "published",
    recruiterId: "demo-recruiter-2",
    createdAt: "2026-07-02T14:30:00Z",
    updatedAt: "2026-07-02T14:30:00Z",
  },
  {
    id: "offer-3",
    slug: "chauffeur-livraisons-yopougon",
    title: "Chauffeur pour livraisons quotidiennes",
    description:
      "Entreprise de distribution cherche un chauffeur expérimenté pour des tournées de livraison quotidiennes à Yopougon et environs. Permis B exigé, véhicule fourni. Poste à temps plein, démarrage immédiat.",
    metierSlug: "chauffeur",
    type: "temps-plein",
    city: "Abidjan",
    area: "Yopougon",
    budgetLabel: "à négocier",
    status: "published",
    recruiterId: "demo-recruiter-3",
    createdAt: "2026-07-03T08:00:00Z",
    updatedAt: "2026-07-03T08:00:00Z",
  },
  {
    id: "offer-4",
    slug: "menagere-2-jours-semaine-riviera",
    title: "Ménagère 2 jours par semaine",
    description:
      "Famille à la Riviera cherche une ménagère sérieuse pour 2 jours par semaine (mardi et vendredi) : ménage complet, repassage. Références demandées.",
    metierSlug: "menagere",
    type: "temps-partiel",
    city: "Abidjan",
    area: "Riviera",
    budgetLabel: "20 000 FCFA / semaine",
    status: "published",
    recruiterId: "demo-recruiter-4",
    createdAt: "2026-07-03T18:00:00Z",
    updatedAt: "2026-07-03T18:00:00Z",
  },
  {
    id: "offer-5",
    slug: "montage-videos-tiktok-marque",
    title: "Montage de vidéos TikTok pour une marque",
    description:
      "Marque de prêt-à-porter cherche un vidéaste/monteur pour produire 8 vidéos TikTok par mois : montage dynamique, sous-titres, tendances. Travail à distance possible, rushs fournis.",
    metierSlug: "videaste",
    type: "a-distance",
    city: "Abidjan",
    budgetMin: 80000,
    budgetMax: 120000,
    status: "published",
    recruiterId: "demo-recruiter-1",
    createdAt: "2026-07-04T10:00:00Z",
    updatedAt: "2026-07-04T10:00:00Z",
  },
  {
    id: "offer-6",
    slug: "rayonnistes-vacances-supermarche-marcory",
    title: "Rayonnistes pour les vacances (supermarché)",
    description:
      "Supermarché à Marcory recrute 6 rayonnistes étudiants pour juillet-août : mise en rayon, étiquetage, inventaire. Idéal job de vacances, plannings flexibles.",
    metierSlug: "rayonniste",
    type: "saisonnier",
    city: "Abidjan",
    area: "Marcory",
    budgetLabel: "90 000 FCFA / mois",
    startDate: "2026-07-15",
    endDate: "2026-08-31",
    status: "published",
    recruiterId: "demo-recruiter-5",
    createdAt: "2026-07-04T11:00:00Z",
    updatedAt: "2026-07-04T11:00:00Z",
  },
];

export const DEMO_PROFILES: WorkerProfile[] = [
  {
    id: "profile-1",
    slug: "graphiste-abidjan-aya-k",
    userId: "demo-user-1",
    headline: "Graphiste & illustratrice — logos et identités de marque",
    bio: "5 ans d'expérience en création de logos, chartes graphiques et supports print. Je travaille vite et j'écoute vraiment le brief.",
    metierSlug: "graphiste",
    city: "Abidjan",
    isAvailableNow: true,
    jobTypes: ["mission-ponctuelle", "a-distance"],
    isVisible: true,
    createdAt: "2026-06-20T10:00:00Z",
    updatedAt: "2026-07-04T08:00:00Z",
  },
  {
    id: "profile-2",
    slug: "chauffeur-abidjan-moussa-d",
    userId: "demo-user-2",
    headline: "Chauffeur professionnel — 10 ans sans accident",
    bio: "Permis B et C, très bonne connaissance d'Abidjan et de l'intérieur du pays. Disponible pour courses, livraisons ou poste fixe.",
    metierSlug: "chauffeur",
    city: "Abidjan",
    isAvailableNow: true,
    jobTypes: ["temps-plein", "mission-ponctuelle"],
    isVisible: true,
    createdAt: "2026-06-22T10:00:00Z",
    updatedAt: "2026-07-03T15:00:00Z",
  },
  {
    id: "profile-3",
    slug: "menagere-abidjan-mariam-t",
    userId: "demo-user-3",
    headline: "Ménagère expérimentée — références vérifiables",
    bio: "8 ans au service de familles à Cocody et Riviera. Ménage, repassage, organisation. Sérieuse et ponctuelle.",
    metierSlug: "menagere",
    city: "Abidjan",
    isAvailableNow: false,
    availableFrom: "2026-08-01",
    jobTypes: ["temps-partiel", "temps-plein"],
    isVisible: true,
    createdAt: "2026-06-25T10:00:00Z",
    updatedAt: "2026-07-02T09:00:00Z",
  },
  {
    id: "profile-4",
    slug: "videaste-abidjan-yao-b",
    userId: "demo-user-4",
    headline: "Vidéaste & monteur — clips, pubs, contenus réseaux",
    bio: "Je tourne et je monte : mariages, clips, publicités, contenus TikTok/Instagram. Matériel professionnel complet.",
    metierSlug: "videaste",
    city: "Abidjan",
    isAvailableNow: true,
    jobTypes: ["mission-ponctuelle", "a-distance"],
    isVisible: true,
    createdAt: "2026-06-26T10:00:00Z",
    updatedAt: "2026-07-04T07:00:00Z",
  },
  {
    id: "profile-5",
    slug: "electricien-abidjan-souleymane-k",
    userId: "demo-user-5",
    headline: "Électricien bâtiment — dépannage et installation",
    bio: "Installation complète, mise aux normes, dépannage urgent. J'interviens dans toutes les communes d'Abidjan.",
    metierSlug: "electricien",
    city: "Abidjan",
    isAvailableNow: true,
    jobTypes: ["mission-ponctuelle"],
    isVisible: true,
    createdAt: "2026-06-28T10:00:00Z",
    updatedAt: "2026-07-04T06:00:00Z",
  },
  {
    id: "profile-6",
    slug: "patissiere-abidjan-fatou-c",
    userId: "demo-user-6",
    headline: "Pâtissière — gâteaux d'anniversaire et événements",
    bio: "Gâteaux personnalisés, pièces montées, mignardises pour vos événements. Commande minimum 48h à l'avance.",
    metierSlug: "patissiere",
    city: "Abidjan",
    isAvailableNow: false,
    availableFrom: "2026-07-20",
    jobTypes: ["mission-ponctuelle"],
    isVisible: true,
    createdAt: "2026-06-30T10:00:00Z",
    updatedAt: "2026-07-01T12:00:00Z",
  },
  {
    id: "profile-7",
    slug: "repetiteur-abidjan-jean-marc-a",
    userId: "demo-user-7",
    headline: "Répétiteur maths & physique — collège et lycée",
    bio: "Étudiant en master de mathématiques, 4 ans d'expérience en cours à domicile. Pédagogue et patient, résultats prouvés au BEPC et au BAC.",
    metierSlug: "repetiteur",
    city: "Abidjan",
    isAvailableNow: true,
    jobTypes: ["temps-partiel", "mission-ponctuelle"],
    isVisible: true,
    createdAt: "2026-07-01T10:00:00Z",
    updatedAt: "2026-07-04T09:00:00Z",
  },
  {
    id: "profile-8",
    slug: "nounou-abidjan-adjoua-n",
    userId: "demo-user-8",
    headline: "Nounou à temps partiel — douce et expérimentée",
    bio: "Garde d'enfants de 6 mois à 10 ans, aide aux devoirs, repas. Disponible en semaine après-midi et week-ends.",
    metierSlug: "nounou",
    city: "Abidjan",
    isAvailableNow: false,
    availableFrom: "2026-09-01",
    jobTypes: ["temps-partiel"],
    isVisible: true,
    createdAt: "2026-07-02T10:00:00Z",
    updatedAt: "2026-07-03T11:00:00Z",
  },
];

export function getDemoOfferBySlug(slug: string): JobOffer | undefined {
  return DEMO_OFFERS.find((offer) => offer.slug === slug);
}

export function getDemoProfileBySlug(slug: string): WorkerProfile | undefined {
  return DEMO_PROFILES.find((profile) => profile.slug === slug);
}

export function formatBudget(offer: JobOffer): string {
  if (offer.budgetLabel) return offer.budgetLabel;
  if (offer.budgetMin && offer.budgetMax) {
    return `${offer.budgetMin.toLocaleString("fr-FR")} – ${offer.budgetMax.toLocaleString("fr-FR")} FCFA`;
  }
  if (offer.budgetMin) return `à partir de ${offer.budgetMin.toLocaleString("fr-FR")} FCFA`;
  return "Budget à discuter";
}

export const JOB_TYPE_LABELS: Record<string, string> = {
  "mission-ponctuelle": "Mission ponctuelle",
  saisonnier: "Saisonnier / vacances",
  "temps-partiel": "Temps partiel",
  "temps-plein": "Temps plein",
  "a-distance": "À distance",
  stage: "Stage",
};
