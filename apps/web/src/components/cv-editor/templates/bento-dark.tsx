import type { CvContent } from "@bara/shared-types";

// Template "Bento sombre" — inspiré des CV modernes des métiers du digital :
// fond noir, cartes arrondies façon bento, chips pour les infos courtes.

const LANGUAGE_LABELS: Record<string, string> = {
  A1: "Débutant",
  A2: "Élémentaire",
  B1: "Intermédiaire",
  B2: "Inter. avancé",
  C1: "Avancé",
  C2: "Courant",
  native: "Natif",
};

function computeAge(dateOfBirth?: string): string | null {
  if (!dateOfBirth) return null;
  const birth = new Date(dateOfBirth);
  if (Number.isNaN(birth.getTime())) return null;
  const age = Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 3600 * 1000));
  return age > 0 && age < 120 ? `${age} ans` : null;
}

function formatPeriod(start?: string, end?: string): string {
  if (!start) return "";
  return `${start} — ${end || "auj."}`;
}

function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl bg-[#161616] p-4 ${className}`}>{children}</div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg border border-white/5 bg-[#0c0c0c] px-2.5 py-1 text-[8.5px] font-medium text-stone-300">
      {children}
    </span>
  );
}

function DateChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="shrink-0 rounded-lg bg-[#0c0c0c] px-2.5 py-1 text-[8px] font-medium text-stone-400">
      {children}
    </span>
  );
}

function RowLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="shrink-0 border-r border-white/10 pr-3 text-[10px] font-bold text-white">
      {children}
    </span>
  );
}

export function CvTemplateBentoDark({ content }: { content: CvContent }) {
  const { personalInfo } = content;
  const fullName = [personalInfo.firstName, personalInfo.lastName].filter(Boolean).join(" ");
  const age = computeAge(personalInfo.dateOfBirth);

  const detailChips = [
    age,
    personalInfo.email,
    personalInfo.phone,
    personalInfo.city,
    personalInfo.nationality,
  ].filter(Boolean) as string[];

  return (
    <div
      className="mx-auto aspect-[210/297] w-full max-w-[520px] overflow-y-auto bg-[#0a0a0a] p-4 text-[9.5px] leading-snug text-stone-300"
      style={{ fontFamily: "'Times New Roman', Times, serif" }}
    >
      <div className="space-y-2.5">
        {/* ------------------------------------------------ PHOTO + INTRO */}
        <div className="grid grid-cols-[2fr_3fr] gap-2.5">
          {personalInfo.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={personalInfo.photoUrl}
              alt={fullName || "Photo de profil"}
              className="aspect-square w-full rounded-2xl object-cover"
            />
          ) : (
            <div
              aria-hidden
              className="flex aspect-square w-full items-center justify-center rounded-2xl bg-[#161616] text-3xl font-bold text-stone-600"
            >
              {(personalInfo.firstName?.[0] ?? "") + (personalInfo.lastName?.[0] ?? "") || "?"}
            </div>
          )}
          <div className="flex flex-col gap-2.5">
            <Card className="flex flex-1 items-center">
              <p className="text-[11px] font-medium italic leading-relaxed text-white">
                {content.professionalSummary ||
                  `${fullName || "Ton nom"}${personalInfo.jobTitle ? `, ${personalInfo.jobTitle.toLowerCase()}` : ""} — présente-toi en 2-3 phrases dans le résumé professionnel.`}
              </p>
            </Card>
            {content.hobbies && content.hobbies.length > 0 && (
              <Card className="flex items-center gap-3 py-3">
                <RowLabel>Intérêts</RowLabel>
                <div className="flex flex-wrap gap-1.5">
                  {content.hobbies.map((hobby) => (
                    <Chip key={hobby}>{hobby}</Chip>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------ EXPÉRIENCE */}
        {content.experience.length > 0 && (
          <div className="grid grid-cols-2 gap-2.5">
            {content.experience.map((exp) => (
              <Card key={exp.id}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13px] font-bold text-white">{exp.company}</p>
                  <DateChip>{formatPeriod(exp.startDate, exp.endDate)}</DateChip>
                </div>
                <p className="mt-0.5 text-stone-400">{exp.position}</p>
                {(exp.description || (exp.achievements && exp.achievements.length > 0)) && (
                  <>
                    <hr className="my-2 border-white/10" />
                    <ul className="list-disc space-y-1 pl-3.5 text-stone-400">
                      {exp.description && <li>{exp.description}</li>}
                      {exp.achievements?.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* --------------------------------------- COMPÉTENCES + FORMATION */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-2.5">
            {content.skills.length > 0 && (
              <Card className="flex items-center gap-3 py-3">
                <RowLabel>Compétences</RowLabel>
                <div className="flex flex-wrap gap-1.5">
                  {content.skills.map((skill) => (
                    <Chip key={skill.id}>{skill.name}</Chip>
                  ))}
                </div>
              </Card>
            )}
            {content.languages.length > 0 && (
              <Card className="flex items-center gap-3 py-3">
                <RowLabel>Langues</RowLabel>
                <div className="flex flex-wrap gap-1.5">
                  {content.languages.map((lang) => (
                    <Chip key={lang.id}>
                      {lang.name} · {LANGUAGE_LABELS[lang.level] ?? lang.level}
                    </Chip>
                  ))}
                </div>
              </Card>
            )}
            {content.certifications && content.certifications.length > 0 && (
              <Card className="flex items-center gap-3 py-3">
                <RowLabel>Certifs</RowLabel>
                <div className="flex flex-wrap gap-1.5">
                  {content.certifications.map((cert) => (
                    <Chip key={cert.id}>
                      {cert.name}
                      {cert.issuer ? ` · ${cert.issuer}` : ""}
                    </Chip>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {content.education.length > 0 && (
            <Card>
              <div className="space-y-3">
                {content.education.map((edu, i) => (
                  <div key={edu.id}>
                    {i > 0 && <hr className="mb-3 border-white/10" />}
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13px] font-bold text-white">{edu.degree}</p>
                      <DateChip>{formatPeriod(edu.startDate, edu.endDate)}</DateChip>
                    </div>
                    {edu.fieldOfStudy && <p className="text-stone-400">{edu.fieldOfStudy}</p>}
                    <p className="text-stone-500">{edu.school}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* -------------------------------------------------------- PROJETS */}
        {content.projects && content.projects.length > 0 && (
          <Card className="flex items-center gap-3 py-3">
            <RowLabel>Portfolio</RowLabel>
            <div className="flex flex-wrap gap-1.5">
              {content.projects.map((project) => (
                <Chip key={project.id}>
                  {project.name}
                  {project.url ? ` · ${project.url.replace(/^https?:\/\//, "")}` : ""}
                </Chip>
              ))}
            </div>
          </Card>
        )}

        {/* -------------------------------------------------------- DÉTAILS */}
        {detailChips.length > 0 && (
          <Card className="flex items-center gap-3 py-3">
            <RowLabel>Détails</RowLabel>
            <div className="flex flex-wrap gap-1.5">
              {detailChips.map((detail) => (
                <Chip key={detail}>{detail}</Chip>
              ))}
            </div>
          </Card>
        )}

        {content.references && (
          <Card className="flex items-center gap-3 py-3">
            <RowLabel>Références</RowLabel>
            <p className="text-stone-400">{content.references}</p>
          </Card>
        )}
      </div>
    </div>
  );
}
