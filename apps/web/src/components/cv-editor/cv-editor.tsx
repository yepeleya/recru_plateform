"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Upload, CheckCircle2, Save, Download } from "lucide-react";
import type {
  CvContent,
  EducationEntry,
  ExperienceEntry,
  LanguageEntry,
  SkillEntry,
  CertificationEntry,
  ProjectEntry,
} from "@bara/shared-types";
import { CI_SECTION_VISIBILITY, VISIBILITY_LABELS } from "@/lib/cv-sections";
import { loadCvDraft, saveCvDraft } from "@/lib/cv-storage";
import {
  CV_TEMPLATES,
  DEFAULT_TEMPLATE_ID,
  getTemplate,
  type CvTemplateId,
} from "./templates";

const EMPTY_CONTENT: CvContent = {
  personalInfo: { firstName: "", lastName: "", email: "" },
  professionalSummary: "",
  experience: [],
  education: [],
  skills: [],
  languages: [],
  hobbies: [],
  certifications: [],
  projects: [],
  references: "",
};

const inputClass =
  "w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-stone-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";
const labelClass = "text-sm font-medium text-stone-700";

// Suggestions affichées pendant la saisie — l'utilisateur voit des noms de
// langues concrets plutôt qu'un champ vide, tout en gardant la liberté de
// taper un dialecte local absent de la liste.
const LANGUAGE_SUGGESTIONS = [
  "Français",
  "Anglais",
  "Dioula",
  "Baoulé",
  "Bété",
  "Sénoufo",
  "Agni",
  "Mooré",
  "Espagnol",
  "Arabe",
  "Portugais",
  "Chinois",
];

const LANGUAGE_LEVEL_LABELS: Record<LanguageEntry["level"], string> = {
  A1: "A1 — Débutant",
  A2: "A2 — Élémentaire",
  B1: "B1 — Intermédiaire",
  B2: "B2 — Intermédiaire avancé",
  C1: "C1 — Avancé",
  C2: "C2 — Courant",
  native: "Langue maternelle",
};

function newId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

