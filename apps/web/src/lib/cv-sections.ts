// Règles de contenu du CV pour la Côte d'Ivoire — Bara ne cible que ce marché,
// donc contrairement à cvmaker (multi-pays), ces règles sont figées ici plutôt
// que dans un package country-config séparé.

export type CvSectionVisibility = "required" | "recommended" | "optional";

export const CI_SECTION_VISIBILITY = {
  photo: "required",
  civilStatus: "recommended",
  professionalSummary: "optional",
  experience: "required",
  education: "required",
  skills: "required",
  languages: "recommended",
  hobbies: "optional",
  references: "optional",
  certifications: "optional",
  projects: "optional",
} as const satisfies Record<string, CvSectionVisibility>;

export const CI_GUIDELINES = {
  maxPages: 2,
  doList: [
    "Inclus une photo professionnelle (attendue dans la pratique en Côte d'Ivoire).",
    "Mentionne ta nationalité, ta date de naissance et ta situation familiale.",
    "Soigne la présentation : un CV propre et structuré est très apprécié.",
    "Indique tes langues et dialectes locaux si pertinent.",
  ],
  dontList: [
    "Évite les fautes d'orthographe et de grammaire.",
    "Ne dépasse pas 2 pages.",
    "Évite les couleurs trop vives ou les mises en page fantaisistes.",
  ],
} as const;

export const VISIBILITY_LABELS: Record<CvSectionVisibility, string> = {
  required: "Requis",
  recommended: "Recommandé",
  optional: "Optionnel",
};
