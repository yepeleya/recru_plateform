# Phase 4 — Roadmap en vagues (V0 → V7)

> Découpage d'exécution de la re-architecture progressive. Chaque vague a un **objectif**, des **livrables**, des **critères de sortie** (Definition of Done) et ses **dépendances**. On ne démarre une vague que si la précédente passe ses critères. Cadre : [02-architecture-cible.md](02-architecture-cible.md).

```
V0 Architecture → V1 Core → V2 Utilisateurs → V3 Recruteurs
→ V4 Matching → V5 Paiement → V6 IA → V7 Optimisation
```

Légende état : ✅ fait · 🟡 partiel · ⬜ à faire.

---

## V0 — Architecture & fondations
**Objectif** : poser le socle propre pour que tout le reste se construise vite et sûr.
**Livrables**
- 🟡 Dossier d'architecture (ce dossier) + CLAUDE.md géant.
- 🟡 Design system (`components/ui` + tokens light/dark) — posé, à compléter (Dialog, Toast, Skeleton, EmptyState…).
- ⬜ Réorg backend en `modules/*` + `common/*`.
- ⬜ Migrations Prisma formalisées + soft-delete + audit log écrit.
- ⬜ CI (lint + typecheck + test + build) + squelette de tests.
- ⬜ ADR-001/002 tranchés (design system, rôles).
**Sortie** : CI verte, design system documenté, migrations en place, 0 secret exposé.

## V1 — Core (parcours connecté)
**Objectif** : un utilisateur peut s'inscrire, se connecter, voir son espace, se déconnecter — pour de vrai.
**Livrables**
- ✅ Auth backend (register/login/refresh/logout/me, sécurisé).
- ⬜ **Contexte session frontend** (consomme `/me`), routes protégées, bouton déconnexion.
- ⬜ **Tableau de bord réel** (profil, statut de vérification, raccourcis).
- ⬜ Migration visuelle des pages existantes sur le design system + dark mode.
- ⬜ 4 états (loading/empty/error/success) systématisés.
**Dépendances** : V0. **Sortie** : inscription→connexion→dashboard→déconnexion testé E2E.

## V2 — Utilisateurs (candidats)
**Objectif** : le candidat existe pleinement et est visible.
**Livrables**
- ⬜ Éditeur CV relié au compte (persistance API, plus seulement localStorage) + export PDF.
- ⬜ **Profil public candidat** (CRUD, métier, disponibilité, ville) branché API.
- ⬜ Paramètres de compte.
- 🟡 Vérification d'identité (upload existant ; workflow admin de validation à finir).
**Dépendances** : V1. **Sortie** : un candidat publie un profil réel consultable.

## V3 — Recruteurs
**Objectif** : le recruteur (particulier & entreprise) publie et gère.
**Livrables**
- ⬜ **Backend offres** (CRUD, statut actif/expiré, filtres, pagination curseur) — remplace `demo-data.ts`.
- ⬜ Formulaire de **publication d'offre** complet (titre, description, budget FCFA, période, ville).
- ⬜ **Recherche/filtrage de profils** (dont « disponible maintenant ») branchée API.
- ⬜ Gestion des offres publiées + candidatures reçues.
- ⬜ Distinction claire compte particulier / entreprise dans l'UI.
**Dépendances** : V1 (V2 en parallèle). **Sortie** : une offre réelle est publiée, listée, indexable (JSON-LD `JobPosting`).

## V4 — Matching & mise en relation
**Objectif** : connecter la bonne offre au bon profil, et permettre l'échange.
**Livrables**
- ⬜ **Candidatures** (postuler, suivi côté candidat et recruteur).
- ⬜ **Messagerie** recruteur↔candidat (contact légitime uniquement — pas de spam).
- ⬜ Recommandation simple (offres/profils par métier + ville + disponibilité) — SQL d'abord, moteur dédié si besoin (ADR-003).
- ⬜ Notifications (email d'abord via `NotificationProvider`).
**Dépendances** : V2 + V3. **Sortie** : une candidature aboutit à une conversation.

## V5 — Paiement (escrow)
**Objectif** : sécuriser la transaction (client paie → bloqué → libéré à livraison).
**Livrables**
- ⬜ Intégration **Mobile Money** via `PaymentProvider` (ADR-004).
- ⬜ Séquestre + libération + **médiation de litige** minimale.
- ⬜ Journalisation financière + audit renforcé.
**Préalable bloquant** : **validation réglementaire/conformité** (manipule de l'argent réel) + traction Phase 1 suffisante. **Dépendances** : V4. **Sortie** : un paiement test complet en sandbox, conforme.

## V6 — IA
**Objectif** : accélérer et fiabiliser, sans gadget.
**Livrables candidats**
- ⬜ Aide à la rédaction du CV / résumé pro (comme cvmaker).
- ⬜ Suggestion de métiers/offres pertinents.
**Livrables recruteurs**
- ⬜ Pré-tri / scoring de pertinence des profils sur une offre (avec transparence, jamais discriminant).
**Garde-fous** : coûts maîtrisés, données personnelles protégées, résultats explicables. **Dépendances** : V4 (données réelles). **Sortie** : au moins une aide IA mesurablement utile.

## V7 — Optimisation
**Objectif** : passer à l'échelle et polir.
**Livrables**
- ⬜ Perfs : Lighthouse ≥ 95 pages publiques, budget bundle, `next/image`, cache/ISR, pagination curseur partout.
- ⬜ SEO avancé : JSON-LD complet, pages villes, blog longue traîne.
- ⬜ Accessibilité AA vérifiée (contraste, clavier, lecteur d'écran).
- ⬜ Observabilité (logs structurés, métriques), rate limiting distribué (Redis) si multi-instance.
- ⬜ Durcissement final (CSP, verrouillage de compte, tests de charge).
**Dépendances** : le produit est fonctionnel. **Sortie** : prêt pour montée en charge réelle.

---

## Vue synthétique des dépendances
```
V0 ─┬─> V1 ─┬─> V2 ─┐
    │        └─> V3 ─┴─> V4 ─> V5
    │                        └─> V6
    └──────────────────────────────> V7 (transverse, en continu dès que possible)
```

## Règles de pilotage
- **Sécurité jamais coupée** : un raccourci se prend sur une fonctionnalité secondaire ou un raffinement visuel, jamais sur la sécurité (CLAUDE.md Partie 7).
- **Chaque vague finit par la checklist PR + release** (CLAUDE.md Partie 8) avant d'ouvrir la suivante.
- **Chaque nouvelle règle métier** est répercutée dans le CLAUDE.md et le [00-metier.md](00-metier.md) au moment de son implémentation.
