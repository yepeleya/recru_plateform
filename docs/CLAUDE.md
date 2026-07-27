# CLAUDE.md — Documentation interne officielle du projet Bara

> Ce document est la référence technique et produit du projet Bara. Il n'a pas vocation à être lu une seule fois : il doit être consulté à chaque décision d'architecture, de code, de design ou de produit. Toute décision qui contredit ce document doit soit être justifiée explicitement dans le code (commentaire ou ADR), soit entraîner une mise à jour de ce document.
>
> Bara est un produit indépendant. Il n'est pas un module de CVMaker et ne doit jamais être développé comme tel. CVMaker est consommé par Bara comme une capacité externe (génération de CV), jamais comme une dépendance architecturale.
>
> Ce fichier est l'assemblage des 8 parties (CLAUDE-PART-01 à 08). Source de vérité unique — mis à jour à chaque changement de convention ou de règle métier.

---

## PARTIE 1 — VISION, MISSION, CULTURE, WORKFLOW

### 1. Mission

Bara existe pour résoudre un problème précis et mesurable : en Côte d'Ivoire (et plus largement en Afrique de l'Ouest francophone), la mise en relation pour les petits jobs, missions ponctuelles et emplois saisonniers se fait aujourd'hui de manière informelle (groupes Facebook, bouche-à-oreille, annonces papier). Cette informalité produit trois défaillances : aucune base de profils réutilisable, aucune garantie transactionnelle, aucun filtrage qualitatif.

Bara répond par : une base de profils avec CV structuré et généré dans l'app, un système de messagerie et de mise en relation directe, et (à terme) un mécanisme de paiement séquestre.

La mission n'est **pas** de concurrencer LinkedIn ou les plateformes de recrutement CDI. Toute fonctionnalité proposée doit être évaluée à l'aune de cette mission : est-ce que ça sert la mise en relation rapide pour des missions courtes, ou est-ce qu'on dérive vers un ATS classique ? En cas de doute, ne pas construire tant qu'un signal utilisateur clair ne le justifie pas.

### 2. Vision

