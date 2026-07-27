// Référentiel des métiers couverts par Bara — liste métier réelle définie par le produit.
// Chaque entrée alimente : le profil candidat (choix du métier), la création d'offre
// côté recruteur, et la page SEO /metiers/[slug] (voir docs/architecture-seo.md).

export type MetierCategorie =
  | 'maison-et-services-a-la-personne'
  | 'transport-et-livraison'
  | 'restauration-et-commerce'
  | 'reparation-et-artisanat'
  | 'creation-et-digital'
  | 'education-et-accueil'
  | 'services-divers';

export interface MetierCategorieInfo {
  slug: MetierCategorie;
  label: string;
}

export const METIER_CATEGORIES: MetierCategorieInfo[] = [
  { slug: 'maison-et-services-a-la-personne', label: 'Maison & services à la personne' },
  { slug: 'transport-et-livraison', label: 'Transport & livraison' },
  { slug: 'restauration-et-commerce', label: 'Restauration & commerce' },
  { slug: 'reparation-et-artisanat', label: 'Réparation & artisanat' },
  { slug: 'creation-et-digital', label: 'Création & digital' },
  { slug: 'education-et-accueil', label: 'Éducation & accueil' },
  { slug: 'services-divers', label: 'Services divers' },
];

export interface Metier {
  /** Identifiant URL-friendly, utilisé par /metiers/[slug]. */
  slug: string;
  label: string;
  categorie: MetierCategorie;
  /** Description courte et unique — utilisée dans le contenu et les métadonnées SEO. */
  blurb: string;
}

