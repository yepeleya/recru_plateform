import { Mail, MapPin, Phone } from "lucide-react";
import type { CvContent } from "@bara/shared-types";

// Template "Charbon" — inspiré des CV élégants à deux colonnes sur fond
// anthracite : nom crème en très gros, pills de compétences, frise à puces.
// Pensé pour les métiers du commerce, du transport et de l'artisanat.

const CREAM = "#f2ede4";

const LANGUAGE_LABELS: Record<string, string> = {
  A1: "Débutant",
  A2: "Élémentaire",
  B1: "Intermédiaire",
  B2: "Inter. avancé",
  C1: "Avancé",
  C2: "Courant",
  native: "Langue maternelle",
};

function formatPeriod(start?: string, end?: string): string {
  if (!start) return "";
  return `${start} - ${end || "auj."}`;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-[13px] font-extrabold uppercase tracking-[0.18em]"
      style={{ color: CREAM }}
    >
      {children}
    </h2>
  );
}

function TimelineEntry({
  title,
  subtitle,
  period,
  text,
}: {
  title: string;
  subtitle?: string;
  period: string;
  text?: string;
}) {
  return (
    <div className="relative border-l border-white/25 pl-3.5">
      <span
        aria-hidden
        className="absolute -left-[3.5px] top-1 h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: CREAM }}
      />
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[10.5px] font-bold text-white">{title}</p>
        <p className="shrink-0 text-[8.5px] text-stone-300">{period}</p>
      </div>
      {subtitle && <p className="text-[9px] italic text-stone-300">{subtitle}</p>}
      {text && <p className="mt-1 text-[9px] leading-relaxed text-stone-300">{text}</p>}
    </div>
  );
}

export function CvTemplateCharbon({ content }: { content: CvContent }) {
  const { personalInfo } = content;
  const fullName = [personalInfo.firstName, personalInfo.lastName].filter(Boolean).join(" ");

  return (
    <div
      className="mx-auto aspect-[210/297] w-full max-w-[520px] overflow-y-auto bg-[#565656] p-5 text-[9.5px] leading-snug text-stone-200"
      style={{ fontFamily: "'Times New Roman', Times, serif" }}
    >
      <div className="grid grid-cols-[2fr_3fr] gap-5">
        {/* ------------------------------------------------ COLONNE GAUCHE */}
        <div className="space-y-5">
          {personalInfo.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={personalInfo.photoUrl}
              alt={fullName || "Photo de profil"}
              className="aspect-[3/4] w-full bg-black object-cover"
            />
          ) : (
            <div
              aria-hidden
              className="flex aspect-[3/4] w-full items-center justify-center bg-black text-4xl font-bold text-stone-600"
            >
              {(personalInfo.firstName?.[0] ?? "") + (personalInfo.lastName?.[0] ?? "") || "?"}
            </div>
          )}

          {content.professionalSummary && (
            <p className="text-[9px] leading-relaxed text-stone-300">
              {content.professionalSummary}
            </p>
          )}

          {content.skills.length > 0 && (
            <div>
              <SectionTitle>Compétences</SectionTitle>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {content.skills.map((skill, i) => (
                  <span
                    key={skill.id}
                    className="rounded-full px-2.5 py-1 text-[8.5px] font-semibold"
                    style={
                      i % 2 === 0
                        ? { backgroundColor: "#1a1a1a", color: CREAM }
                        : { backgroundColor: CREAM, color: "#1a1a1a" }
                    }
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {content.languages.length > 0 && (
            <div>
              <SectionTitle>Langues</SectionTitle>
              <ul className="mt-2.5 space-y-1 text-[9px] text-stone-300">
                {content.languages.map((lang) => (
                  <li key={lang.id}>
                    <span className="font-semibold text-white">{lang.name}</span> —{" "}
                    {LANGUAGE_LABELS[lang.level] ?? lang.level}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <SectionTitle>Contact</SectionTitle>
            <ul className="mt-2.5 space-y-1.5 text-[9px] text-stone-300">
              {personalInfo.phone && (
                <li className="flex items-center gap-2">
                  <Phone className="h-3 w-3 shrink-0" aria-hidden style={{ color: CREAM }} />
                  {personalInfo.phone}
                </li>
              )}
              {personalInfo.email && (
                <li className="flex items-center gap-2">
                  <Mail className="h-3 w-3 shrink-0" aria-hidden style={{ color: CREAM }} />
                  <span className="break-all">{personalInfo.email}</span>
                </li>
              )}
              {personalInfo.city && (
                <li className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 shrink-0" aria-hidden style={{ color: CREAM }} />
                  {personalInfo.city}
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* ------------------------------------------------ COLONNE DROITE */}
        <div className="space-y-5">
          <div>
            <p
              className="text-[26px] font-black uppercase leading-none tracking-tight"
              style={{ color: CREAM }}
            >
              {fullName || "Ton nom complet"}
            </p>
            {personalInfo.jobTitle && (
              <p className="mt-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                {personalInfo.jobTitle}
                <span aria-hidden className="h-px flex-1 bg-white/40" />
                <span aria-hidden className="h-1 w-1 rounded-full" style={{ backgroundColor: CREAM }} />
              </p>
            )}
          </div>

          {content.education.length > 0 && (
            <div>
              <SectionTitle>Formation</SectionTitle>
              <div className="mt-3 space-y-3">
                {content.education.map((edu) => (
                  <TimelineEntry
                    key={edu.id}
                    title={edu.degree || "Diplôme"}
                    subtitle={edu.school}
                    period={formatPeriod(edu.startDate, edu.endDate)}
                    text={edu.fieldOfStudy}
                  />
                ))}
              </div>
            </div>
          )}

          {content.experience.length > 0 && (
            <div>
              <SectionTitle>Expérience</SectionTitle>
              <div className="mt-3 space-y-3">
                {content.experience.map((exp) => (
                  <TimelineEntry
                    key={exp.id}
                    title={exp.position || "Poste"}
                    subtitle={exp.company}
                    period={formatPeriod(exp.startDate, exp.endDate)}
                    text={exp.description}
                  />
                ))}
              </div>
            </div>
          )}

          {content.certifications && content.certifications.length > 0 && (
            <div>
              <SectionTitle>Certifications</SectionTitle>
              <div className="mt-3 space-y-2">
                {content.certifications.map((cert) => (
                  <TimelineEntry
                    key={cert.id}
                    title={cert.name}
                    subtitle={cert.issuer}
                    period={cert.date ?? ""}
                  />
                ))}
              </div>
            </div>
          )}

          {content.references && (
            <div>
              <SectionTitle>Références</SectionTitle>
              <p className="mt-2 text-[9px] leading-relaxed text-stone-300">
                {content.references}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
