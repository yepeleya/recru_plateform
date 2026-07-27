# Architecture SEO — Bara

Livrable requis avant génération du code (règle projet). Chaque page cible **une seule
intention de recherche** et **un seul mot-clé principal**. Architecture multi-pages stricte,
pas de one-page. Marché principal : Côte d'Ivoire (Abidjan).

## Tableau d'architecture

| URL | Mot-clé cible | Intention de recherche | Type de rendu |
|-----|---------------|------------------------|---------------|
| `/` | petits jobs Côte d'Ivoire | Mixte (découverte de la plateforme) | SSG |
| `/offres` | offres petits jobs Abidjan | Transactionnelle (chercher un job) | SSR (filtres par searchParams ; données démo en attendant l'API) |
| `/offres/[slug]` | *dynamique : intitulé + ville de l'offre* | Transactionnelle (postuler) | SSR — **noindex tant que données démo** |
| `/profils` | trouver un prestataire en Côte d'Ivoire | Commerciale (recruter) | SSR (filtres métier + « disponible maintenant » ; données démo) |
| `/profils/[slug]` | *dynamique : métier + nom du profil* | Commerciale (contacter un profil) | SSR — **noindex tant que données démo** |
| `/metiers` | tous les métiers petits jobs Côte d'Ivoire | Commerciale (parcourir les métiers) | SSG |
| `/metiers/[slug]` | *dynamique, 1 page par métier référencé dans `@bara/shared-types` (34 métiers/7 familles — ex. « graphiste Abidjan », « chauffeur Abidjan »)* | Commerciale (recruter un métier précis) | SSG *(passera en ISR quand offres/profils seront branchés à la base de données)* |
| `/creer-un-cv` | créer un CV en ligne gratuit | Transactionnelle (créer son CV) | SSG |
| `/creer-un-cv/nouveau` | — | Navigationnelle (noindex, outil interactif) | Page shell SSG + éditeur client (brouillon en localStorage, pas encore de compte/API) |
| `/recruteurs` | recruter du personnel ponctuel | Commerciale (poster une offre) | SSG |
| `/jobs-vacances` | job de vacances étudiant Abidjan | Transactionnelle (jeunes/étudiants) | SSG |
| `/comment-ca-marche` | comment trouver un petit job rapidement | Informationnelle | SSG |
| `/tarifs` | prix plateforme recrutement Côte d'Ivoire | Commerciale | SSG |
| `/a-propos` | plateforme de mise en relation emploi | Informationnelle (confiance) | SSG |
| `/contact` | contacter Bara | Navigationnelle | SSG |
| `/connexion` | connexion Bara | Navigationnelle (noindex) | SSG |
| `/inscription` | inscription Bara | Navigationnelle (noindex) | SSG |
| `/conditions` | — | Légal (noindex jusqu'à validation juridique) | SSG |
| `/confidentialite` | — | Légal (noindex jusqu'à validation juridique) | SSG |
| `/tableau-de-bord` | — | Espace connecté (noindex, hors sitemap) | Shell SSG en attendant l'auth |

## Règles appliquées à chaque page

- Un seul `<h1>` par page ; hiérarchie `h2` → `h3` sans saut de niveau.
- `export const metadata` (ou `generateMetadata` pour les pages dynamiques) :
  - `title` : 50–60 caractères, mot-clé principal au début ;
  - `description` : 140–160 caractères, incitative au clic, contient le mot-clé ;
  - `alternates.canonical` sur chaque page (anti duplicate content) ;
  - `openGraph` (title, description, image) systématique.
- SSR/SSG uniquement pour le contenu textuel : **aucun `"use client"`** sur les composants
  qui encapsulent du texte structurel. L'interactivité (formulaires, éditeur de CV,
  messagerie) est isolée dans des composants feuilles.
- Balises sémantiques : `<main>`, `<section>`, `<article>`, `<nav>`, `<footer>`.
- Toute image a un attribut `alt` descriptif.
- `app/sitemap.ts` et `app/robots.ts` dynamiques (texte brut, jamais interceptés par
  un layout) ; les pages dynamiques (offres, profils, métiers) y sont injectées depuis
  la base de données.
- Espace connecté (`/tableau-de-bord`, éditeur de CV, messagerie) : hors sitemap,
  `noindex`, protégé par authentification.

## Évolutions prévues (phase 2+)

- `/blog/[slug]` — contenu informationnel (SSG/ISR) pour capter la longue traîne
  (« comment faire un CV sans expérience », « trouver un job de vacances », etc.).
- Pages villes (`/offres/ville/[ville]`) quand le volume d'offres le justifiera.
- Données structurées Schema.org `JobPosting` sur `/offres/[slug]` (éligibilité
  Google for Jobs) et `Person`/`Service` sur les profils.
