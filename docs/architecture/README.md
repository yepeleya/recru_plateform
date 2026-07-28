# Dossier d'architecture — Bara

Dossier d'architecture Enterprise de Bara (plateforme de mise en relation pour petits jobs en Côte d'Ivoire). Il accompagne les conventions techniques de [`docs/CLAUDE.md`](../CLAUDE.md) et l'architecture SEO de [`docs/architecture-seo.md`](../architecture-seo.md).

## Sommaire

| Document | Contenu |
|---|---|
| [00-metier.md](00-metier.md) | **Phase 0 — Compréhension métier** : problème, personas (candidat, recruteur particulier/entreprise, admin), business model, concurrents, positionnement |
| [01-audit.md](01-audit.md) | **Phase 1 — Audit complet noté** : architecture, code, DB, API, UI/UX, responsive, sécurité, perfs, SEO, accessibilité, Clean Archi, SOLID, DRY, dette |
| [02-architecture-cible.md](02-architecture-cible.md) | **Phase 3 — Architecture cible** : Feature-Driven + DDD léger + Clean Architecture, arborescences web/api, design system, tests, CI/CD, ADRs |
| [03-roadmap.md](03-roadmap.md) | **Phase 4 — Roadmap en vagues** V0→V7 (Architecture → Core → Utilisateurs → Recruteurs → Matching → Paiement → IA → Optimisation) |
| `../adr/` | Architecture Decision Records (à créer : design system, rôles, recherche, paiement, messagerie) |

## Principe directeur
**Re-architecture progressive en place**, pas un rebuild from scratch : on conserve le validé (auth sécurisé, design system, types partagés) et on restructure vague par vague. La sécurité (pièces d'identité, argent à terme) n'est jamais négociable, même sous contrainte de délai.

## État de synthèse (27/07/2026)
- ✅ Auth backend sécurisé, design system + tokens, 0 emoji dans l'UI, SEO de base, dossier d'architecture.
- 🟡 Design system peu adopté par les pages, vérification d'identité (workflow admin à finir).
- ⬜ Parcours connecté (session/dashboard), backend offres/profils, candidatures, messagerie, tests, CI/CD, escrow, IA.

Prochaine exécution recommandée : **V0 (fondations : réorg modules, migrations, CI, tests, ADR) puis V1 (parcours connecté)**.
