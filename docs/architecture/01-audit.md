# Phase 1 — Audit complet (état au 27/07/2026)

> Notation honnête de l'existant, axe par axe, avec forces / faiblesses concrètes et références fichiers. Base de la refonte ([02-architecture-cible.md](02-architecture-cible.md)). Échelle : 🟢 solide · 🟡 correct mais à renforcer · 🔴 à refaire / manquant.

**Contexte** : monorepo pnpm `apps/web` (Next.js 16, App Router, Tailwind v4), `apps/api` (NestJS 11 + Prisma + MySQL), `packages/shared-types`. Seul le domaine **auth** est branché de bout en bout ; offres/profils tournent sur données démo, l'éditeur CV en localStorage.

---

## Tableau de synthèse

| Axe | Note | Verdict d'une ligne |
|---|---|---|
| Architecture (monorepo, séparation) | 🟢 | Bon squelette ; découpage domaine à approfondir côté API |
| Code (lisibilité, TS strict) | 🟡 | Propre et typé, mais styles inline dupliqués page par page |
| Base de données (Prisma) | 🟡 | Schéma cohérent ; manque soft-delete, index métier, migrations formalisées |
| API (REST, DTO, versioning) | 🟢 | `/v1`, DTO validés, exception filter uniforme, RBAC prêt |
| UI (design) | 🟡 | Design system posé mais pages pas encore migrées dessus |
| UX (parcours, états) | 🔴 | 4 états (loading/empty/error/success) non systématiques ; parcours connecté absent |
| Responsive | 🟡 | Grilles responsives présentes, pas de vérif mobile-first rigoureuse |
| Sécurité | 🟢 | Point fort : auth durcie, upload privé, rate limiting, CORS strict |
| Performances | 🟡 | SSR/SSG en place ; pas de mesure Lighthouse ni budget bundle |
| SEO | 🟢 | Metadata/canonical/sitemap/34 pages métiers ; manque JSON-LD `JobPosting` |
| Accessibilité | 🟡 | `aria-hidden` sur icônes, alt à généraliser ; contraste primaire à vérifier |
| Design system | 🟡 | Créé (components/ui + tokens) mais peu adopté |
| Clean Architecture | 🟡 | API proche ; frontend mélange présentation et données démo |
| SOLID | 🟡 | Respecté globalement côté services ; controllers fins |
| DRY | 🔴 | Duplication forte des classes Tailwind et des patterns de carte/CTA |
| Dette technique | 🟡 | Maîtrisée et documentée, mais tensions CLAUDE.md ouvertes |

---

## Détail par axe

### Architecture — 🟢
- **+** Monorepo pnpm calqué sur CVMaker ; types partagés dans `packages/shared-types` (pas de duplication front/back) ; `apps/api` = source de vérité métier.
- **−** Backend **plat** (`src/auth`, `src/users`, `src/uploads`) au lieu de `src/modules/*` + `src/common/*` (CLAUDE.md Partie 2 §5). Pas encore de découpage par domaine complet (offres, profils, messagerie absents).
- **−** `packages/ui` prévu mais design system placé dans `apps/web/src/components/ui` (choix assumé : une seule app front — voir ADR à écrire).

### Code — 🟡
- **+** TypeScript strict, pas de `any` sauvage ; composants lisibles.
- **−** **Styles inline dupliqués** : chaque page redéfinit `card-lift rounded-2xl border border-stone-200 bg-white…` au lieu d'utiliser `<Card>`. Le design system existe mais n'est pas encore consommé.
- **−** Tokens de marque legacy (`bg-brand`, `bg-night`) encore utilisés partout à migrer vers les tokens sémantiques.

### Base de données — 🟡
- **+** Schéma Prisma clair (`User`, `IdentityDocument`, `Cv`, `WorkerProfile`, `JobOffer`, `RefreshToken`, `AdminAuditLog`) ; `@unique` sur email ; index sur FK.
- **−** **Pas de soft-delete** (`deletedAt`) sur comptes/offres/messages (CLAUDE.md Partie 4 §5).
- **−** **Migrations non formalisées** : `prisma db push` sans historique — à passer en `migrate` avant tout déploiement.
- **−** Index métier manquants (recherche par ville/statut/disponibilité).

