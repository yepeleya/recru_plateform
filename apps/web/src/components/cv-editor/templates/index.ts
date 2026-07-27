import type { CvContent } from "@bara/shared-types";
import { CvTemplateClassique } from "./classique";
import { CvTemplateBentoDark } from "./bento-dark";
import { CvTemplateCharbon } from "./charbon";
import { CvTemplateVertSauge } from "./vert-sauge";

export type CvTemplateId = "classique" | "bento-dark" | "charbon" | "vert-sauge";

export interface CvTemplateInfo {
  id: CvTemplateId;
  label: string;
  /** À qui ce modèle s'adresse — affiché dans le sélecteur. */
  audience: string;
  Component: (props: { content: CvContent }) => React.ReactNode;
}

export const CV_TEMPLATES: CvTemplateInfo[] = [
  {
    id: "vert-sauge",
    label: "Vert sauge",
    audience: "Polyvalent — étudiants, services, tous métiers",
    Component: CvTemplateVertSauge,
  },
  {
    id: "charbon",
    label: "Charbon",
    audience: "Commerce, transport, artisanat — vendeuse, chauffeur, maçon…",
    Component: CvTemplateCharbon,
  },
  {
    id: "bento-dark",
    label: "Bento sombre",
    audience: "Métiers du digital — dev, graphiste, designer…",
    Component: CvTemplateBentoDark,
  },
  {
    id: "classique",
    label: "Classique",
    audience: "Tous métiers — sobre et efficace",
    Component: CvTemplateClassique,
  },
];

export const DEFAULT_TEMPLATE_ID: CvTemplateId = "vert-sauge";

export function getTemplate(id: string | undefined): CvTemplateInfo {
  return CV_TEMPLATES.find((t) => t.id === id) ?? CV_TEMPLATES[0];
}
