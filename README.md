# Bara

Plateforme de mise en relation entre les personnes qui cherchent des petits jobs
(missions ponctuelles, jobs de vacances, prestations freelance) et ceux qui recrutent —
entreprises comme particuliers. Générateur de CV intégré (hérité de cvmaker /
CvGenerateur). Marché initial : Côte d'Ivoire.

> « Bara » = « travail » en nouchi. Trouve ton bara, trouve ton monde.

## Vision produit

1. **Candidats** : créent leur CV directement dans l'app, le publient, et deviennent
   visibles dans la base de profils (graphiste, monteur, chauffeur, servante, etc.).
2. **Recruteurs** (entreprises et particuliers) : parcourent les profils ou publient
   une offre (description, budget, période) ; contact via messagerie interne.
3. **Phase 2** : démarchage d'entreprises pour du personnel saisonnier, offres partenaires.
4. **Phase 3** : monétisation (offres premium, mise en avant), paiement séquestre (escrow)
   pour les prestations immatérielles.

## Structure du monorepo

```
bara/
├── apps/
│   └── web/                 Next.js (App Router) + TypeScript + Tailwind v4 — SSR/SSG, SEO-first
│       (à venir : apps/api  NestJS + Prisma + MySQL, sur le modèle de CvGenerateur)
├── packages/
│   └── shared-types/        Types partagés : CvContent (hérité de cvmaker), offres, profils
├── docs/
│   └── architecture-seo.md  Tableau [URL | mot-clé | intention | rendu] — à maintenir
├── pnpm-workspace.yaml
└── package.json
```

## Stack technique

| Domaine   | Choix                                                        |
|-----------|--------------------------------------------------------------|
| Frontend  | Next.js (App Router), TypeScript, Tailwind CSS v4            |
| Backend   | NestJS + Prisma + MySQL (à venir, aligné sur CvGenerateur)   |
| Paiements | FusionPay / GeniusPay / Paystack (phase monétisation)        |
| CV        | Réutilisation du cœur cvmaker (`CvContent`, templates, PDF)  |

## Règles non négociables

- **Sécurité** : aucun secret en dur ; `.env*` ignoré par git ; validation côté serveur ;
  requêtes paramétrées (Prisma) ; CORS explicite ; rate limiting sur les endpoints
  sensibles ; pas de `eval` / `innerHTML` avec contenu utilisateur.
- **SEO** : voir [docs/architecture-seo.md](docs/architecture-seo.md). Toute nouvelle page
  passe d'abord par le tableau d'architecture. SSR/SSG pour le contenu textuel, un seul
  `<h1>`, hiérarchie Hn linéaire, `metadata` + canonical + Open Graph obligatoires.

## Démarrer en local

```bash
pnpm install
pnpm dev:web   # Next.js sur http://localhost:3100
```