export const METIERS: Metier[] = [
  // Maison & services à la personne
  {
    slug: 'nounou',
    label: 'Nounou à temps partiel',
    categorie: 'maison-et-services-a-la-personne',
    blurb: "Garde d'enfants à domicile, à la journée ou à temps partiel.",
  },
  {
    slug: 'cuisiniere',
    label: 'Cuisinière',
    categorie: 'maison-et-services-a-la-personne',
    blurb: 'Prépare des repas maison ou pour des événements, du plat du jour au menu complet sur mesure.',
  },
  {
    slug: 'menagere',
    label: 'Ménagère',
    categorie: 'maison-et-services-a-la-personne',
    blurb: "Assure le ménage, le rangement et l'entretien courant d'une maison ou d'un bureau.",
  },
  {
    slug: 'lessiveuse',
    label: 'Lessiveuse',
    categorie: 'maison-et-services-a-la-personne',
    blurb: 'Prend en charge le lavage, le séchage et le repassage du linge à la demande.',
  },
  {
    slug: 'agent-entretien',
    label: "Agent d'entretien",
    categorie: 'maison-et-services-a-la-personne',
    blurb: 'Nettoie et entretient les locaux professionnels : bureaux, commerces, immeubles.',
  },
  {
    slug: 'jardinier-paysagiste',
    label: 'Jardinier / paysagiste',
    categorie: 'maison-et-services-a-la-personne',
    blurb: 'Entretient jardins, cours et espaces verts : tonte, taille, plantation, aménagement.',
  },

  // Transport & livraison
  {
    slug: 'chauffeur',
    label: 'Chauffeur',
    categorie: 'transport-et-livraison',
    blurb: 'Conduit pour des trajets ponctuels ou réguliers, pour un particulier ou une entreprise.',
  },
  {
    slug: 'livreur-moto',
    label: 'Livreur à moto',
    categorie: 'transport-et-livraison',
    blurb: 'Livre colis, repas ou courses rapidement partout en ville, à moto.',
  },

  // Restauration & commerce
  {
    slug: 'rayonniste',
    label: 'Rayonniste à temps partiel',
    categorie: 'restauration-et-commerce',
    blurb: 'Range et met en valeur les produits en rayon dans un supermarché ou une boutique.',
  },
  {
    slug: 'serveur-temps-partiel',
    label: 'Serveuse / serveur à temps partiel',
    categorie: 'restauration-et-commerce',
    blurb: 'Sert en salle lors de renforts ponctuels : restaurants et événements.',
  },
  {
    slug: 'serveuse-temps-plein',
    label: 'Serveuse à temps plein',
    categorie: 'restauration-et-commerce',
    blurb: "Assure le service en salle au quotidien dans un restaurant, un bar ou un hôtel.",
  },
  {
    slug: 'vendeuse-nourriture',
    label: 'Vendeuse de nourriture',
    categorie: 'restauration-et-commerce',
    blurb: 'Prépare et vend de la nourriture prête à consommer, en boutique ou en extérieur.',
  },
  {
    slug: 'vendeuse-boutique',
    label: 'Vendeuse en boutique',
    categorie: 'restauration-et-commerce',
    blurb: 'Accueille les clients et assure la vente dans une boutique ou un point de vente.',
  },
  {
    slug: 'barman-barmaid',
    label: 'Barman / Barmaid',
    categorie: 'restauration-et-commerce',
    blurb: "Prépare et sert boissons et cocktails dans un bar, un restaurant ou lors d'un événement.",
  },
  {
    slug: 'patissiere',
    label: 'Pâtissière',
    categorie: 'restauration-et-commerce',
    blurb: 'Confectionne gâteaux, viennoiseries et pâtisseries pour particuliers ou commerces.',
  },

  // Réparation & artisanat
  {
    slug: 'reparateur-electronique',
    label: "Réparateur d'appareils électroniques",
    categorie: 'reparation-et-artisanat',
    blurb: 'Répare téléphones, ordinateurs et appareils électroniques.',
  },
  {
    slug: 'reparateur-electromenager',
    label: "Réparateur d'appareils ménagers",
    categorie: 'reparation-et-artisanat',
    blurb: 'Répare réfrigérateurs, machines à laver et appareils ménagers.',
  },
  {
    slug: 'peintre',
    label: 'Peintre',
    categorie: 'reparation-et-artisanat',
    blurb: 'Réalise les travaux de peinture intérieure et extérieure pour particuliers et professionnels.',
  },
  {
    slug: 'serrurier',
    label: 'Serrurier',
    categorie: 'reparation-et-artisanat',
    blurb: 'Installe, répare et dépanne serrures et systèmes de fermeture, y compris en urgence.',
  },
  {
    slug: 'electricien',
    label: 'Électricien',
    categorie: 'reparation-et-artisanat',
    blurb: 'Installe et répare les circuits et équipements électriques en toute sécurité.',
  },
  {
    slug: 'plombier',
    label: 'Plombier',
    categorie: 'reparation-et-artisanat',
    blurb: 'Installe et répare canalisations, sanitaires et systèmes de plomberie.',
  },
  {
    slug: 'couturier',
    label: 'Couturier',
    categorie: 'reparation-et-artisanat',
    blurb: 'Confectionne, ajuste et répare des vêtements sur mesure ou en retouche.',
  },

  // Création & digital
  {
    slug: 'createur-de-contenu',
    label: 'Créateur de contenu pour marque',
    categorie: 'creation-et-digital',
    blurb: "Crée du contenu photo, vidéo ou texte pour la communication d'une marque.",
  },
  {
    slug: 'live-streamer',
    label: 'Live / live-streamer',
    categorie: 'creation-et-digital',
    blurb: 'Anime des sessions en direct sur les réseaux sociaux pour des marques.',
  },
  {
    slug: 'graphiste',
    label: 'Graphiste',
    categorie: 'creation-et-digital',
    blurb: "Conçoit logos, visuels et supports graphiques pour la communication d'une marque ou d'un projet.",
  },
  {
    slug: 'photographe',
    label: 'Photographe',
    categorie: 'creation-et-digital',
    blurb: 'Réalise des reportages photo pour événements, portraits ou contenus commerciaux.',
  },
  {
    slug: 'videaste',
    label: 'Vidéaste',
    categorie: 'creation-et-digital',
    blurb: 'Tourne et monte des vidéos pour événements, marques ou contenus en ligne.',
  },
  {
    slug: 'illustrateur-2d',
    label: 'Illustrateur 2D',
    categorie: 'creation-et-digital',
    blurb: "Crée des illustrations originales pour la communication, l'édition ou les réseaux sociaux.",
  },
  {
    slug: 'animateur-3d',
    label: 'Animateur 3D',
    categorie: 'creation-et-digital',
    blurb: 'Conçoit des animations et modélisations 3D pour la communication ou le divertissement.',
  },
  {
    slug: 'arrangeur-de-sons',
    label: 'Arrangeur de sons',
    categorie: 'creation-et-digital',
    blurb: 'Compose, mixe et arrange des créations sonores et musicales.',
  },

  // Éducation & accueil
  {
    slug: 'repetiteur',
    label: 'Répétiteur',
    categorie: 'education-et-accueil',
    blurb: 'Donne des cours particuliers et un accompagnement scolaire personnalisé.',
  },
  {
    slug: 'receptionniste',
    label: 'Réceptionniste',
    categorie: 'education-et-accueil',
    blurb: "Accueille les visiteurs et gère les rendez-vous d'une entreprise.",
  },
  {
    slug: 'standardiste',
    label: 'Standardiste',
    categorie: 'education-et-accueil',
    blurb: "Gère les appels entrants et oriente les correspondants au sein d'une entreprise.",
  },

  // Services divers
  {
    slug: 'promeneur-de-chiens',
    label: 'Promeneur de chiens',
    categorie: 'services-divers',
    blurb: 'Promène et s\'occupe des chiens au quotidien pour le compte de leurs propriétaires.',
  },
];

export function getMetiersByCategorie(categorie: MetierCategorie): Metier[] {
  return METIERS.filter((metier) => metier.categorie === categorie);
}

export function getMetierBySlug(slug: string): Metier | undefined {
  return METIERS.find((metier) => metier.slug === slug);
}
