"use client";

// Formulaire d'offre — un seul composant pour la CRÉATION (POST /job-offers) et
// la MODIFICATION (PATCH /job-offers/:id), sur le modèle éprouvé de CvEditor.
// Page unique sectionnée (décision D1) : Informations / Localisation / Budget /
// Période.
//
// Règles de contrat vérifiées sur l'API réelle et encodées ici :
//  - le ValidationPipe est en `forbidNonWhitelisted` : on n'envoie QUE des champs
//    éditables (jamais id, slug, status, recruiterId, createdAt, updatedAt) ;
//  - les budgets doivent être des NOMBRES (une chaîne "25000" est rejetée en 400) ;
//  - `null` efface une valeur optionnelle, "" la remplacerait par une chaîne vide ;
//  - une date déjà enregistrée n'est PAS effaçable côté backend → l'UI interdit
//    de la vider plutôt que de simuler une suppression réussie (décision D4).
//
// La création ne publie jamais : le backend force `status: 'draft'` et la
// publication reste une action distincte (P0-5.4).
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle, Save, Lock, SearchX, Info, RefreshCw } from "lucide-react";
import { METIER_CATEGORIES, getMetiersByCategorie } from "@bara/shared-types";
import {
  createOffer,
  updateOffer,
  fetchMyOffer,
  ApiError,
  type JobOfferApi,
  type JobOfferInput,
} from "@/lib/api";
import { JOB_TYPE_LABELS } from "@/lib/offer-format";
import { Button, buttonVariants, Input, Textarea, Select, Label } from "@/components/ui";
import { EmptyState } from "@/components/patterns";
import { offerErrorMessage } from "./offer-detail";

// Bornes strictement alignées sur CreateJobOfferDto / UpdateJobOfferDto.
const LIMITS = {
  title: { min: 3, max: 150 },
  description: { min: 1, max: 5000 },
  city: { max: 80 },
  area: { max: 80 },
  budgetLabel: { max: 60 },
} as const;

interface FormState {
  title: string;
  description: string;
  metierSlug: string;
  type: string;
  city: string;
  area: string;
  budgetMin: string;
  budgetMax: string;
  budgetLabel: string;
  startDate: string;
  endDate: string;
}

type FieldErrors = Partial<Record<keyof FormState, string>>;

const EMPTY: FormState = {
  title: "",
  description: "",
  metierSlug: "",
  type: "",
  city: "",
  area: "",
  budgetMin: "",
  budgetMax: "",
  budgetLabel: "",
  startDate: "",
  endDate: "",
};

// Les dates arrivent en ISO complet ("2026-11-05T00:00:00.000Z") ; <input type="date">
// attend "AAAA-MM-JJ". On tranche la chaîne au lieu de passer par `new Date()`,
// qui décalerait la date d'un jour selon le fuseau du navigateur.
const isoToDateInput = (iso: string | null): string => (iso ? iso.slice(0, 10) : "");

function fromOffer(o: JobOfferApi): FormState {
  return {
    title: o.title,
    description: o.description,
    metierSlug: o.metierSlug,
    type: o.type,
    city: o.city,
    area: o.area ?? "",
    budgetMin: o.budgetMin === null ? "" : String(o.budgetMin),
    budgetMax: o.budgetMax === null ? "" : String(o.budgetMax),
    budgetLabel: o.budgetLabel ?? "",
    startDate: isoToDateInput(o.startDate),
    endDate: isoToDateInput(o.endDate),
  };
}

const isPositiveInteger = (v: string) => /^\d+$/.test(v);