function SectionHeader({
  title,
  visibility,
}: {
  title: string;
  visibility: "required" | "recommended" | "optional";
}) {
  const badgeStyle =
    visibility === "required"
      ? "bg-brand-light text-brand-dark"
      : visibility === "recommended"
        ? "bg-accent-light text-accent"
        : "bg-stone-100 text-stone-500";
  return (
    <div className="flex items-center gap-2.5">
      <h2 className="font-display text-lg font-bold">{title}</h2>
      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeStyle}`}>
        {VISIBILITY_LABELS[visibility]}
      </span>
    </div>
  );
}

function EntryCard({
  onRemove,
  children,
}: {
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative rounded-xl border border-stone-200 bg-stone-50 p-4">
      <button
        type="button"
        onClick={onRemove}
        aria-label="Supprimer cette entrée"
        className="absolute right-3 top-3 text-stone-400 hover:text-red-600"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      <div className="grid gap-3 pr-8 sm:grid-cols-2">{children}</div>
    </div>
  );
}

export function CvEditor() {
  const [title, setTitle] = useState("Mon CV");
  const [content, setContent] = useState<CvContent>(EMPTY_CONTENT);
  const [templateId, setTemplateId] = useState<CvTemplateId>(DEFAULT_TEMPLATE_ID);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const draft = loadCvDraft();
    if (draft) {
      setTitle(draft.title);
      setContent(draft.content);
      setTemplateId(getTemplate(draft.templateId).id);
    }
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timeout = setTimeout(() => {
      saveCvDraft(title, content, templateId);
      setSavedAt(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
    }, 600);
    return () => clearTimeout(timeout);
  }, [title, content, templateId]);

  function updatePersonal<K extends keyof CvContent["personalInfo"]>(
    key: K,
    value: CvContent["personalInfo"][K]
  ) {
    setContent((prev) => ({ ...prev, personalInfo: { ...prev.personalInfo, [key]: value } }));
  }

  function handlePhotoChange(file: File | null) {
    if (!file) return;
    // Redimensionne et compresse la photo avant stockage : une image en pleine
    // résolution encodée en data URL dépasse les limites du navigateur
    // (ERR_INVALID_URL sur les gros data URLs) et sature le localStorage.
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const MAX_SIZE = 512;
        const scale = Math.min(1, MAX_SIZE / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        updatePersonal("photoUrl", canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  function addExperience() {
    const entry: ExperienceEntry = {
      id: newId(),
      company: "",
      position: "",
      startDate: "",
    };
    setContent((prev) => ({ ...prev, experience: [...prev.experience, entry] }));
  }
  function updateExperience(id: string, patch: Partial<ExperienceEntry>) {
    setContent((prev) => ({
      ...prev,
      experience: prev.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  }
  function removeExperience(id: string) {
    setContent((prev) => ({ ...prev, experience: prev.experience.filter((e) => e.id !== id) }));
  }

  function addEducation() {
    const entry: EducationEntry = { id: newId(), school: "", degree: "", startDate: "" };
    setContent((prev) => ({ ...prev, education: [...prev.education, entry] }));
  }
  function updateEducation(id: string, patch: Partial<EducationEntry>) {
    setContent((prev) => ({
      ...prev,
      education: prev.education.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  }
  function removeEducation(id: string) {
    setContent((prev) => ({ ...prev, education: prev.education.filter((e) => e.id !== id) }));
  }

  function addSkill() {
    const entry: SkillEntry = { id: newId(), name: "" };
    setContent((prev) => ({ ...prev, skills: [...prev.skills, entry] }));
  }
  function updateSkill(id: string, patch: Partial<SkillEntry>) {
    setContent((prev) => ({
      ...prev,
      skills: prev.skills.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }
  function removeSkill(id: string) {
    setContent((prev) => ({ ...prev, skills: prev.skills.filter((s) => s.id !== id) }));
  }

  function addLanguage() {
    const entry: LanguageEntry = { id: newId(), name: "", level: "B1" };
    setContent((prev) => ({ ...prev, languages: [...prev.languages, entry] }));
  }
  function updateLanguage(id: string, patch: Partial<LanguageEntry>) {
    setContent((prev) => ({
      ...prev,
      languages: prev.languages.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    }));
  }
  function removeLanguage(id: string) {
    setContent((prev) => ({ ...prev, languages: prev.languages.filter((l) => l.id !== id) }));
  }

  function addCertification() {
    const entry: CertificationEntry = { id: newId(), name: "" };
    setContent((prev) => ({
      ...prev,
      certifications: [...(prev.certifications ?? []), entry],
    }));
  }
  function updateCertification(id: string, patch: Partial<CertificationEntry>) {
    setContent((prev) => ({
      ...prev,
      certifications: (prev.certifications ?? []).map((c) =>
        c.id === id ? { ...c, ...patch } : c
      ),
    }));
  }
  function removeCertification(id: string) {
    setContent((prev) => ({
      ...prev,
      certifications: (prev.certifications ?? []).filter((c) => c.id !== id),
    }));
  }

  function addHobby() {
    setContent((prev) => ({ ...prev, hobbies: [...(prev.hobbies ?? []), ""] }));
  }
  function updateHobby(index: number, value: string) {
    setContent((prev) => ({
      ...prev,
      hobbies: (prev.hobbies ?? []).map((h, i) => (i === index ? value : h)),
    }));
  }
  function removeHobby(index: number) {
    setContent((prev) => ({
      ...prev,
      hobbies: (prev.hobbies ?? []).filter((_, i) => i !== index),
    }));
  }

  function addProject() {
    const entry: ProjectEntry = { id: newId(), name: "" };
    setContent((prev) => ({ ...prev, projects: [...(prev.projects ?? []), entry] }));
  }
  function updateProject(id: string, patch: Partial<ProjectEntry>) {
    setContent((prev) => ({
      ...prev,
      projects: (prev.projects ?? []).map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  }
  function removeProject(id: string) {
    setContent((prev) => ({
      ...prev,
      projects: (prev.projects ?? []).filter((p) => p.id !== id),
    }));
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-10">
        <div className="flex items-center justify-between gap-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Titre du CV"
            className="font-display flex-1 rounded-lg border border-transparent bg-transparent px-1 text-xl font-bold focus:border-stone-300 focus:bg-white focus:outline-none"
          />
          {savedAt && (
            <span className="flex shrink-0 items-center gap-1.5 text-xs text-stone-500">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
              Enregistré {savedAt}
            </span>
          )}
        </div>

        {/* --------------------------------------------- INFOS PERSONNELLES */}
        <section className="space-y-4">
          <SectionHeader title="Informations personnelles" visibility={CI_SECTION_VISIBILITY.photo} />

          <div className="flex items-center gap-4">
            <label className="flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center rounded-full border border-dashed border-stone-300 bg-stone-50 text-stone-400 hover:border-brand hover:text-brand">
              {content.personalInfo.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={content.personalInfo.photoUrl}
                  alt="Photo de profil"
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <Upload className="h-5 w-5" aria-hidden />
              )}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => handlePhotoChange(e.target.files?.[0] ?? null)}
              />
            </label>
            <p className="text-xs leading-relaxed text-stone-500">
              Photo professionnelle — fortement attendue en Côte d&apos;Ivoire.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Prénom</label>
              <input
                className={inputClass}
                value={content.personalInfo.firstName}
                onChange={(e) => updatePersonal("firstName", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Nom</label>
              <input
                className={inputClass}
                value={content.personalInfo.lastName}
                onChange={(e) => updatePersonal("lastName", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className={labelClass}>Titre professionnel</label>
              <input
                placeholder="ex : Graphiste & illustrateur"
                className={inputClass}
                value={content.personalInfo.jobTitle ?? ""}
                onChange={(e) => updatePersonal("jobTitle", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Email</label>
              <input
                type="email"
                className={inputClass}
                value={content.personalInfo.email}
                onChange={(e) => updatePersonal("email", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Téléphone</label>
              <input
                className={inputClass}
                value={content.personalInfo.phone ?? ""}
                onChange={(e) => updatePersonal("phone", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className={labelClass}>Ville</label>
              <input
                placeholder="ex : Abidjan, Cocody"
                className={inputClass}
                value={content.personalInfo.city ?? ""}
                onChange={(e) => updatePersonal("city", e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* ------------------------------------------------- SITUATION CIVILE */}
        <section className="space-y-4">
          <SectionHeader
            title="Situation civile"
            visibility={CI_SECTION_VISIBILITY.civilStatus}
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Date de naissance</label>
              <input
                type="date"
                className={inputClass}
                value={content.personalInfo.dateOfBirth ?? ""}
                onChange={(e) => updatePersonal("dateOfBirth", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Nationalité</label>
              <input
                className={inputClass}
                value={content.personalInfo.nationality ?? ""}
                onChange={(e) => updatePersonal("nationality", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Situation familiale</label>
              <input
                placeholder="ex : Célibataire"
                className={inputClass}
                value={content.personalInfo.maritalStatus ?? ""}
                onChange={(e) => updatePersonal("maritalStatus", e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* --------------------------------------------- RÉSUMÉ PROFESSIONNEL */}
        <section className="space-y-4">
          <SectionHeader
            title="Résumé professionnel"
            visibility={CI_SECTION_VISIBILITY.professionalSummary}
          />
          <textarea
            rows={3}
            placeholder="En 2-3 phrases, qui es-tu et que sais-tu faire ?"
            className={inputClass}
            value={content.professionalSummary ?? ""}
            onChange={(e) => setContent((prev) => ({ ...prev, professionalSummary: e.target.value }))}
          />
        </section>

        {/* ------------------------------------------------------- EXPÉRIENCE */}
        <section className="space-y-4">
          <SectionHeader title="Expérience" visibility={CI_SECTION_VISIBILITY.experience} />
          <div className="space-y-3">
            {content.experience.map((exp) => (
              <EntryCard key={exp.id} onRemove={() => removeExperience(exp.id)}>
                <input
                  placeholder="Poste"
                  className={inputClass}
                  value={exp.position}
                  onChange={(e) => updateExperience(exp.id, { position: e.target.value })}
                />
                <input
                  placeholder="Entreprise"
                  className={inputClass}
                  value={exp.company}
                  onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                />
                <input
                  placeholder="Date de début (ex : 2023)"
                  className={inputClass}
                  value={exp.startDate}
                  onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                />
                <input
                  placeholder="Date de fin (vide = poste actuel)"
                  className={inputClass}
                  value={exp.endDate ?? ""}
                  onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                />
                <textarea
                  placeholder="Description des missions"
                  rows={2}
                  className={`${inputClass} sm:col-span-2`}
                  value={exp.description ?? ""}
                  onChange={(e) => updateExperience(exp.id, { description: e.target.value })}
                />
              </EntryCard>
            ))}
          </div>
          <button
            type="button"
            onClick={addExperience}
            className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50"
          >
            <Plus className="h-4 w-4" aria-hidden /> Ajouter une expérience
          </button>
        </section>

        {/* --------------------------------------------------------- FORMATION */}
        <section className="space-y-4">
          <SectionHeader title="Formation" visibility={CI_SECTION_VISIBILITY.education} />
          <div className="space-y-3">
            {content.education.map((edu) => (
              <EntryCard key={edu.id} onRemove={() => removeEducation(edu.id)}>
                <input
                  placeholder="Diplôme"
                  className={inputClass}
                  value={edu.degree}
                  onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                />
                <input
                  placeholder="École / Université"
                  className={inputClass}
                  value={edu.school}
                  onChange={(e) => updateEducation(edu.id, { school: e.target.value })}
                />
                <input
                  placeholder="Filière"
                  className={inputClass}
                  value={edu.fieldOfStudy ?? ""}
                  onChange={(e) => updateEducation(edu.id, { fieldOfStudy: e.target.value })}
                />
                <input
                  placeholder="Année d'obtention"
                  className={inputClass}
                  value={edu.endDate ?? ""}
                  onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })}
                />
              </EntryCard>
            ))}
          </div>
          <button
            type="button"
            onClick={addEducation}
            className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50"
          >
            <Plus className="h-4 w-4" aria-hidden /> Ajouter une formation
          </button>
        </section>

        {/* ------------------------------------------------------ COMPÉTENCES */}
        <section className="space-y-4">
          <SectionHeader title="Compétences" visibility={CI_SECTION_VISIBILITY.skills} />
          <div className="flex flex-wrap gap-2">
            {content.skills.map((skill) => (
              <div key={skill.id} className="flex items-center gap-1.5 rounded-full border border-stone-300 bg-stone-50 py-1 pl-3 pr-1.5">
                <input
                  placeholder="Compétence"
                  className="w-32 bg-transparent text-sm focus:outline-none"
                  value={skill.name}
                  onChange={(e) => updateSkill(skill.id, { name: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => removeSkill(skill.id)}
                  aria-label="Supprimer cette compétence"
                  className="text-stone-400 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addSkill}
            className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50"
          >
            <Plus className="h-4 w-4" aria-hidden /> Ajouter une compétence
          </button>
        </section>

        {/* ----------------------------------------------------------- LANGUES */}
        <section className="space-y-4">
          <SectionHeader title="Langues" visibility={CI_SECTION_VISIBILITY.languages} />
          <datalist id="language-suggestions">
            {LANGUAGE_SUGGESTIONS.map((lang) => (
              <option key={lang} value={lang} />
            ))}
          </datalist>
          <div className="space-y-2">
            {content.languages.map((lang) => (
              <div key={lang.id} className="flex items-center gap-2">
                <input
                  list="language-suggestions"
                  placeholder="ex : Français"
                  className={`${inputClass} flex-1`}
                  value={lang.name}
                  onChange={(e) => updateLanguage(lang.id, { name: e.target.value })}
                />
                <select
                  className={inputClass}
                  value={lang.level}
                  onChange={(e) =>
                    updateLanguage(lang.id, { level: e.target.value as LanguageEntry["level"] })
                  }
                >
                  {Object.entries(LANGUAGE_LEVEL_LABELS).map(([level, label]) => (
                    <option key={level} value={level}>
                      {label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeLanguage(lang.id)}
                  aria-label="Supprimer cette langue"
                  className="text-stone-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addLanguage}
            className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50"
          >
            <Plus className="h-4 w-4" aria-hidden /> Ajouter une langue
          </button>
        </section>

        {/* ------------------------------------------------------ CERTIFICATIONS */}
        <section className="space-y-4">
          <SectionHeader
            title="Certifications"
            visibility={CI_SECTION_VISIBILITY.certifications}
          />
          <div className="space-y-3">
            {(content.certifications ?? []).map((cert) => (
              <EntryCard key={cert.id} onRemove={() => removeCertification(cert.id)}>
                <input
                  placeholder="Nom de la certification"
                  className={inputClass}
                  value={cert.name}
                  onChange={(e) => updateCertification(cert.id, { name: e.target.value })}
                />
                <input
                  placeholder="Organisme"
                  className={inputClass}
                  value={cert.issuer ?? ""}
                  onChange={(e) => updateCertification(cert.id, { issuer: e.target.value })}
                />
              </EntryCard>
            ))}
          </div>
          <button
            type="button"
            onClick={addCertification}
            className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50"
          >
            <Plus className="h-4 w-4" aria-hidden /> Ajouter une certification
          </button>
        </section>

        {/* ------------------------------------------------------------ PROJETS */}
        <section className="space-y-4">
          <SectionHeader title="Projets" visibility={CI_SECTION_VISIBILITY.projects} />
          <div className="space-y-3">
            {(content.projects ?? []).map((project) => (
              <EntryCard key={project.id} onRemove={() => removeProject(project.id)}>
                <input
                  placeholder="Nom du projet"
                  className={inputClass}
                  value={project.name}
                  onChange={(e) => updateProject(project.id, { name: e.target.value })}
                />
                <input
                  placeholder="Description courte"
                  className={inputClass}
                  value={project.description ?? ""}
                  onChange={(e) => updateProject(project.id, { description: e.target.value })}
                />
              </EntryCard>
            ))}
          </div>
          <button
            type="button"
            onClick={addProject}
            className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50"
          >
            <Plus className="h-4 w-4" aria-hidden /> Ajouter un projet
          </button>
        </section>

        {/* ------------------------------------------------------------ LOISIRS */}
        <section className="space-y-4">
          <SectionHeader title="Loisirs" visibility={CI_SECTION_VISIBILITY.hobbies} />
          <div className="flex flex-wrap gap-2">
            {(content.hobbies ?? []).map((hobby, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 rounded-full border border-stone-300 bg-stone-50 py-1 pl-3 pr-1.5"
              >
                <input
                  placeholder="Loisir"
                  className="w-32 bg-transparent text-sm focus:outline-none"
                  value={hobby}
                  onChange={(e) => updateHobby(i, e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeHobby(i)}
                  aria-label="Supprimer ce loisir"
                  className="text-stone-400 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addHobby}
            className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50"
          >
            <Plus className="h-4 w-4" aria-hidden /> Ajouter un loisir
          </button>
        </section>

        {/* --------------------------------------------------------- RÉFÉRENCES */}
        <section className="space-y-4">
          <SectionHeader title="Références" visibility={CI_SECTION_VISIBILITY.references} />
          <textarea
            rows={2}
            placeholder="Disponibles sur demande, ou coordonnées d'un ancien employeur"
            className={inputClass}
            value={content.references ?? ""}
            onChange={(e) => setContent((prev) => ({ ...prev, references: e.target.value }))}
          />
        </section>

        {/* -------------------------------------------------- ENREGISTRER / PUBLIER */}
        <div className="cv-editor-actions rounded-2xl border border-stone-200 bg-stone-50 p-5">
          <h2 className="font-display text-lg font-bold">Enregistrer et publier</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
            Ton CV est déjà enregistré automatiquement sur cet appareil au fur
            et à mesure. Tu peux aussi le télécharger, ou le publier pour que
            les recruteurs te trouvent sur Bara.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                saveCvDraft(title, content, templateId);
                setSavedAt(
                  new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
                );
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-100"
            >
              <Save className="h-4 w-4" aria-hidden /> Enregistrer maintenant
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-100"
            >
              <Download className="h-4 w-4" aria-hidden /> Télécharger en PDF
            </button>
            <Link
              href="/inscription"
              className="btn-pop ml-auto inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white"
            >
              Publier mon profil <span aria-hidden>→</span>
            </Link>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-stone-500">
            Publier ton profil rend ton CV visible par les recruteurs sur
            Bara — ça nécessite un compte, pour que ce soit bien toi qui gères
            tes candidatures.
          </p>
        </div>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="mb-4 flex flex-wrap gap-2 print:hidden">
          {CV_TEMPLATES.map((template) => {
            const selected = template.id === templateId;
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => setTemplateId(template.id)}
                aria-pressed={selected}
                className={`flex flex-col items-start rounded-xl border px-4 py-2.5 text-left transition-colors ${
                  selected
                    ? "border-brand bg-brand-light"
                    : "border-stone-200 bg-white hover:border-stone-300"
                }`}
              >
                <span className="text-sm font-semibold">{template.label}</span>
                <span className="text-xs text-stone-500">{template.audience}</span>
              </button>
            );
          })}
        </div>
        <div id="cv-print-area">
          {(() => {
            const { Component } = getTemplate(templateId);
            return <Component content={content} />;
          })()}
        </div>
      </div>
    </div>
  );
}
