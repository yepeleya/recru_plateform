"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  UploadCloud,
  User,
  Users,
  Building2,
  UserPlus,
  PencilLine,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react";
import {
  BUSINESS_SECTORS,
  type AccountType,
  type BusinessSector,
  type IdDocumentType,
} from "@bara/shared-types";
import { cn } from "@/components/ui";
import { registerAccount } from "@/lib/api";

// Étapes de la sidebar (maquette Stitch bara_inscription_tape_1..5). Les 4
// premières sont les étapes du formulaire (index 0..3) ; la 5e (Confirmation)
// correspond à l'écran de succès.
const STEPS: Array<{ label: string; icon: LucideIcon }> = [
  { label: "Type d'inscription", icon: UserPlus },
  { label: "Informations", icon: PencilLine },
  { label: "Vérification", icon: ShieldCheck },
  { label: "Récapitulatif", icon: ClipboardCheck },
  { label: "Confirmation", icon: CheckCircle2 },
];
const LAST_FORM_STEP = 3; // index de la dernière étape de formulaire (Récapitulatif)

const ACCOUNT_TYPES: Array<{
  value: AccountType;
  title: string;
  text: string;
  icon: LucideIcon;
}> = [
  {
    value: "candidat",
    title: "Je cherche un job",
    text: "Crée ton CV et publie ton profil pour être visible auprès des recruteurs.",
    icon: User,
  },
  {
    value: "recruteur-particulier",
    title: "Je recrute (particulier)",
    text: "Tu cherches quelqu'un pour un besoin ponctuel : ménage, chauffeur, nounou...",
    icon: Users,
  },
  {
    value: "recruteur-entreprise",
    title: "Je recrute (entreprise)",
    text: "Startup, boutique, supermarché... tu recrutes au nom d'une structure.",
    icon: Building2,
  },
];

const ID_DOCUMENT_LABELS: Record<IdDocumentType, string> = {
  cni: "Carte Nationale d'Identité",
  passeport: "Passeport",
  "permis-conduire": "Permis de conduire",
};

interface FormState {
  accountType: AccountType | null;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  city: string;
  firstName: string;
  lastName: string;
  companyName: string;
  sector: BusinessSector | "";
  representativeFirstName: string;
  representativeLastName: string;
  representativeRole: string;
  idDocumentType: IdDocumentType | "";
  idDocumentNumber: string;
  idFrontFile: File | null;
  idBackFile: File | null;
  rccmNumber: string;
  rccmFile: File | null;
  acceptTerms: boolean;
}

const INITIAL_STATE: FormState = {
  accountType: null,
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  city: "",
  firstName: "",
  lastName: "",
  companyName: "",
  sector: "",
  representativeFirstName: "",
  representativeLastName: "",
  representativeRole: "",
  idDocumentType: "",
  idDocumentNumber: "",
  idFrontFile: null,
  idBackFile: null,
  rccmNumber: "",
  rccmFile: null,
  acceptTerms: false,
};

const inputClass =
  "w-full rounded-md border border-input bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring";
const labelClass = "text-sm font-medium text-foreground";