- **5 ans** : plateforme de référence en Côte d'Ivoire pour trouver rapidement de la main-d'œuvre ponctuelle ; base de profils vérifiée (pièce d'identité), searchable par compétence/ville/disponibilité ; partenariats enseignes locales ; volume de transactions justifiant l'escrow ; substitution progressive aux groupes Facebook.
- **10 ans** : infrastructure de travail ponctuel multi-pays, système de réputation bilatéral, extension vers verticales adjacentes seulement si le cœur de métier est saturé, éventuelle couche API partenaires.

La vision à 10 ans ne doit **jamais** justifier une complexité technique aujourd'hui. "Build for today, design for tomorrow."

### 3. Valeurs d'ingénierie

1. **Clarté avant élégance.**
2. **Sécurité non négociable** (pièces d'identité, argent à terme). Voir Partie 7.
3. **Frugalité technique** (coûts d'infra + bande passante mobile). Voir Partie 5.
4. **Décisions réversibles par défaut** ; les décisions à sens unique sont documentées (ADR).
5. **Le produit avant le code.**

### 4. Positionnement

Bara se distingue des groupes Facebook (profils structurés réutilisables), de LinkedIn/CDI (job ponctuel, cycle court), des plateformes freelance internationales (marché local, métiers manuels inclus), des agences d'intérim (mise en relation directe rapide sans intermédiaire).

### 5. Philosophie de collaboration avec Claude Code

Claude Code se comporte comme un ingénieur senior + product thinker : ne jamais coder avant d'avoir compris le problème ; **signaler les tensions, pas les cacher** ; ne jamais casser silencieusement l'existant (vérifier la non-régression sur auth, upload, design system) ; proposer et justifier plutôt que trancher silencieusement.

### 6. Workflow obligatoire avant toute nouvelle fonctionnalité

1. Analyser le besoin (reformuler en une phrase). 2. Identifier les impacts (DB, API, design system, SEO). 3. Proposer une architecture. 4. Attendre validation pour toute décision structurante. 5. Développer. 6. Écrire les tests (logique métier + sécurité). 7. Lint. 8. Typecheck. 9. Build complet. 10. Vérifier les performances. 11. Mettre à jour la documentation.

Pour un correctif de bug isolé, les étapes 1-3 peuvent être condensées, jamais supprimées.

---

## PARTIE 2 — ARCHITECTURE

### 1. Architecture globale — monorepo pnpm

```
bara/
├── apps/
│   ├── web/              # Next.js — frontend public + espace utilisateur
│   └── api/              # NestJS — backend, source unique de vérité métier
├── packages/
│   ├── shared-types/     # Types partagés frontend/backend
│   ├── ui/               # Design system partagé
│   └── config/           # ESLint, TSConfig, Tailwind partagés
├── docs/
│   ├── architecture-seo.md
│   ├── CLAUDE.md
│   └── adr/              # Architecture Decision Records
├── pnpm-workspace.yaml
└── package.json
```

### 2. Séparation frontend/backend

`apps/api` est la **seule source de vérité** pour la logique métier et les règles d'autorisation. `apps/web` ne duplique jamais une règle métier critique côté client. Une Server Action Next.js est un client fin qui appelle `apps/api`, jamais le lieu de la logique métier.

### 3. Domain Driven Design léger

Backend organisé par **domaine métier** (`auth`, `users`, `profiles`, `offers`, `messaging`, `cv`), chacun un module NestJS autonome. Un module n'importe jamais directement le repository Prisma d'un autre domaine — il passe par le service public. Pas de DDD académique (pas d'event sourcing) tant que le product-market fit n'est pas validé.

### 4. Clean Architecture ciblée

Indirection uniquement sur ce qui changera d'implémentation : `StorageProvider` (disque local privé → stockage objet S3 à terme), `NotificationProvider` (email/SMS). Prisma est utilisé directement dans les services (pas de couche repository additionnelle — sur-ingénierie à ce stade).

### 5. Organisation backend (`apps/api/src`)

```
main.ts, app.module.ts
config/env.validation.ts
common/{guards,decorators,filters,interceptors}/
modules/{auth,users,profiles,offers,messaging,storage,cv-bridge}/
prisma/{schema.prisma,prisma.module.ts}
```

Un module = un domaine métier. Pas de dossier `utils/` fourre-tout.

### 6. Organisation frontend (`apps/web/src`)

```
app/{(marketing),(auth),offres,profils,dashboard,sitemap.ts,robots.ts}
components/{ui,features}
lib/{api-client.ts,validations}
styles/
```

`components/ui` = design system sans logique métier ni appel réseau. `components/features` = composants liés à un domaine.

### 7. Scalabilité — phase actuelle

Dimensionner pour quelques dizaines de milliers d'utilisateurs (MySQL indexé + NestJS mono-instance). Ne pas anticiper sharding/microservices/broker. Documenter les points d'extension en ADR.

### 8. Gestion des dépendances

Avant installation : doc officielle à jour, fréquence de maintenance, alternatives déjà dans l'écosystème, compatibilité versions strictes, pas de dépendance transitive à risque, revue explicite si sécurité/auth/données personnelles. Aucune bibliothèque abandonnée/expérimentale dans un chemin critique (auth, paiement, upload).

---

## PARTIE 3 — FRONTEND

### 1. Server Components par défaut

Un composant ne devient `"use client"` que pour une raison nommable (état local, événement navigateur, hook, librairie qui l'exige). On n'isole `"use client"` que sur la zone interactive minimale, jamais remonté plus haut que nécessaire. Justification : frugalité de bundle pour la cible mobile ivoirienne.

### 2. RSC et Server Actions

Server Actions pour les mutations de formulaire, mais **jamais la logique métier** : elles valident la forme (zod partagé) et délèguent à `apps/api`. Toute mutation sensible revalide l'autorisation côté serveur.

### 3. Suspense et Streaming

Fallback = **skeleton** représentatif, jamais spinner générique. Streaming SSR pour le contenu au-dessus de la ligne de flottaison.

### 4. Optimistic UI

Avec parcimonie, uniquement actions à faible risque et forte fréquence (favori). Jamais sur identité, paiement, ou envoi de candidature.

### 5. TypeScript strict

`strict: true`, pas de `any` non justifié (`unknown` + narrowing). Types métier partagés dans `packages/shared-types`.

### 6. Tailwind

Classes utilitaires core uniquement. Valeurs de design **jamais** en dur (`bg-[#1a2b3c]`) — toujours via les tokens (couleurs sémantiques, espacements, typo).

### 7. shadcn/ui

Point de départ pour les composants d'interaction complexes (dropdown, dialog, combobox) copiés dans `packages/ui` et adaptés aux tokens. Pas de shadcn pour les composants simples spécifiques produit (carte de profil sur-mesure).

### 8. Animations

Framer Motion pour l'animation liée à l'état React (défaut). GSAP réservé aux timelines complexes / scroll-triggered marketing. Respect systématique de `prefers-reduced-motion`. Aucune animation ne retarde le contenu principal SSR/SSG.

### 9. Responsive mobile-first. 10. Dark mode via classe `html` avec persistance ; variante dark définie dès la création du token. 11. Design tokens définis une seule fois. 12. Ne pas sur-utiliser Framer Motion / Client Components / useEffect / shadcn quand une solution native suffit.

---

## PARTIE 4 — BACKEND, BASE DE DONNÉES, API

### 1. NestJS

Un controller ne contient jamais de logique métier : il valide (DTO), délègue au service, formate la réponse. Un service ne dépend jamais du controller d'un autre module — il passe par le service public exporté.

### 2. DTO et validation

DTO dédié par endpoint, décorateurs `class-validator` exhaustifs, `@ValidateIf` pour les champs conditionnels (candidat vs entreprise). **Chaque champ produit son propre message d'erreur, jamais un message groupé ambigu** (bug déjà rencontré et corrigé). `ValidationPipe` global : `whitelist: true` + `forbidNonWhitelisted: true`.

### 3. Auth et autorisation

- JWT access court (15 min) + **refresh token** longue durée en cookie **HttpOnly, Secure, SameSite=Strict**.
- Le refresh token est **stocké côté serveur** (table `RefreshToken` avec révocation) — pas de confiance aveugle dans un JWT refresh non révocable.
- RBAC : rôles de base `CANDIDATE`, `RECRUITER`, `ADMIN`. Guard explicite (`@Roles('ADMIN')` + `RolesGuard`) sur chaque route sensible.
- Compte suspendu / pièce rejetée bloqué au niveau du guard, pas seulement côté frontend.

### 4. Audit Logs

Toute action sensible (changement de rôle, suspension, validation/rejet de pièce, accès à un document privé) écrit dans `AuditLog` (acteur, action, cible, horodatage, IP). Lecture seule, admin uniquement.

### 5. Soft Delete

Entités à valeur d'historique/preuve (comptes, offres, candidatures, messages) : `deletedAt: DateTime?`. Filtrer `deletedAt: null` par défaut, encapsulé dans le service (pas répété partout).

### 6. Transactions

Toute opération multi-entités interdépendante dans un `$transaction` Prisma.

### 7. Redis

Rate limiting distribué / cache / sessions temps réel — introduit seulement quand l'instance unique ne suffit plus, documenté en ADR.

### 8. Conventions Prisma

PascalCase singulier (modèle), camelCase (colonnes), FK `<entité>Id`. Index explicite sur tout champ de `WHERE` fréquent. FK natives, `onDelete: Cascade` seulement pour dépendances strictes (jamais sur entités d'audit). Migrations nommées descriptivement, pas de modification destructive sans plan. Éviter N+1 (`include`/`select`), pagination par curseur, contraintes d'unicité au schéma (`@unique`).

### 9. Conventions API REST

Ressources au pluriel, jamais de verbe dans l'URL. Pagination `cursor`+`limit` (plafond serveur 50). Filtres en query params nommés. Recherche `q` dédié. Upload de fichiers sensibles sur endpoints distincts (limite taille, MIME réel, stockage privé). Format d'erreur uniforme `{ statusCode, message, error }` via exception filters, messages spécifiques par champ. Préfixe **`/v1/`** dès le départ sur toutes les routes.

---

## PARTIE 5 — PERFORMANCE, SEO, UX/UI, QUALITÉ

### 1-6. Performance

Lighthouse ≥ 95 (Perf/A11y/Best practices/SEO) sur chaque page publique indexable en prod. LCP < 2,5s (contenu principal en SSR/SSG), INP < 200ms, CLS < 0.1 (dimensions d'image déclarées, skeletons à hauteur exacte). Budget JS ~150 Ko gzip par page marketing publique. Lazy loading `next/dynamic` + skeleton, `next/image` (LCP en `priority`), polices via `next/font`. Cache à invalidation explicite, jamais sur donnée sensible à la fraîcheur. Minimiser l'hydration, streaming SSR.

### 7. SEO obligatoire

SSR/SSG systématique pour le contenu indexable. Un seul `<h1>`, hiérarchie Hn linéaire. Metadata complètes (`title` 50-60, `description` 140-160), Open Graph, canonical systématique. `robots.ts`/`sitemap.ts` dynamiques depuis les données réelles. JSON-LD `JobPosting` sur les fiches offres (Google for Jobs). **Avant le code d'une page indexable : produire le tableau `[URL | Mot-clé | Intention | SSR/SSG]` dans `docs/architecture-seo.md`.**

### 8-10. UX/UI

Niveau de référence Linear/Stripe/Notion. Une seule action principale par écran. Espacement sur échelle cohérente (multiples de 4px). Contraste WCAG AA (4.5:1). Feedback explicite sur toute action non instantanée. Quatre états définis pour tout composant qui charge : **loading (skeleton), empty (avec action), error (message spécifique + récupération), success**.

### 11-12. Tests & qualité

Priorité : 1) tests unitaires logique métier backend, 2) intégration API (auth, upload, offres) avec DB de test, 3) composants frontend à interaction non triviale (**test de régression du bug de message groupé du signup wizard**), 4) E2E limités aux parcours critiques. Pas de test de complaisance. Lint + `tsc --noEmit` systématiques et bloquants en CI ; pas de `@ts-ignore` ni règle désactivée sans commentaire justifiant.

---

## PARTIE 6 — PRODUCT THINKING, ROADMAP, RÈGLES MÉTIER

### 1. Claude Code comme Product Designer

Pour toute fonctionnalité introduisant une nouvelle page/flux/entité, dérouler : problème utilisateur, parcours, wireframe, composants, données, API, SEO, états d'interface, responsive/dark, analytics, performance. Disproportionné pour un ajustement mineur.

### 2. Priorisation

Trois axes : alignement mission (pas de dérive ATS), phase actuelle (ne pas construire du Phase 3 en Phase 1), coût de réversibilité (ADR + validation si dépendance structurante).

### 3. Roadmap

- **Phase 1 (gratuit)** : signup candidat (CV intégré) + recruteur, profil public, publication d'offre, recherche/filtrage, messagerie basique, **vérification asynchrone de la pièce d'identité (compte actif immédiatement — comportement à préserver)**.
- **Phase 2 (B2B/saisonnier)** : espace recruteur enrichi, mise en avant profils "disponibles rapidement", espace entreprises partenaires (seulement quand un partenariat réel le justifie).
- **Phase 3 (monétisation)** : payant recruteurs au-delà d'un usage gratuit, mise en avant payante (prudence).
- **Escrow (transverse futur)** : paiement bloqué puis libéré à livraison confirmée. Nécessite fournisseur local (Mobile Money), médiation de litige, conformité réglementaire validée avant tout dev. Seulement après traction Phase 1 suffisante.

### 4. Règles métier actuelles

- Compte actif immédiatement ; vérification pièce en arrière-plan, ne bloque pas l'accès de base (peut restreindre des actions sensibles si défini).
- Pièce rejetée → suspension possible par admin, avec motif clair (jamais message technique générique).
- Messagerie uniquement entre recruteur et candidat avec point de contact légitime (candidature ou contact initié depuis un profil public) — pas de messagerie ouverte non sollicitée.

Toute nouvelle règle métier est répercutée dans cette section au moment de son implémentation.

---

## PARTIE 7 — SÉCURITÉ ET UTILISATION DES SKILLS

Toute régression de sécurité bloque la mise en production de la fonctionnalité concernée jusqu'à correction.

- **Injection SQL** : Prisma paramétré, jamais `$queryRawUnsafe` avec entrée utilisateur ; `$queryRaw` avec paramètres liés si requête brute nécessaire.
- **XSS** : pas de `dangerouslySetInnerHTML` avec contenu utilisateur non assaini ; toute donnée tierce traitée comme non fiable.
- **CSRF** : cookies `SameSite=Strict`/`Lax` ; token CSRF ou vérification `Origin`/`Referer` sur mutations critiques (mot de passe, paiement).
- **Validation** : toute donnée entrante revalidée côté serveur (DTO), sans exception.
- **Upload** : MIME réel (pas l'extension), limite de taille serveur (Multer), stockage **privé** servi par endpoint authentifié+autorisé (propriétaire ou admin), nom de fichier généré serveur (jamais l'original — path traversal).
- **Secrets** : jamais en dur, `.env*` dans `.gitignore` avant le premier commit, `.env.example` documenté, validation stricte au démarrage.
- **Auth/autz** : moindre privilège, guard explicite sur chaque route sensible.
- **Logs** : jamais de donnée sensible en clair (mot de passe, contenu de pièce, token complet).
- **Headers** : Helmet (`nosniff`, `X-Frame-Options: DENY`/CSP `frame-ancestors`, HSTS en prod, CSP restrictive).
- **CORS** : liste blanche explicite, jamais `*` sur une API à cookies.
- **Rate limiting** : login (brute-force), signup (masse), paiement futur, upload.

### Skills — déclenchement ciblé (jamais par habitude)

`find-skills` (tâche ambiguë), `apple-design` (finition marketing/design system), `emil-design-eng` (micro-interactions), `improve-animations` / `review-animations` / `find-animation-opportunities` (motion), `vercel-react-best-practices` (décision RSC/fetching non triviale), `vercel-react-view-transitions` (transition de navigation). Un Skill ne remplace jamais le raisonnement de ce document ; en cas de tension, la règle Bara prévaut et la tension est signalée.

---

## PARTIE 8 — CHECKLISTS, STANDARDS, GIT, DOC

### Checklist PR

Besoin reformulé aligné mission ; modules impactés identifiés ; règle métier côté `apps/api` ; DTO messages par champ ; aucun secret en dur, `.env` ignoré ; guards explicites ; uploads privés ; pages indexables avec metadata/canonical/`h1` unique + listées dans `architecture-seo.md` ; quatre états d'interface ; lint + typecheck OK ; build complet OK ; tests métier/sécurité ; dépendances vérifiées ; doc mise à jour.

### Checklist release

Env vars prod validées ; migrations testées sur données représentatives ; headers sécurité actifs en prod ; rate limiting login/signup/upload ; logs sans donnée sensible ; sitemap/robots à jour ; audit Lighthouse en conditions réalistes.

### Standards de code

Code en **anglais** (variables, fonctions, fichiers, commits) ; français uniquement pour le contenu utilisateur final et la doc produit. Une fonction fait une chose. Commentaires expliquent le "pourquoi". Pas de `catch` vide, pas de code mort commenté.

### Git

Commits `type(scope): description` (`feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `security`). Branches `feature/…`, `fix/…`, jamais de dev direct sur main. PR = une unité de changement. Revue explicite obligatoire sur auth/uploads/paiement.

### Documentation

Ce CLAUDE.md est la référence, mis à jour à chaque changement de convention. `docs/architecture-seo.md` avant toute page publique. `docs/adr/` pour les décisions structurantes. Toute règle métier nouvelle répercutée à l'implémentation.

### Ce que ce document n'est pas

Pas un contrat figé. Si une règle freine le produit sans bénéfice réel, elle est questionnée explicitement et révisée — jamais silencieusement contournée. Dès qu'une règle s'oppose à la mission (Partie 1), c'est la mission qui tranche.
