// Structure du contenu d'un CV — héritée de cvmaker (CvGenerateur).
// Partagée entre apps/web (formulaire + preview) et la future API (validation, prompts IA).

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  linkedin?: string;
  portfolio?: string;
  photoUrl?: string;
  jobTitle?: string;
  dateOfBirth?: string;
  nationality?: string;
  maritalStatus?: string;
  gender?: string;
}

export interface ExperienceEntry {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string; // vide/undefined = poste actuel
  description?: string;
  achievements?: string[];
}

export interface EducationEntry {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface SkillEntry {
  id: string;
  name: string;
  level?: 1 | 2 | 3 | 4 | 5;
}

export interface LanguageEntry {
  id: string;
  name: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'native';
}

export interface CertificationEntry {
  id: string;
  name: string;
  issuer?: string;
  date?: string;
}

export interface ProjectEntry {
  id: string;
  name: string;
  description?: string;
  url?: string;
}

export interface CvContent {
  personalInfo: PersonalInfo;
  professionalSummary?: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: SkillEntry[];
  languages: LanguageEntry[];
  hobbies?: string[];
  certifications?: CertificationEntry[];
  projects?: ProjectEntry[];
  references?: string;
}