### API — 🟢
- **+** Préfixe **`/api/v1`**, `ValidationPipe` (`whitelist` + `forbidNonWhitelisted`), **exception filter global** `{statusCode,message,error}`, messages d'erreur **par champ**.
- **+** RBAC prêt (`RolesGuard` + `@Roles`), `JwtAuthGuard`.
- **−** Un seul domaine exposé (auth + `/users/me` + `/uploads`). Offres/profils/candidatures/messagerie **à créer**.
- **−** Réconciliation des rôles à trancher : enum `USER/ADMIN/SUPPORT` + `accountType` vs `CANDIDATE/RECRUITER/ADMIN` du CLAUDE.md.

### UI / Design — 🟡
- **+** Direction visuelle définie (tokens sémantiques light+dark, composants Button/Card/Input/Badge, typo Space Grotesk/Inter, animations CSS respectant `prefers-reduced-motion`).
- **+** **0 emoji** dans l'UI (remplacés par Lucide) — conforme à l'exigence pro.
- **−** Pages pas encore refondues sur le design system → incohérences visuelles entre pages construites à des moments différents.
- **−** Dark mode : tokens prêts, **toggle et adoption manquants**.

### UX — 🔴
- **−** Les **4 états** (chargement / vide / erreur / succès) ne sont pas systématiques (offres/profils affichent des listes sans skeleton ni gestion d'erreur réseau réelle).
- **−** **Parcours connecté absent** : après login, pas de session consommée, pas de dashboard réel, pas de déconnexion.
- **+** Micro-copie récemment professionnalisée (message d'inscription, erreurs orientées action).

### Sécurité — 🟢 (point fort)
- **+** Cookies **HttpOnly/Secure/SameSite=Strict** ; **refresh token révocable** (hash SHA-256 en base, rotation, révocation au logout) ; **rejeu d'un token volé bloqué** (testé → 401).
- **+** **Upload pièces d'identité privé** : noms UUID, dossier gitignoré hors public, endpoint protégé (propriétaire/admin) → accès sans auth = 401 (testé).
- **+** `forbidNonWhitelisted` bloque l'injection `role=ADMIN` (testé → 400) ; bcrypt coût 12 ; Helmet ; CORS liste blanche ; rate limiting login/register ; validation d'env au démarrage.
- **−** Manque : audit log **écrit** sur les actions sensibles (table prête, pas alimentée), verrouillage de compte après N échecs, CSP affinée.

### Performances — 🟡
- **+** SSR/SSG systématique ; `next/font` (auto-hébergé) ; images à venir en `next/image`.
- **−** Aucune mesure Lighthouse, pas de budget bundle suivi, pas de pagination curseur (listes démo en mémoire).

### SEO — 🟢
- **+** `metadata` (title 50-60 / description 140-160), `canonical`, Open Graph, `robots.ts` + `sitemap.ts` dynamiques, **34 pages `/metiers/[slug]`** + index, un seul `<h1>` par page.
- **−** Manque **JSON-LD `JobPosting`** (Google for Jobs) sur les fiches offres ; pages détail offres/profils en `noindex` tant que données démo.

### Accessibilité — 🟡
- **+** Icônes décoratives en `aria-hidden`, labels de formulaire présents, focus-visible sur les composants du design system.
- **−** Contraste du **bouton primaire orange/blanc ~3,6:1** (AA large seulement) à trancher ; `alt` d'images à généraliser ; audit clavier/lecteur d'écran non fait.

### Clean Archi / SOLID / DRY
- **Clean** 🟡 : API respecte (controller fin → service → Prisma) ; frontend mélange présentation et données démo (`demo-data.ts` importé directement par les pages).
- **SOLID** 🟡 : responsabilités correctes côté services ; à surveiller quand les modules grossiront.
- **DRY** 🔴 : **duplication majeure** des classes Tailwind (cartes, CTA, filtres) — c'est la première cible de la refonte via le design system.

### Dette technique — 🟡 (maîtrisée, documentée)
Tensions connues et tracées : soft-delete, réorg `src/modules`, rôles, migrations Prisma, tests (aucun aujourd'hui), JSON-LD, adoption du design system, dark mode. Aucune n'est un piège caché — toutes sont listées ici et dans la mémoire projet.

---

## Top priorités de refonte (issues de l'audit)
1. **Adopter le design system partout** (tue la dette DRY + incohérence UI). 
2. **Parcours connecté réel** (session, dashboard, logout) → débloque l'UX.
3. **Backend offres/profils** + branchement (retire les données démo).
4. **Formaliser migrations + soft-delete + audit log écrit**.
5. **Tests** (auth d'abord, dont régression message groupé) + **CI**.
6. **JSON-LD `JobPosting`** + mesures Lighthouse.
