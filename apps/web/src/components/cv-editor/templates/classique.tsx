import type { CvContent } from "@bara/shared-types";

const LANGUAGE_LABELS: Record<string, string> = {
  A1: "Débutant",
  A2: "Élémentaire",
  B1: "Intermédiaire",
  B2: "Intermédiaire avancé",
  C1: "Avancé",
  C2: "Courant",
  native: "Langue maternelle",
};

function formatPeriod(start?: string, end?: string): string {
  if (!start) return "";
  return `${start} — ${end || "aujourd'hui"}`;
}

export function CvTemplateClassique({ content }: { content: CvContent }) {
  const { personalInfo } = content;
  const fullName = [personalInfo.firstName, personalInfo.lastName].filter(Boolean).join(" ");
  const contactLine = [personalInfo.city, personalInfo.phone, personalInfo.email]
    .filter(Boolean)
    .join(" · ");
  const civilStatusLine = [
    personalInfo.nationality,
    personalInfo.dateOfBirth && `né(e) le ${personalInfo.dateOfBirth}`,
    personalInfo.maritalStatus,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      className="mx-auto aspect-[210/297] w-full max-w-[520px] overflow-y-auto bg-white p-8 text-[11px] leading-snug text-stone-800 shadow-lg ring-1 ring-stone-200"
      style={{ fontFamily: "'Times New Roman', Times, serif" }}
    >
      <header className="flex items-center gap-4 border-b-2 border-brand pb-4">
        {personalInfo.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={personalInfo.photoUrl}
            alt={fullName || "Photo de profil"}
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <div
            aria-hidden
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-brand-light text-2xl font-bold text-brand-dark"
          >
            {(personalInfo.firstName?.[0] ?? "") + (personalInfo.lastName?.[0] ?? "")}
          </div>
        )}
        <div>
          <p className="text-xl font-bold text-ink">{fullName || "Ton nom complet"}</p>
          {personalInfo.jobTitle && (
            <p className="font-medium text-brand-dark">{personalInfo.jobTitle}</p>
          )}
          {contactLine && <p className="mt-1 text-stone-500">{contactLine}</p>}
          {civilStatusLine && <p className="text-stone-500">{civilStatusLine}</p>}
        </div>
      </header>

      {content.professionalSummary && (
        <section className="mt-4">
          <p className="text-stone-700">{content.professionalSummary}</p>
        </section>
      )}

      {content.experience.length > 0 && (
        <section className="mt-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-dark">
            Expérience
          </h2>
          <div className="mt-2 space-y-3">
            {content.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-semibold">
                    {exp.position} — {exp.company}
                  </p>
                  <p className="shrink-0 text-stone-500">
                    {formatPeriod(exp.startDate, exp.endDate)}
                  </p>
                </div>
                {exp.location && <p className="text-stone-500">{exp.location}</p>}
                {exp.description && <p className="mt-0.5 text-stone-700">{exp.description}</p>}
                {exp.achievements && exp.achievements.length > 0 && (
                  <ul className="mt-0.5 list-disc space-y-0.5 pl-4 text-stone-700">
                    {exp.achievements.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {content.education.length > 0 && (
        <section className="mt-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-dark">
            Formation
          </h2>
          <div className="mt-2 space-y-2">
            {content.education.map((edu) => (
              <div key={edu.id}>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-semibold">
                    {edu.degree}
                    {edu.fieldOfStudy ? ` — ${edu.fieldOfStudy}` : ""}
                  </p>
                  <p className="shrink-0 text-stone-500">
                    {formatPeriod(edu.startDate, edu.endDate)}
                  </p>
                </div>
                <p className="text-stone-500">{edu.school}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {content.skills.length > 0 && (
        <section className="mt-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-dark">
            Compétences
          </h2>
          <p className="mt-2 text-stone-700">
            {content.skills.map((skill) => skill.name).join(" · ")}
          </p>
        </section>
      )}

      {content.languages.length > 0 && (
        <section className="mt-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-dark">Langues</h2>
          <p className="mt-2 text-stone-700">
            {content.languages
              .map((lang) => `${lang.name} (${LANGUAGE_LABELS[lang.level] ?? lang.level})`)
              .join(" · ")}
          </p>
        </section>
      )}

      {content.certifications && content.certifications.length > 0 && (
        <section className="mt-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-dark">
            Certifications
          </h2>
          <div className="mt-2 space-y-1 text-stone-700">
            {content.certifications.map((cert) => (
              <p key={cert.id}>
                {cert.name}
                {cert.issuer ? ` — ${cert.issuer}` : ""}
                {cert.date ? ` (${cert.date})` : ""}
              </p>
            ))}
          </div>
        </section>
      )}

      {content.projects && content.projects.length > 0 && (
        <section className="mt-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-dark">Projets</h2>
          <div className="mt-2 space-y-1 text-stone-700">
            {content.projects.map((project) => (
              <p key={project.id}>
                <span className="font-semibold">{project.name}</span>
                {project.description ? ` — ${project.description}` : ""}
              </p>
            ))}
          </div>
        </section>
      )}

      {content.hobbies && content.hobbies.length > 0 && (
        <section className="mt-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-dark">Loisirs</h2>
          <p className="mt-2 text-stone-700">{content.hobbies.join(" · ")}</p>
        </section>
      )}

      {content.references && (
        <section className="mt-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-dark">
            Références
          </h2>
          <p className="mt-2 text-stone-700">{content.references}</p>
        </section>
      )}
    </div>
  );
}
