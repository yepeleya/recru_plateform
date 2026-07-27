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
} from "lucide-react";
import {
  BUSINESS_SECTORS,
  type AccountType,
  type BusinessSector,
  type IdDocumentType,
} from "@bara/shared-types";
import { registerAccount } from "@/lib/api";

const STEP_LABELS = ["Profil", "Informations", "Identité", "Confirmation"] as const;

const ACCOUNT_TYPES: Array<{
  value: AccountType;
  title: string;
  text: string;
  icon: typeof User;
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
  "w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-stone-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";
const labelClass = "text-sm font-medium text-stone-700";

export function SignupWizard() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isBusiness = form.accountType === "recruteur-entreprise";
  const needsBackSide = form.idDocumentType === "cni" || form.idDocumentType === "permis-conduire";

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
    setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
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
          : "Impossible de contacter le serveur pour le moment."
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="animate-fade-up rounded-2xl border border-stone-200 bg-white p-8 text-center sm:p-10">
        <CheckCircle2 aria-hidden className="mx-auto h-14 w-14 text-emerald-500" />
        <h2 className="font-display mt-4 text-2xl font-bold">Compte créé !</h2>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-stone-600">
          Ton compte est actif dès maintenant. Notre équipe vérifie ta pièce
          d&apos;identité en arrière-plan — tu recevras un badge{" "}
          <strong>« Profil vérifié »</strong> une fois la validation faite,
          sans que ça bloque ton utilisation de Bara aujourd&apos;hui.
        </p>
        <Link
          href="/"
          className="btn-pop mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-semibold text-white"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-9">
      {/* ------------------------------------------------------ PROGRESS */}
      <ol className="flex items-center gap-2">
        {STEP_LABELS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <div className="flex flex-col items-center gap-1.5 text-center">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  i <= step
                    ? "bg-brand text-white"
                    : "bg-stone-100 text-stone-400"
                }`}
              >
                {i < step ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : i + 1}
              </span>
              <span
                className={`hidden text-xs font-medium sm:block ${
                  i <= step ? "text-ink" : "text-stone-400"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <span
                aria-hidden
                className={`h-0.5 flex-1 rounded-full transition-colors ${
                  i < step ? "bg-brand" : "bg-stone-100"
                }`}
              />
            )}
          </li>
        ))}
      </ol>

      <div className="mt-8">
        {/* -------------------------------------------------- STEP 0 : TYPE */}
        {step === 0 && (
          <div className="animate-fade-up space-y-3">
            <h2 className="font-display text-xl font-bold">Qui es-tu ?</h2>
            <p className="text-sm text-stone-600">
              On adapte ton inscription selon ton profil.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {ACCOUNT_TYPES.map(({ value, title, text, icon: Icon }) => {
                const selected = form.accountType === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => update("accountType", value)}
                    aria-pressed={selected}
                    className={`card-lift flex flex-col items-start gap-2 rounded-xl border p-5 text-left transition-colors ${
                      selected
                        ? "border-brand bg-brand-light"
                        : "border-stone-200 bg-white"
                    }`}
                  >
                    <Icon
                      aria-hidden
                      className={`h-6 w-6 ${selected ? "text-brand-dark" : "text-stone-400"}`}
                    />
                    <span className="font-semibold">{title}</span>
                    <span className="text-xs leading-relaxed text-stone-600">
                      {text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* --------------------------------------------- STEP 1 : INFOS */}
        {step === 1 && (
          <div className="animate-fade-up space-y-5">
            <h2 className="font-display text-xl font-bold">Tes informations</h2>

            {isBusiness ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className={labelClass} htmlFor="companyName">
                    Nom de l&apos;entreprise
                  </label>
                  <input
                    id="companyName"
                    className={inputClass}
                    value={form.companyName}
                    onChange={(e) => update("companyName", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className={labelClass} htmlFor="sector">
                    Secteur d&apos;activité
                  </label>
                  <select
                    id="sector"
                    className={inputClass}
                    value={form.sector}
                    onChange={(e) => update("sector", e.target.value as BusinessSector)}
                  >
                    <option value="">Choisir un secteur</option>
                    {BUSINESS_SECTORS.map((sector) => (
                      <option key={sector} value={sector}>
                        {sector}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass} htmlFor="representativeFirstName">
                    Prénom du représentant
                  </label>
                  <input
                    id="representativeFirstName"
                    className={inputClass}
                    value={form.representativeFirstName}
                    onChange={(e) => update("representativeFirstName", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass} htmlFor="representativeLastName">
                    Nom du représentant
                  </label>
                  <input
                    id="representativeLastName"
                    className={inputClass}
                    value={form.representativeLastName}
                    onChange={(e) => update("representativeLastName", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className={labelClass} htmlFor="representativeRole">
                    Fonction du représentant
                  </label>
                  <input
                    id="representativeRole"
                    placeholder="ex : Gérante, Responsable RH"
                    className={inputClass}
                    value={form.representativeRole}
                    onChange={(e) => update("representativeRole", e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass} htmlFor="firstName">
                    Prénom
                  </label>
                  <input
                    id="firstName"
                    className={inputClass}
                    value={form.firstName}
                    onChange={(e) => update("firstName", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass} htmlFor="lastName">
                    Nom
                  </label>
                  <input
                    id="lastName"
                    className={inputClass}
                    value={form.lastName}
                    onChange={(e) => update("lastName", e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass} htmlFor="phone">
                  Téléphone
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+225 07 00 00 00 00"
                  className={inputClass}
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass} htmlFor="city">
                  Ville
                </label>
                <input
                  id="city"
                  placeholder="ex : Abidjan, Cocody"
                  className={inputClass}
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass} htmlFor="email">
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={inputClass}
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass} htmlFor="password">
                  Mot de passe
                </label>
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    tabIndex={-1}
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-stone-400">8 caractères minimum</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass} htmlFor="confirmPassword">
                  Confirmer le mot de passe
                </label>
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

        {/* ------------------------------------------- STEP 2 : IDENTITÉ */}
        {step === 2 && (
          <div className="animate-fade-up space-y-5">
            <h2 className="font-display text-xl font-bold">
              Vérification d&apos;identité
            </h2>

            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <ShieldCheck aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <p className="text-sm leading-relaxed text-emerald-900">
                Tes documents sont stockés de façon sécurisée et privée. Ils
                servent uniquement à confirmer ton identité et ne sont
                jamais visibles publiquement sur ton profil.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass} htmlFor="idDocumentType">
                  {isBusiness ? "Pièce d'identité du représentant" : "Type de pièce d'identité"}
                </label>
                <select
                  id="idDocumentType"
                  className={inputClass}
                  value={form.idDocumentType}
                  onChange={(e) => update("idDocumentType", e.target.value as IdDocumentType)}
                >
                  <option value="">Choisir un type</option>
                  {Object.entries(ID_DOCUMENT_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass} htmlFor="idDocumentNumber">
                  Numéro du document
                </label>
                <input
                  id="idDocumentNumber"
                  className={inputClass}
                  value={form.idDocumentNumber}
                  onChange={(e) => update("idDocumentNumber", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FileField
                label="Photo recto"
                file={form.idFrontFile}
                onChange={(file) => update("idFrontFile", file)}
              />
              <FileField
                label={needsBackSide ? "Photo verso" : "Photo verso (optionnel)"}
                file={form.idBackFile}
                onChange={(file) => update("idBackFile", file)}
              />
            </div>

            {isBusiness && (
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-5">
                <p className="text-sm font-semibold">
                  Registre de commerce (RCCM) — optionnel
                </p>
                <p className="mt-1 text-xs leading-relaxed text-stone-600">
                  Fournir le RCCM permet d&apos;obtenir le badge « Entreprise
                  vérifiée ». Tu peux aussi l&apos;ajouter plus tard.
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className={labelClass} htmlFor="rccmNumber">
                      Numéro RCCM
                    </label>
                    <input
                      id="rccmNumber"
                      className={inputClass}
                      value={form.rccmNumber}
                      onChange={(e) => update("rccmNumber", e.target.value)}
                    />
                  </div>
                  <FileField
                    label="Document RCCM"
                    file={form.rccmFile}
                    onChange={(file) => update("rccmFile", file)}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* --------------------------------------------- STEP 3 : RECAP */}
        {step === 3 && (
          <div className="animate-fade-up space-y-5">
            <h2 className="font-display text-xl font-bold">Dernière étape</h2>

            <dl className="grid gap-x-6 gap-y-3 rounded-xl border border-stone-200 bg-stone-50 p-5 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-stone-500">Profil</dt>
                <dd className="font-medium">
                  {ACCOUNT_TYPES.find((t) => t.value === form.accountType)?.title}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500">Email</dt>
                <dd className="font-medium">{form.email}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Nom</dt>
                <dd className="font-medium">
                  {isBusiness
                    ? form.companyName
                    : `${form.firstName} ${form.lastName}`}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500">Ville</dt>
                <dd className="font-medium">{form.city}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Pièce d&apos;identité</dt>
                <dd className="font-medium">
                  {form.idDocumentType && ID_DOCUMENT_LABELS[form.idDocumentType]}
                </dd>
              </div>
            </dl>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={form.acceptTerms}
                onChange={(e) => update("acceptTerms", e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-brand"
              />
              <span className="text-sm text-stone-600">
                J&apos;accepte les{" "}
                <Link href="/conditions" className="font-medium text-brand hover:underline">
                  conditions d&apos;utilisation
                </Link>{" "}
                et la{" "}
                <Link href="/confidentialite" className="font-medium text-brand hover:underline">
                  politique de confidentialité
                </Link>
                .
              </span>
            </label>

            <div className="flex items-start gap-3 rounded-xl border border-stone-200 bg-white p-4">
              <Lock aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-stone-400" />
              <p className="text-xs leading-relaxed text-stone-500">
                Ton compte est actif immédiatement après inscription. La
                vérification de ta pièce d&apos;identité se fait ensuite en
                arrière-plan, sans bloquer ton accès à Bara.
              </p>
            </div>
          </div>
        )}

        {error && (
          <p className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
            {error}
          </p>
        )}

        {/* --------------------------------------------------- NAVIGATION */}
        <div className="mt-8 flex items-center justify-between">
          {step > 0 ? (
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden /> Retour
            </button>
          ) : (
            <span />
          )}

          {step < STEP_LABELS.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="btn-pop inline-flex items-center gap-1.5 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white"
            >
              Continuer <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="btn-pop inline-flex items-center gap-1.5 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Création en cours…" : "Créer mon compte"}
            </button>
          )}
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-stone-500">
        Déjà un compte ?{" "}
        <Link href="/connexion" className="font-medium text-brand hover:underline">
          Se connecter
        </Link>
      </p>
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
      <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-stone-300 bg-stone-50 px-3.5 py-2.5 text-sm text-stone-600 hover:border-brand hover:bg-brand-light">
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
