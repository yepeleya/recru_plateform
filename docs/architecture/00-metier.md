# Phase 0 — Compréhension métier

> Dossier d'architecture Bara. Ce document définit **le problème, les utilisateurs et le marché** avant toute décision technique. Il est la source de vérité produit ; toute fonctionnalité se justifie par rapport à lui. Voir aussi [docs/CLAUDE.md](../CLAUDE.md) (conventions) et [01-audit.md](01-audit.md).

---

## 1. Le problème résolu

En Côte d'Ivoire (et plus largement en Afrique de l'Ouest francophone), la mise en relation pour les **petits jobs, missions ponctuelles et emplois saisonniers** se fait de façon informelle : groupes Facebook, bouche-à-oreille, annonces papier. Trois défaillances structurelles en découlent :

1. **Aucune base de profils réutilisable.** Chaque recherche de main-d'œuvre repart de zéro ; un recruteur ne peut pas consulter un historique de candidats qualifiés.
2. **Aucune garantie transactionnelle.** Ni le recruteur (travail réellement effectué) ni le candidat (paiement effectif) ne sont protégés.
3. **Aucun filtrage qualitatif.** Un CV structuré est rare sur ce segment, ce qui rend la présélection lente et peu fiable.

**Bara** répond par : une base de profils avec **CV structuré généré dans l'app**, une **mise en relation directe** (recherche + messagerie), une **vérification d'identité** comme socle de confiance, et — à terme — un **paiement séquestre** (escrow) pour sécuriser la transaction.

Ce que Bara n'est **pas** : un concurrent de LinkedIn ni un ATS de recrutement CDI. Cible = job ponctuel et saisonnier, cycle court, marché local.

---

## 2. Personas

### 2.1 Candidat (chercheur de job)
- **Qui** : jeune (souvent étudiant), travailleur informel, artisan, freelance créatif. Majoritairement **sur mobile**, connexion parfois limitée (→ frugalité technique non négociable).
- **Objectif** : être visible, décrocher des missions rapidement, se constituer une preuve de sérieux (CV + historique).
- **Parcours clé** : inscription → **création du CV** (générateur intégré) → publication du profil → réponse aux offres / être contacté → messagerie → mission.
- **Frein principal** : ne pas avoir de CV présentable. Bara le résout par le générateur (4 templates existants).
- **Métier unique par profil** (décision produit) : un candidat multi-services crée un profil par métier.

### 2.2 Recruteur particulier
- **Qui** : ménage/famille cherchant nounou, ménagère, chauffeur, répétiteur ; petit commerçant.
- **Objectif** : trouver **vite** quelqu'un de fiable et disponible, sans agence.
- **Parcours clé** : inscription → publier une offre (titre, description, budget FCFA, période, ville) **ou** parcourir les profils → filtrer (métier, **« disponible maintenant »**) → contacter.
- **Valeur différenciante** : le filtre **disponibilité immédiate** (répond à l'urgence type « il me faut 4 serveurs ce week-end »).

### 2.3 Recruteur entreprise
- **Qui** : startup, boutique, **supermarché**, agence, restaurant. Besoin de renforts saisonniers / volume.
- **Objectif** : sourcer du personnel ponctuel en volume, avec un minimum de garanties (identité vérifiée).
- **Spécificités** : nom d'entreprise, secteur d'activité, **RCCM optionnel** (badge « Entreprise vérifiée » si fourni), représentant légal identifié.
- **Piste B2B (Phase 2)** : accès partenaire — envoi ciblé de profils, consultation premium. Cas concret remonté par l'équipe : agence en pénurie de 30 ouvriers.

### 2.4 Administrateur (back-office)
- **Qui** : équipe Bara.
- **Objectif** : **vérifier les pièces d'identité** (validation/rejet → badge), modérer (signalements), suspendre un compte, consulter les statistiques.
- **Exigence sécurité** : accès aux documents privés strictement contrôlé (RBAC + audit log de chaque consultation).

---

## 3. Business model

| Phase | Modèle | Détail |
|---|---|---|
| **Phase 1 — Construction** | **Gratuit** | Candidats et recruteurs gratuits. Objectif : la plus grande base de profils/offres de Côte d'Ivoire. Créer son CV et son profil restera toujours gratuit pour les candidats. |
| **Phase 2 — B2B / saisonnier** | Freemium B2B | Accès partenaire pour entreprises (envoi ciblé de profils, mise en avant), staffing saisonnier avec enseignes. |
| **Phase 3 — Monétisation** | Payant recruteurs | Abonnement recruteur au-delà d'un usage gratuit ; mise en avant payante d'offres/profils (avec prudence pour la confiance). |
| **Transverse — Escrow** | Commission | Paiement bloqué puis libéré à livraison confirmée. Nécessite fournisseur local (**Mobile Money** majoritaire), médiation de litige, **conformité réglementaire validée avant tout développement**. À ne construire qu'après traction Phase 1. |

---

## 4. Analyse concurrentielle

### 4.1 Concurrents locaux directs (observés)
| Acteur | Ce qu'il fait | Faiblesse exploitable |
|---|---|---|
| **petitbara.net** | Appli mobile artisans↔clients, 2 rôles, vérification pièce d'identité, abonnement artisan | Appli only, **une seule page marketing, zéro profondeur SEO**, pas de distinction entreprise/particulier, pas de CV structuré |
| **Groupes Facebook emploi** | Annonces non structurées | Pas de profil réutilisable, pas de garantie, annonces éphémères |

### 4.2 Références internationales (à étudier pour l'UX, pas pour le positionnement)
| Acteur | À retenir | À NE PAS copier |
|---|---|---|
| **LinkedIn** | Profil structuré, graphe de confiance | Lourdeur, orientation CDI/cadre |
| **Indeed** | Recherche/filtre d'offres massive, SEO `JobPosting` | Expérience datée, spammy |
| **Welcome to the Jungle** | Qualité éditoriale, pages entreprise soignées, design | Orientation tech/cadre, marché FR |
| **Glassdoor** | Avis/réputation employeur | Hors scope (avis d'entreprise) |
| **Wellfound (AngelList)** | Matching startup↔talent, profils légers | Tech/international only |
| **JobTeaser** | Ciblage étudiants/jobs de vacances | Campus/écoles, pas informel |

### 4.3 Positionnement différenciant de Bara
- **Local first** : FCFA, Mobile Money, métiers manuels ET digitaux, français ivoirien.
- **CV généré intégré** (pont cvmaker) — rare sur ce segment.
- **Confiance par l'identité vérifiée** + disponibilité temps réel.
- **SEO structurel** (pages `/metiers/[slug]`, `JobPosting` JSON-LD à venir) = acquisition organique gratuite, là où petitbara n'a rien.
- **Cycle court** : mission ponctuelle/saisonnière, pas le CDI.

---

## 5. Ce que ça implique pour l'architecture (liens vers la suite)
- **Mobile-first + frugalité** → SSR/SSG, bundle maîtrisé (voir [02-architecture-cible.md](02-architecture-cible.md)).
- **Domaines métier clairs** (candidat, offre, profil, messagerie, vérification, paiement) → découpage **Feature-Driven + DDD léger**.
- **Sécurité des pièces d'identité et de l'argent** → non négociable, guards + stockage privé + audit (voir CLAUDE.md Partie 7).
- **Séquencement** → roadmap en vagues V0→V7 (voir [03-roadmap.md](03-roadmap.md)).