function validate(form: FormState, initial: FormState | null): FieldErrors {
  const e: FieldErrors = {};
  const title = form.title.trim();
  if (!title) e.title = "Le titre est obligatoire.";
  else if (title.length < LIMITS.title.min) e.title = "Le titre doit faire au moins 3 caractères.";
  else if (title.length > LIMITS.title.max) e.title = "Le titre ne peut pas dépasser 150 caractères.";

  const description = form.description.trim();
  if (!description) e.description = "La description est obligatoire.";
  else if (description.length > LIMITS.description.max)
    e.description = "La description ne peut pas dépasser 5 000 caractères.";

  if (!form.metierSlug) e.metierSlug = "Choisissez un métier.";
  if (!form.type) e.type = "Choisissez un type de mission.";

  const city = form.city.trim();
  if (!city) e.city = "La ville est obligatoire.";
  else if (city.length > LIMITS.city.max) e.city = "La ville ne peut pas dépasser 80 caractères.";

  if (form.area.trim().length > LIMITS.area.max)
    e.area = "Le quartier ne peut pas dépasser 80 caractères.";
  if (form.budgetLabel.trim().length > LIMITS.budgetLabel.max)
    e.budgetLabel = "Cette indication ne peut pas dépasser 60 caractères.";

  const min = form.budgetMin.trim();
  const max = form.budgetMax.trim();
  if (min && !isPositiveInteger(min))
    e.budgetMin = "Indiquez un montant entier en FCFA, sans espace ni décimale.";
  if (max && !isPositiveInteger(max))
    e.budgetMax = "Indiquez un montant entier en FCFA, sans espace ni décimale.";
  // Cohérence non vérifiée par le backend : garde-fou purement UX.
  if (!e.budgetMin && !e.budgetMax && min && max && Number(max) < Number(min))
    e.budgetMax = "Le budget maximum doit être supérieur ou égal au minimum.";

  if (form.startDate && form.endDate && form.endDate < form.startDate)
    e.endDate = "La date de fin doit être postérieure à la date de début.";

  // Décision D4 : une date déjà enregistrée ne peut pas être retirée (le backend
  // ignore un effacement). On bloque plutôt que d'annoncer un faux succès.
  if (initial?.startDate && !form.startDate)
    e.startDate = "Cette date ne peut pas être retirée pour le moment ; modifiez-la plutôt.";
  if (initial?.endDate && !form.endDate)
    e.endDate = "Cette date ne peut pas être retirée pour le moment ; modifiez-la plutôt.";

  return e;
}

// --- Construction du corps envoyé ------------------------------------------

// Création : on n'envoie que les champs réellement renseignés. Aucun "" ni null
// (rien à effacer sur une offre qui n'existe pas encore).
function buildCreateInput(form: FormState): JobOfferInput {
  const input: JobOfferInput = {
    title: form.title.trim(),
    description: form.description.trim(),
    metierSlug: form.metierSlug,
    type: form.type,
    city: form.city.trim(),
  };
  if (form.area.trim()) input.area = form.area.trim();
  if (form.budgetMin.trim()) input.budgetMin = Number(form.budgetMin.trim());
  if (form.budgetMax.trim()) input.budgetMax = Number(form.budgetMax.trim());
  if (form.budgetLabel.trim()) input.budgetLabel = form.budgetLabel.trim();
  if (form.startDate) input.startDate = form.startDate;
  if (form.endDate) input.endDate = form.endDate;
  return input;
}

// undefined = champ inchangé, à NE PAS envoyer (le PATCH doit rester partiel).
// null = champ vidé volontairement → efface la valeur en base.
function diffText(current: string, initial: string): string | null | undefined {
  const c = current.trim();
  const i = initial.trim();
  if (c === i) return undefined;
  return c === "" ? null : c;
}

function diffNumber(current: string, initial: string): number | null | undefined {
  const c = current.trim();
  const i = initial.trim();
  if (c === i) return undefined;
  return c === "" ? null : Number(c);
}

function buildPatchInput(form: FormState, initial: FormState): Partial<JobOfferInput> {
  const patch: Partial<JobOfferInput> = {};

  // Champs requis : jamais vidés (la validation l'interdit), envoyés si modifiés.
  if (form.title.trim() !== initial.title.trim()) patch.title = form.title.trim();
  if (form.description.trim() !== initial.description.trim())
    patch.description = form.description.trim();
  if (form.metierSlug !== initial.metierSlug) patch.metierSlug = form.metierSlug;
  if (form.type !== initial.type) patch.type = form.type;
  if (form.city.trim() !== initial.city.trim()) patch.city = form.city.trim();

  const area = diffText(form.area, initial.area);
  if (area !== undefined) patch.area = area;
  const budgetLabel = diffText(form.budgetLabel, initial.budgetLabel);
  if (budgetLabel !== undefined) patch.budgetLabel = budgetLabel;

  const budgetMin = diffNumber(form.budgetMin, initial.budgetMin);
  if (budgetMin !== undefined) patch.budgetMin = budgetMin;
  const budgetMax = diffNumber(form.budgetMax, initial.budgetMax);
  if (budgetMax !== undefined) patch.budgetMax = budgetMax;

  // Dates : jamais `null` (non effaçables côté backend). Une date seulement
  // ajoutée ou remplacée est envoyée ; un champ vidé est déjà bloqué en amont.
  if (form.startDate && form.startDate !== initial.startDate) patch.startDate = form.startDate;
  if (form.endDate && form.endDate !== initial.endDate) patch.endDate = form.endDate;

  return patch;
}

// --- Rendu ------------------------------------------------------------------

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="rounded-lg border border-border bg-surface p-5">
      <legend className="px-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </legend>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Field({
  id,
  label,
  error,
  hint,
  wide = false,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={wide ? "flex flex-col gap-1.5 sm:col-span-2" : "flex flex-col gap-1.5"}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && !error ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type Phase = "loading" | "ready" | "forbidden" | "notFound" | "loadError";

