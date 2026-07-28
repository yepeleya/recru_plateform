# Phase 3 — Architecture cible (Enterprise)

> Cible technique de Bara. Principe directeur : **re-architecture progressive en place**, pas un rebuild from scratch — on conserve le validé (auth sécurisé, design system, types partagés) et on restructure vague par vague ([03-roadmap.md](03-roadmap.md)). Cadre : [CLAUDE.md](../CLAUDE.md).

---

## 1. Principes structurants

1. **Feature-Driven** : le code s'organise par **fonctionnalité métier** (offers, profiles, applications, messaging, verification, payments), pas par type technique.
2. **DDD léger** : chaque domaine expose une interface claire (DTO publics) et cache son implémentation. Pas d'event sourcing/agrégats tant que le stade ne le justifie pas.
3. **Clean Architecture ciblée** : indirection (interface + implémentation) **uniquement** là où l'implémentation changera — `StorageProvider` (disque privé → S3), `NotificationProvider` (email/SMS), `PaymentProvider` (Mobile Money). Ailleurs, Prisma directement (il est déjà l'abstraction sur MySQL).
4. **Une source de vérité métier** : `apps/api`. Le frontend ne duplique jamais une règle critique.
5. **Frugalité** : Server Components par défaut, bundle maîtrisé, mobile-first (cible connexion mobile ivoirienne).

---

## 2. Arborescence cible — Backend (`apps/api/src`)

```
main.ts
app.module.ts
config/            env.validation.ts
common/
  guards/          jwt-auth.guard, roles.guard
  decorators/      roles.decorator, current-user.decorator
  filters/         all-exceptions.filter
  interceptors/    logging, transform
  services/        storage/ (StorageProvider), notifications/ (NotificationProvider)
modules/
  auth/            controller, service, strategies/, dto/
  users/           profil de compte, /me, paramètres
  identity/        vérification pièce d'identité (admin), statuts
  profiles/        profils candidats publics (CRUD, recherche, disponibilité)
  offers/          offres recruteurs (CRUD, filtres, statut, JSON-LD source)
  applications/    candidatures (candidat↔offre), suivi
  messaging/       messagerie recruteur↔candidat (contact légitime only)
  admin/           back-office : modération, audit, stats
  payments/        escrow (Phase 5, PaymentProvider)
prisma/            schema.prisma, prisma.module.ts, migrations/
```

Règle : **un module = un domaine**. Un module n'accède jamais au Prisma d'un autre domaine — il passe par le service public exporté. Logique transverse dans `common/`.

## 3. Arborescence cible — Frontend (`apps/web/src`)

```
app/
  (marketing)/     accueil, comment-ca-marche, recruteurs, jobs-vacances, tarifs, a-propos, contact
  (auth)/          connexion, inscription
  (app)/           espace connecté : tableau-de-bord, mon-cv, mes-candidatures, messagerie, parametres
  offres/          liste + détail (SSR, vraies données, JSON-LD)
  profils/         liste + détail (SSR)
  metiers/         index + [slug]
  sitemap.ts, robots.ts
components/
  ui/              design system pur (Button, Card, Input, Badge, Select…) — aucune logique métier
  features/        composants métier (offer-card, profile-card, application-status, message-thread…)
  layout/          header, footer, theme-toggle, nav
lib/
  api-client.ts    client HTTP typé vers apps/api
  validations/     schémas zod partagés (confort UX ; la vérité reste côté API)
  auth/            contexte session (consomme /me), hooks
  seo/             helpers metadata + JSON-LD
providers/         theme, query client
```

Règle : `components/ui` = présentation sans réseau ni métier ; `components/features` = lié à un domaine, jamais générique au point de perdre son sens.

---

## 4. Design System (fondation posée, à étendre)

- **Tokens sémantiques** (`globals.css`) : `background/foreground/surface/muted/border/primary/accent/success/danger/warning` + variantes **dark** (classe `.dark`). Jamais de teinte fixe (`bg-[#..]`) dans un composant.
- **Primitives** : `Button` (variants primary/accent/secondary/outline/ghost/danger + tailles), `Card`, `Input`, `Textarea`, `Label`, `Select`, `Badge`. Réponse au `:active`, `focus-visible`, `motion-reduce`.
- **Icônes** : **Lucide only**, jamais d'emoji (mapping métier→icône dans `lib/metier-icons`).
- **À ajouter** : `Dialog`, `Dropdown`, `Toast`, `Skeleton`, `Avatar`, `Tabs`, `Tooltip` (base shadcn adaptée aux tokens), `EmptyState`, `ErrorState`.
- **Décision à valider** : `components/ui` (mono-app) vs `packages/ui` (multi-app). ADR requis.

---

## 5. Stratégie de tests (aujourd'hui : 0 test)

Priorité par valeur décroissante :
1. **Unitaires logique métier backend** (services : autorisation, validations conditionnelles, matching, calculs escrow).
2. **Intégration API** (auth, upload, offres, candidatures) sur **DB de test dédiée**, peu de mocks.
3. **Composants frontend** à interaction non triviale (signup wizard — **test de régression du message groupé**, filtres).
4. **E2E** limités aux parcours critiques (inscription complète, publier une offre, envoyer une candidature).

Pas de test de complaisance (« rend sans planter » sans assertion). Cibles : Jest + Supertest (api), Vitest + Testing Library (web), Playwright (E2E).

---

## 6. CI/CD (à mettre en place — V0)

Pipeline (GitHub Actions), **builds ciblés par filtres pnpm** :
1. `lint` (ESLint) + `typecheck` (`tsc --noEmit`) — bloquants.
2. `test` (unit + intégration API avec MySQL service).
3. `build` web + api (détecte les erreurs prod).
4. (optionnel) audit Lighthouse sur PR pour les pages publiques.
5. **Secrets** : jamais dans le repo ; variables dans les secrets GitHub / dashboard hébergeur. `.env*` gitignoré (déjà en place).
6. Déploiement : staging avant prod ; migrations Prisma testées sur données représentatives.

---

## 7. ADRs à rédiger (`docs/adr/`)
- ADR-001 : Design system dans `components/ui` vs `packages/ui`.
- ADR-002 : Modèle de rôles (`accountType` + `role` privilège) vs enum unique.
- ADR-003 : Recherche SQL `LIKE` vs moteur dédié (Meilisearch) — seuil de bascule.
- ADR-004 : Fournisseur de paiement escrow (Mobile Money) + conformité.
- ADR-005 : Messagerie polling vs WebSocket — seuil de bascule.

Format court : contexte, décision, alternatives rejetées, conditions de révision.

---

## 8. Non négociable (rappel sécurité, CLAUDE.md Partie 7)
Validation serveur systématique · upload identité privé (jamais d'URL publique) · autorisation vérifiée côté serveur sur chaque route sensible (un recruteur ne voit jamais la pièce d'identité d'un candidat) · secrets hors repo · rate limiting login/signup/upload/paiement · audit log des actions sensibles. Le délai ne justifie jamais un raccourci ici.