export function SignupWizard() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isBusiness = form.accountType === "recruteur-entreprise";
  const needsBackSide = form.idDocumentType === "cni" || form.idDocumentType === "permis-conduire";
  const activeStep = success ? 4 : step;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validateStep(current: number): string | null {
    if (current === 0 && !form.accountType) {
      return "Choisis un profil pour continuer.";
    }
    if (current === 1) {
      if (isBusiness) {
        if (!form.companyName) return "Indique le nom de l'entreprise.";
        if (!form.sector) return "Choisis le secteur d'activité.";
        if (!form.representativeFirstName) return "Indique le prénom du représentant.";
        if (!form.representativeLastName) return "Indique le nom du représentant.";
        if (!form.representativeRole) return "Indique la fonction du représentant.";
      } else {
        if (!form.firstName) return "Indique ton prénom.";
        if (!form.lastName) return "Indique ton nom.";
      }
      if (!form.phone) return "Indique ton numéro de téléphone.";
      if (!form.city) return "Indique ta ville.";
      if (!form.email) return "Indique ton adresse email.";
      if (!form.password) return "Choisis un mot de passe.";
      if (form.password.length < 8) {
        return "Le mot de passe doit contenir au moins 8 caractères.";
      }
      if (form.password !== form.confirmPassword) {
        return "Les mots de passe ne correspondent pas.";
      }
    }
    if (current === 2) {
      if (!form.idDocumentType) {
        return "Choisis le type de ta pièce d'identité.";
      }
      if (!form.idDocumentNumber) {
        return "Indique le numéro de ta pièce d'identité.";
      }
      if (!form.idFrontFile) {
        return "Ajoute la photo recto de ta pièce d'identité.";
      }
      if (needsBackSide && !form.idBackFile) {
        return "Merci d'ajouter aussi la photo du verso pour ce type de document.";
      }
    }
    return null;
  }

  function goNext() {
    const validationError = validateStep(step);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, LAST_FORM_STEP));
  }

  function goBack() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit() {
    if (!form.acceptTerms) {
      setError("Tu dois accepter les conditions d'utilisation pour continuer.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const data = new FormData();
      data.set("accountType", form.accountType ?? "");
      data.set("email", form.email);
      data.set("password", form.password);
      data.set("phone", form.phone);
      data.set("city", form.city);

      if (isBusiness) {
        data.set("companyName", form.companyName);
        data.set("sector", form.sector);
        data.set("representativeFirstName", form.representativeFirstName);
        data.set("representativeLastName", form.representativeLastName);
        data.set("representativeRole", form.representativeRole);
        if (form.rccmNumber) data.set("rccmNumber", form.rccmNumber);
        if (form.rccmFile) data.set("rccmFile", form.rccmFile);
      } else {
        data.set("firstName", form.firstName);
        data.set("lastName", form.lastName);
      }

      data.set("idDocumentType", form.idDocumentType);
      data.set("idDocumentNumber", form.idDocumentNumber);
      if (form.idFrontFile) data.set("idFrontFile", form.idFrontFile);
      if (form.idBackFile) data.set("idBackFile", form.idBackFile);

      await registerAccount(data);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "La connexion a échoué. Vérifie ta connexion internet et réessaie.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
      {/* Sidebar étapes (desktop) */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-lg border border-border bg-surface p-5">
          <h2 className="font-display text-lg font-bold text-primary">Inscription Bara</h2>
          <p className="text-xs text-muted-foreground">Étape par étape</p>
          <nav className="mt-5 flex flex-col gap-1" aria-label="Étapes de l'inscription">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const done = i < activeStep;
              const current = i === activeStep;
              return (
                <div
                  key={s.label}
                  aria-current={current ? "step" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                    current
                      ? "bg-primary-soft font-semibold text-primary"
                      : done
                        ? "text-primary"
                        : "text-muted-foreground",
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden />
                  <span>{s.label}</span>
                </div>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Contenu */}
      <div>
        {/* Indicateur d'étapes (mobile) */}
        <ol className="mb-6 flex items-center gap-2 lg:hidden" aria-label="Progression">
          {STEPS.map((s, i) => (
            <li key={s.label} className="flex flex-1 items-center gap-2 last:flex-none">
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors",
                  i <= activeStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                {i < activeStep ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : i + 1}
              </span>
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className={cn("h-0.5 flex-1 rounded-full", i < activeStep ? "bg-primary" : "bg-border")}
                />
              )}
            </li>
          ))}
        </ol>

        {success ? (
          <div className="rounded-lg border border-border bg-surface p-8 text-center sm:p-10">
            <CheckCircle2 aria-hidden className="mx-auto h-14 w-14 text-success" />
            <h2 className="mt-4 font-display text-2xl font-bold text-foreground">
              Compte créé avec succès
            </h2>
            <p className="mx-auto mt-3 max-w-md leading-relaxed text-muted-foreground">
              Ton compte Bara est actif dès maintenant. Ta pièce d&apos;identité sera
              vérifiée par notre équipe, et tu recevras le badge{" "}
              <strong className="text-foreground">« Profil vérifié »</strong> une fois le
              contrôle terminé.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-surface p-6 sm:p-8">
            {/* STEP 0 : TYPE */}
            {step === 0 && (
              <div className="space-y-3">
                <h2 className="font-display text-xl font-bold text-foreground">Que souhaites-tu faire ?</h2>
                <p className="text-sm text-muted-foreground">On adapte ton inscription selon ton profil.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {ACCOUNT_TYPES.map(({ value, title, text, icon: Icon }) => {
                    const selected = form.accountType === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => update("accountType", value)}
                        aria-pressed={selected}
                        className={cn(
                          "flex flex-col items-start gap-2 rounded-lg border p-5 text-left transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          selected ? "border-primary bg-primary-soft" : "border-border bg-surface",
                        )}
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary">
                          <Icon aria-hidden className="h-5 w-5" />
                        </span>
                        <span className="font-semibold text-foreground">{title}</span>
                        <span className="text-xs leading-relaxed text-muted-foreground">{text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 1 : INFOS */}
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="font-display text-xl font-bold text-foreground">Parle-nous de toi</h2>

                {isBusiness ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Nom de l'entreprise" id="companyName" span2 value={form.companyName} onChange={(v) => update("companyName", v)} />
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className={labelClass} htmlFor="sector">Secteur d&apos;activité</label>
                      <select id="sector" className={inputClass} value={form.sector} onChange={(e) => update("sector", e.target.value as BusinessSector)}>
                        <option value="">Choisir un secteur</option>
                        {BUSINESS_SECTORS.map((sector) => (
                          <option key={sector} value={sector}>{sector}</option>
                        ))}
                      </select>
                    </div>
                    <Field label="Prénom du représentant" id="representativeFirstName" value={form.representativeFirstName} onChange={(v) => update("representativeFirstName", v)} />
                    <Field label="Nom du représentant" id="representativeLastName" value={form.representativeLastName} onChange={(v) => update("representativeLastName", v)} />
                    <Field label="Fonction du représentant" id="representativeRole" span2 placeholder="ex : Gérante, Responsable RH" value={form.representativeRole} onChange={(v) => update("representativeRole", v)} />
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Prénom" id="firstName" placeholder="Entrez votre prénom" value={form.firstName} onChange={(v) => update("firstName", v)} />
                    <Field label="Nom" id="lastName" placeholder="Entrez votre nom" value={form.lastName} onChange={(v) => update("lastName", v)} />
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Téléphone" id="phone" type="tel" placeholder="+225 07 00 00 00 00" value={form.phone} onChange={(v) => update("phone", v)} />
                  <Field label="Ville" id="city" placeholder="ex : Abidjan, Cocody" value={form.city} onChange={(v) => update("city", v)} />
                </div>

                <Field label="Adresse email" id="email" type="email" autoComplete="email" placeholder="votre@email.com" value={form.email} onChange={(v) => update("email", v)} />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className={labelClass} htmlFor="password">Mot de passe</label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        className={`${inputClass} pr-10`}
                        value={form.password}
                        onChange={(e) => update("password", e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                        aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">8 caractères minimum</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelClass} htmlFor="confirmPassword">Confirmer le mot de passe</label>
                    <input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className={inputClass}
                      value={form.confirmPassword}
                      onChange={(e) => update("confirmPassword", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 : IDENTITÉ */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="font-display text-xl font-bold text-foreground">Vérifie ton identité</h2>

                <div className="flex items-start gap-3 rounded-lg border border-success/20 bg-success-soft p-4">
                  <ShieldCheck aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  <p className="text-sm leading-relaxed text-success">
                    Tes documents sont stockés de façon sécurisée et privée. Ils servent
                    uniquement à confirmer ton identité et ne sont jamais visibles
                    publiquement sur ton profil.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className={labelClass} htmlFor="idDocumentType">
                      {isBusiness ? "Pièce d'identité du représentant" : "Type de pièce d'identité"}
                    </label>
                    <select id="idDocumentType" className={inputClass} value={form.idDocumentType} onChange={(e) => update("idDocumentType", e.target.value as IdDocumentType)}>
                      <option value="">Choisir un type</option>
                      {Object.entries(ID_DOCUMENT_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <Field label="Numéro du document" id="idDocumentNumber" value={form.idDocumentNumber} onChange={(v) => update("idDocumentNumber", v)} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FileField label="Photo recto" file={form.idFrontFile} onChange={(file) => update("idFrontFile", file)} />
                  <FileField label={needsBackSide ? "Photo verso" : "Photo verso (optionnel)"} file={form.idBackFile} onChange={(file) => update("idBackFile", file)} />
                </div>

                {isBusiness && (
                  <div className="rounded-lg border border-border bg-surface-2 p-5">
                    <p className="text-sm font-semibold text-foreground">Registre de commerce (RCCM) — optionnel</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      Fournir le RCCM permet d&apos;obtenir le badge « Entreprise vérifiée ».
                      Tu peux aussi l&apos;ajouter plus tard.
                    </p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <Field label="Numéro RCCM" id="rccmNumber" value={form.rccmNumber} onChange={(v) => update("rccmNumber", v)} />
                      <FileField label="Document RCCM" file={form.rccmFile} onChange={(file) => update("rccmFile", file)} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3 : RÉCAPITULATIF */}
            {step === 3 && (
              <div className="space-y-5">
                <h2 className="font-display text-xl font-bold text-foreground">Vérifie tes informations</h2>

                <dl className="grid gap-x-6 gap-y-3 rounded-lg border border-border bg-surface-2 p-5 text-sm sm:grid-cols-2">
                  <Recap label="Profil" value={ACCOUNT_TYPES.find((t) => t.value === form.accountType)?.title} />
                  <Recap label="Email" value={form.email} />
                  <Recap label="Nom" value={isBusiness ? form.companyName : `${form.firstName} ${form.lastName}`} />
                  <Recap label="Ville" value={form.city} />
                  <Recap label="Pièce d'identité" value={form.idDocumentType ? ID_DOCUMENT_LABELS[form.idDocumentType] : undefined} />
                </dl>

                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={form.acceptTerms}
                    onChange={(e) => update("acceptTerms", e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
                  />
                  <span className="text-sm text-muted-foreground">
                    J&apos;accepte les{" "}
                    <Link href="/conditions" className="font-medium text-primary hover:underline">conditions d&apos;utilisation</Link>{" "}
                    et la{" "}
                    <Link href="/confidentialite" className="font-medium text-primary hover:underline">politique de confidentialité</Link>.
                  </span>
                </label>

                <div className="flex items-start gap-3 rounded-lg border border-border bg-surface-2 p-4">
                  <Lock aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Ton compte est actif dès l&apos;inscription. Notre équipe vérifie
                    ensuite ta pièce d&apos;identité, sans que tu aies à attendre pour
                    utiliser Bara.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <p className="mt-5 rounded-md border border-danger/30 bg-danger-soft px-4 py-2.5 text-sm text-danger">
                {error}
              </p>
            )}

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden /> Retour
                </button>
              ) : (
                <span />
              )}

              {step < LAST_FORM_STEP ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Continuer <ChevronRight className="h-4 w-4" aria-hidden />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {loading ? "Création en cours…" : "Créer mon compte"}
                </button>
              )}
            </div>
          </div>
        )}

        {!success && (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link href="/connexion" className="font-medium text-primary hover:underline">
              Se connecter
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  id,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  span2 = false,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  span2?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", span2 && "sm:col-span-2")}>
      <label className={labelClass} htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={inputClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Recap({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}

function FileField({
  label,
  file,
  onChange,
}: {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className={labelClass}>{label}</span>
      <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-input bg-surface-2 px-3.5 py-2.5 text-sm text-muted-foreground hover:border-primary hover:bg-primary-soft">
        <UploadCloud className="h-4 w-4 shrink-0" aria-hidden />
        <span className="truncate">{file ? file.name : "Choisir un fichier"}</span>
        <input
          type="file"
          accept="image/*,.pdf"
          className="sr-only"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </label>
    </div>
  );
}