export function OfferForm({ offerId }: { offerId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(offerId);

  const [form, setForm] = useState<FormState>(EMPTY);
  // État de référence pour le diff du PATCH — null en création.
  const [initial, setInitial] = useState<FormState | null>(null);
  const [phase, setPhase] = useState<Phase>(isEdit ? "loading" : "ready");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!offerId) return;
    setPhase("loading");
    setLoadError(null);
    try {
      const state = fromOffer(await fetchMyOffer(offerId));
      setForm(state);
      setInitial(state);
      setPhase("ready");
    } catch (err) {
      const status = err instanceof ApiError ? err.status : -1;
      if (status === 403) setPhase("forbidden");
      else if (status === 404) setPhase("notFound");
      else {
        setLoadError(offerErrorMessage(err));
        setPhase("loadError");
      }
    }
  }, [offerId]);

  useEffect(() => {
    void load();
  }, [load]);

  const set = <K extends keyof FormState>(key: K, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  const metierGroups = useMemo(
    () =>
      METIER_CATEGORIES.map((cat) => ({ ...cat, metiers: getMetiersByCategorie(cat.slug) })).filter(
        (g) => g.metiers.length > 0,
      ),
    [],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    const found = validate(form, initial);
    if (Object.values(found).some(Boolean)) {
      setErrors(found);
      // Aucun appel réseau tant que la saisie est invalide.
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      if (offerId && initial) {
        const patch = buildPatchInput(form, initial);
        // Rien n'a changé : inutile d'appeler l'API, le résultat serait identique.
        if (Object.keys(patch).length > 0) await updateOffer(offerId, patch);
        router.push(`/recruteur/offres/${offerId}`);
      } else {
        const created = await createOffer(buildCreateInput(form));
        router.push(`/recruteur/offres/${created.id}?cree=1`);
      }
    } catch (err) {
      setSubmitError(offerErrorMessage(err));
      setSaving(false);
    }
  }

  if (phase === "loading") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
        <span className="sr-only">Chargement de l&apos;offre…</span>
      </div>
    );
  }

  if (phase === "forbidden" || phase === "notFound") {
    const denied = phase === "forbidden";
    return (
      <EmptyState
        icon={denied ? Lock : SearchX}
        title={
          denied
            ? "Cette offre ne vous appartient pas."
            : "Cette offre n'existe pas ou a été supprimée."
        }
        description="Vous ne pouvez modifier que les offres que vous avez publiées."
        action={
          <Link href="/recruteur/offres" className={buttonVariants({ variant: "outline" })}>
            Voir mes offres
          </Link>
        }
      />
    );
  }

  if (phase === "loadError") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-surface p-8 text-center">
        <AlertCircle className="h-8 w-8 text-danger" aria-hidden />
        <p className="text-sm text-muted-foreground">{loadError}</p>
        <Button variant="outline" onClick={() => void load()}>
          <RefreshCw className="h-4 w-4" aria-hidden /> Réessayer
        </Button>
      </div>
    );
  }

  const invalid = (key: keyof FormState) => (errors[key] ? true : undefined);
  const describedBy = (key: keyof FormState) => (errors[key] ? `${key}-error` : undefined);

  return (
    <section aria-labelledby="offre-form-title">
      <Link
        href={offerId ? `/recruteur/offres/${offerId}` : "/recruteur/offres"}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {offerId ? "Retour à l'offre" : "Retour à mes offres"}
      </Link>

      <h1
        id="offre-form-title"
        className="mt-4 text-2xl font-bold tracking-tight text-foreground"
      >
        {isEdit ? "Modifier l'offre" : "Publier une offre"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {isEdit
          ? "Vos modifications sont visibles immédiatement sur l'offre."
          : "L'offre est enregistrée en brouillon : vous la publierez ensuite quand elle sera prête."}
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-5">
        <Section title="Informations de l'offre">
          <Field id="title" label="Titre de l'offre" error={errors.title} wide>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              maxLength={LIMITS.title.max}
              placeholder="Ex. Serveur pour un événement à Cocody"
              aria-invalid={invalid("title")}
              aria-describedby={describedBy("title")}
            />
          </Field>

          <Field
            id="description"
            label="Description"
            error={errors.description}
            hint={`${form.description.length} / ${LIMITS.description.max} caractères`}
            wide
          >
            <Textarea
              id="description"
              rows={7}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              maxLength={LIMITS.description.max}
              placeholder="Décrivez la mission, les horaires, ce que vous attendez du candidat…"
              aria-invalid={invalid("description")}
              aria-describedby={describedBy("description")}
            />
          </Field>

          <Field id="metierSlug" label="Métier" error={errors.metierSlug}>
            <Select
              id="metierSlug"
              value={form.metierSlug}
              onChange={(e) => set("metierSlug", e.target.value)}
              aria-invalid={invalid("metierSlug")}
              aria-describedby={describedBy("metierSlug")}
            >
              <option value="">Choisir un métier…</option>
              {metierGroups.map((group) => (
                <optgroup key={group.slug} label={group.label}>
                  {group.metiers.map((m) => (
                    <option key={m.slug} value={m.slug}>
                      {m.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </Select>
          </Field>

          <Field id="type" label="Type de mission" error={errors.type}>
            <Select
              id="type"
              value={form.type}
              onChange={(e) => set("type", e.target.value)}
              aria-invalid={invalid("type")}
              aria-describedby={describedBy("type")}
            >
              <option value="">Choisir un type…</option>
              {Object.entries(JOB_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </Section>

        <Section title="Localisation">
          <Field id="city" label="Ville" error={errors.city}>
            <Input
              id="city"
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              maxLength={LIMITS.city.max}
              placeholder="Ex. Abidjan"
              aria-invalid={invalid("city")}
              aria-describedby={describedBy("city")}
            />
          </Field>

          <Field
            id="area"
            label="Quartier ou zone (facultatif)"
            error={errors.area}
            hint="Ex. Cocody, Yopougon, Plateau…"
          >
            <Input
              id="area"
              value={form.area}
              onChange={(e) => set("area", e.target.value)}
              maxLength={LIMITS.area.max}
              aria-invalid={invalid("area")}
              aria-describedby={describedBy("area")}
            />
          </Field>
        </Section>

        <Section title="Budget">
          <Field id="budgetMin" label="Budget minimum en FCFA (facultatif)" error={errors.budgetMin}>
            <Input
              id="budgetMin"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={form.budgetMin}
              onChange={(e) => set("budgetMin", e.target.value)}
              placeholder="25000"
              aria-invalid={invalid("budgetMin")}
              aria-describedby={describedBy("budgetMin")}
            />
          </Field>

          <Field id="budgetMax" label="Budget maximum en FCFA (facultatif)" error={errors.budgetMax}>
            <Input
              id="budgetMax"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={form.budgetMax}
              onChange={(e) => set("budgetMax", e.target.value)}
              placeholder="40000"
              aria-invalid={invalid("budgetMax")}
              aria-describedby={describedBy("budgetMax")}
            />
          </Field>

          <Field
            id="budgetLabel"
            label="Indication libre (facultatif)"
            error={errors.budgetLabel}
            hint="Ex. « à négocier », « 15 000 FCFA / semaine ». Si vous la remplissez, elle remplace la fourchette chiffrée à l'affichage."
            wide
          >
            <Input
              id="budgetLabel"
              value={form.budgetLabel}
              onChange={(e) => set("budgetLabel", e.target.value)}
              maxLength={LIMITS.budgetLabel.max}
              aria-invalid={invalid("budgetLabel")}
              aria-describedby={describedBy("budgetLabel")}
            />
          </Field>
        </Section>

        <Section title="Période">
          <Field
            id="startDate"
            label="Date de début (facultatif)"
            error={errors.startDate}
            hint={initial?.startDate ? "Cette date peut être modifiée, mais pas retirée." : undefined}
          >
            <Input
              id="startDate"
              type="date"
              value={form.startDate}
              onChange={(e) => set("startDate", e.target.value)}
              required={Boolean(initial?.startDate)}
              aria-invalid={invalid("startDate")}
              aria-describedby={describedBy("startDate")}
            />
          </Field>

          <Field
            id="endDate"
            label="Date de fin (facultatif)"
            error={errors.endDate}
            hint={initial?.endDate ? "Cette date peut être modifiée, mais pas retirée." : undefined}
          >
            <Input
              id="endDate"
              type="date"
              value={form.endDate}
              onChange={(e) => set("endDate", e.target.value)}
              required={Boolean(initial?.endDate)}
              aria-invalid={invalid("endDate")}
              aria-describedby={describedBy("endDate")}
            />
          </Field>

          {initial?.startDate || initial?.endDate ? (
            <p className="flex items-start gap-2 text-xs text-muted-foreground sm:col-span-2">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              Une date déjà enregistrée ne peut pas encore être retirée : le serveur ne prend pas en
              charge cette suppression. Vous pouvez en revanche la remplacer par une autre date.
            </p>
          ) : null}
        </Section>

        {submitError ? (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-md border border-danger/40 bg-danger-soft p-3 text-sm text-danger"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {submitError}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-end gap-3">
          <Link
            href={offerId ? `/recruteur/offres/${offerId}` : "/recruteur/offres"}
            className={buttonVariants({ variant: "outline" })}
          >
            Annuler
          </Link>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Save className="h-4 w-4" aria-hidden />
            )}
            {isEdit ? "Enregistrer les modifications" : "Enregistrer le brouillon"}
          </Button>
        </div>
      </form>
    </section>
  );
}
