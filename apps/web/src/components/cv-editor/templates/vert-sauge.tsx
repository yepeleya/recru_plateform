import { AtSign, MapPin, Smartphone } from "lucide-react";
import type { CvContent } from "@bara/shared-types";

// Template "Vert sauge" — fond clair, photo ronde sur aplat sauge, blobs
// arrondis pour les compétences. Pensé comme modèle par défaut polyvalent
// (étudiants, services, tous les métiers hors digital/artisanat).

const SAGE_LIGHT = "#cdd6cd";
const SAGE_DARK = "#5f7a67";
const INK = "#3d423d";

const LANGUAGE_LABELS: Record<string, string> = {
  A1: "notions",
  A2: "niveau élémentaire",
  B1: "niveau intermédiaire",
  B2: "niveau avancé",
  C1: "courant",
  C2: "courant",
  native: "langue maternelle",
};

function formatPeriod(start?: string, end?: string): string {
  if (!start) return "";
  return `${start} - ${end || "aujourd'hui"}`;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-[11px] font-extrabold uppercase tracking-[0.08em]"
      style={{ color: INK }}
    >
      {children} :
    </h2>
  );
}

export function CvTemplateVertSauge({ content }: { content: CvContent }) {
  const { personalInfo } = content;
  const fullName = [personalInfo.firstName, personalInfo.lastName].filter(Boolean).join(" ");

  return (
    <div
      className="mx-auto aspect-[210/297] w-full max-w-[520px] overflow-y-auto bg-[#fbfbf9] text-[9.5px] leading-relaxed"
      style={{ color: INK, fontFamily: "'Times New Roman', Times, serif" }}
    >
      {/* ------------------------------------------------------- EN-TÊTE */}
      <div className="grid grid-cols-[2fr_3fr]">
        <div
          className="flex items-start justify-center rounded-br-[70px] px-6 pb-10 pt-6"
          style={{ backgroundColor: SAGE_LIGHT }}
        >
          {personalInfo.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={personalInfo.photoUrl}
              alt={fullName || "Photo de profil"}
              className="aspect-square w-full max-w-[130px] rounded-full border-4 border-white object-cover"
            />
          ) : (
            <div
              aria-hidden
              className="flex aspect-square w-full max-w-[130px] items-center justify-center rounded-full border-4 border-white bg-white/60 text-3xl font-bold"
              style={{ color: SAGE_DARK }}
            >
              {(personalInfo.firstName?.[0] ?? "") + (personalInfo.lastName?.[0] ?? "") || "?"}
            </div>
          )}
        </div>
        <div className="px-6 pt-8">
          <p className="text-[22px] font-medium leading-tight" style={{ color: "#2f332f" }}>
            {fullName || "Ton nom complet"}
          </p>
          {personalInfo.jobTitle && (
            <p className="mt-1 text-[11px] font-extrabold uppercase tracking-[0.08em]">
              {personalInfo.jobTitle}
            </p>
          )}
          {content.professionalSummary && (
            <p className="mt-3 text-[9.5px] leading-relaxed">{content.professionalSummary}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-[2fr_3fr] gap-x-4 pb-6">
        {/* ------------------------------------------------ COLONNE GAUCHE */}
        <div>
          <ul className="space-y-2.5 px-6 pt-5">
            {personalInfo.email && (
              <li className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: SAGE_LIGHT }}
                >
                  <AtSign className="h-3 w-3" style={{ color: INK }} />
                </span>
                <span className="break-all">{personalInfo.email}</span>
              </li>
            )}
            {personalInfo.city && (
              <li className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: SAGE_LIGHT }}
                >
                  <MapPin className="h-3 w-3" style={{ color: INK }} />
                </span>
                {personalInfo.city}
              </li>
            )}
            {personalInfo.phone && (
              <li className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: SAGE_LIGHT }}
                >
                  <Smartphone className="h-3 w-3" style={{ color: INK }} />
                </span>
                {personalInfo.phone}
              </li>
            )}
          </ul>

          {content.languages.length > 0 && (
            <div className="px-6 pt-6">
              <SectionTitle>Langues</SectionTitle>
              <ul className="mt-2 space-y-1">
                {content.languages.map((lang) => (
                  <li key={lang.id}>
                    {lang.name} : {LANGUAGE_LABELS[lang.level] ?? lang.level}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {content.hobbies && content.hobbies.length > 0 && (
            <div className="px-6 pt-6">
              <SectionTitle>Centres d&apos;intérêt</SectionTitle>
              <ul className="mt-2 space-y-1">
                {content.hobbies.map((hobby) => (
                  <li key={hobby}>{hobby}</li>
                ))}
              </ul>
            </div>
          )}

          {content.references && (
            <div className="px-6 pt-6">
              <SectionTitle>Références</SectionTitle>
              <p className="mt-2">{content.references}</p>
            </div>
          )}
        </div>

        {/* ------------------------------------------------ COLONNE DROITE */}
        <div className="pr-6">
          {content.skills.length > 0 && (
            <div
              className="mt-5 rounded-[36px] rounded-tl-[70px] px-6 py-5"
              style={{ backgroundColor: SAGE_LIGHT }}
            >
              <SectionTitle>Compétences</SectionTitle>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                {content.skills.map((skill) => (
                  <li key={skill.id}>
                    {skill.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {content.experience.length > 0 && (
            <div className="pt-6">
              <SectionTitle>Expériences</SectionTitle>
              <div className="mt-2.5 space-y-3.5">
                {content.experience.map((exp) => (
                  <div key={exp.id}>
                    <p className="text-[10px] font-bold">{exp.position}</p>
                    <p>
                      {exp.company}
                      {exp.location ? ` - ${exp.location}` : ""}
                    </p>
                    <p className="text-stone-500">{formatPeriod(exp.startDate, exp.endDate)}</p>
                    {exp.description && <p className="mt-0.5">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {content.education.length > 0 && (
            <div className="pt-6">
              <SectionTitle>Formations</SectionTitle>
              <div className="mt-2.5 space-y-3.5">
                {content.education.map((edu) => (
                  <div key={edu.id}>
                    <p>{edu.school}</p>
                    <p className="text-stone-500">{formatPeriod(edu.startDate, edu.endDate)}</p>
                    <p className="text-[10px] font-bold">
                      {edu.degree}
                      {edu.fieldOfStudy ? ` - ${edu.fieldOfStudy}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {content.certifications && content.certifications.length > 0 && (
            <div className="pt-6">
              <SectionTitle>Certifications</SectionTitle>
              <div className="mt-2.5 space-y-2">
                {content.certifications.map((cert) => (
                  <div key={cert.id}>
                    <p className="text-[10px] font-bold">{cert.name}</p>
                    <p className="text-stone-500">
                      {cert.issuer}
                      {cert.date ? ` — ${cert.date}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
