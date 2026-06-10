# Handoff — Synelia Cowork

> Espace de travail IA **collaboratif** pour la Direction Data & IA du Groupe Synelia.
> Projets partagés, conversations multi‑utilisateurs en temps réel, routines IA récurrentes,
> bibliothèque de prompts, artefacts générés, et console d'administration de l'espace.

---

## Overview

**Synelia Cowork** est une application web interne : une équipe partage des **projets**, ouvre des
**conversations avec l'IA** à plusieurs, et voit en temps réel ce que font les autres (présence,
« untel rédige… », « l'IA répond… »). L'IA produit des **artefacts** (documents, tableurs, diagrammes)
attachés aux conversations, et des **routines** exécutent des prompts de façon récurrente
(veille hebdo, suivi de constats, rapports mensuels…).

Le produit comprend 4 surfaces :

| Surface | Fichier de référence | Rôle |
|---|---|---|
| **Connexion** | `Synelia Cowork - Connexion.html` | Authentification (split brand / formulaire) |
| **Application** | `Synelia Cowork.html` | Le workspace : sidebar, dashboard, projet, conversation, bibliothèque, artefacts, routines |
| **Administration** | `Synelia Cowork - Admin.html` | Console admin : vue d'ensemble, membres, projets, usage, gouvernance |
| **Exploration dashboard** | `Synelia Cowork - Tableau de bord (3 variations).html` | 3 variations de mise en page du tableau de bord, sur un canvas comparatif (référence de design uniquement) |

---

## About the Design Files

Les fichiers de ce dossier sont des **références de design réalisées en HTML/CSS + React via Babel
in‑browser** — des prototypes montrant l'apparence et le comportement visés. **Ce ne sont pas du code de
production à copier tel quel.**

La tâche est de **recréer ces designs dans l'environnement applicatif cible** en suivant ses conventions
établies (composants, routing, state management, librairies). S'il n'existe pas encore d'environnement,
choisir la stack adaptée — une base **React + TypeScript + Vite** avec un routeur (React Router) et CSS
Modules ou Tailwind convient parfaitement, car les prototypes sont déjà structurés en composants React.

Détails d'implémentation des prototypes à **ne pas reproduire** en production :
- React/ReactDOM/Babel chargés par CDN et JSX transpilé dans le navigateur → utiliser un vrai build (Vite/Next).
- Les composants partagent un scope global (`window`) et les données viennent d'un objet global `window.SYN`
  (voir `src/data.js`) → remplacer par des imports de modules et un vrai accès aux données (API/store).
- Icônes **Lucide** via CDN UMD, peintes impérativement → utiliser `lucide-react`.
- Le temps réel est **simulé** (timers, états figés dans les données) → à brancher sur un vrai canal
  (WebSocket / SSE / présence type Liveblocks/Yjs) si le temps réel collaboratif est retenu.

---

## Fidelity

**Haute‑fidélité (hifi).** Couleurs, typographie, espacements, rayons, ombres et interactions sont
définitifs et proviennent du **design system Synelia** (voir `src/tokens.css`). Recréer l'UI au pixel près
en réutilisant les librairies et patterns de la codebase cible. Tous les tokens sont des variables CSS —
les mapper directement vers le système de la codebase.

---

## Design language (résumé)

- **Violet `#4B2882`** = couleur signature (sidebar, en‑têtes, éléments actifs). **Violet sombre `#2D1557`**,
  **violet moyen `#6B3FA0`** (hover/bordures actives).
- **Magenta `#C0297A`** = accent **ponctuel uniquement** (traits, soulignés, badges, bordure gauche, puces).
  Règle d'or : violet domine, magenta accentue — jamais à 50/50.
- Fonds : blanc `#FFFFFF`, gris très clair `#F5F4F8` (sections/lignes alternées). **Pas de dégradés violets.**
- Type : **Montserrat** (titres, 500/600/700), **Open Sans** (corps, interligne 1.6), **JetBrains Mono** (code).
- Rayons : 4px champs/boutons · 8px cartes · 16px panneaux/modales. **Ombres teintées violet**, jamais noires.
- Icônes : **Lucide**, trait ~1.75px.
- Langue : **français** (vouvoiement), ton sobre/expert, **pas d'emoji** en contexte formel.
- Mouvement sobre : fondus + légers translate‑Y, pas de bounce ni boucles infinies.

---

## Screens / Views

### 1. Connexion (`Synelia Cowork - Connexion.html`)
- **Layout** : 2 colonnes plein écran. Gauche = panneau de marque violet (wordmark « SYNELIA · Cowork »,
  kicker « Direction Data & IA », titre d'accroche, trait magenta, lead, **bloc présence** avec pile
  d'avatars + point « live » + « 5 coéquipiers actifs »). Droite = carte formulaire centrée.
- **Formulaire** : champ e‑mail (icône `mail`, placeholder `prenom.nom@synelia.tech`), champ mot de passe
  (icône `lock`, bouton afficher/masquer `eye`/`eye-off`), case « Rester connecté » (cochée), bouton primaire
  « Se connecter » (`arrow-right`), lien « Demander un accès », mention « Connexion sécurisée ».
- **Comportement** : validation (regex e‑mail, mot de passe requis), état d'erreur par champ effacé à la
  saisie, bouton passe en « Connexion… » puis redirige vers l'app après ~650 ms.

### 2. Application (`Synelia Cowork.html`)
Shell : **Sidebar** (264px) + **main** (Topbar + contenu). Vues pilotées par l'état `view` :
`home | library | artifacts | routines | project | chat`.

- **Sidebar** (`src/sidebar.jsx`) : marque, navigation (Accueil, Bibliothèque de prompts, Artefacts,
  Routines), liste des projets (puce couleur + icône + nom + présence), bouton « Nouveau projet »,
  bloc utilisateur courant / réglages. Devient un tiroir (drawer) sur mobile, ouvert via le burger de la topbar,
  fermé par un scrim.
- **Topbar** (`src/app.jsx`) : burger (mobile), fil d'ariane (« Data & IA › … »), recherche centrale
  (placeholder + raccourci ⌘K), bouton inviter (`user-plus`), notifications (`bell` + point).
- **Dashboard / Accueil** (`src/dashboard.jsx`) : cartes de projets, flux d'activité du département en
  temps réel (`ACTIVITY`), accès rapides. Actions : ouvrir projet, ouvrir conversation, nouveau projet, inviter.
- **Vue Projet** (`src/project.jsx`) : en‑tête projet (nom, description, membres, visibilité public/privé
  basculable), onglets / sections : conversations, fichiers, routines, artefacts. Lancer une conversation
  depuis un prompt, créer une conversation, inviter, basculer la visibilité (toast de confirmation).
- **Conversation** (`src/chat.jsx` + `src/rightpanel.jsx`) : fil de messages (utilisateur / IA, pièces
  jointes, markdown léger), **co‑présence en temps réel** (un coéquipier tape, l'IA répond en streaming),
  composeur. Panneau latéral droit = artefacts / fichiers / présents. **3 dispositions** pilotées par le
  tweak `layout` :
  - `centered` — conversation centrée + panneau latéral
  - `canvas` — conversation à gauche, artefact épinglé à droite
  - `wide` — conversation pleine largeur, artefacts insérés en ligne
- **Bibliothèque de prompts** (`src/library.jsx`) : catégories (`PROMPT_CATS`), cartes de prompts
  (`PROMPTS` — titre, auteur, nb d'usages, badges « épinglé »/« officiel », description, corps). Actions :
  utiliser un prompt (modale de lancement vers une conversation), nouveau prompt.
- **Artefacts** (`src/artifacts.jsx`) : galerie globale (`ARTIFACTS` — type, créateur, date, projet,
  partagé/live). Ouvre une modale d'aperçu d'artefact.
- **Routines** (`src/project.jsx` / vue dédiée) : liste des routines (`ROUTINES` — cadence, propriétaire,
  prochaine exécution, statut actif/pausé), prompt confié à l'IA, et **historique d'exécutions (runs)**
  feuilletable avec sortie markdown.
- **Modales** (`src/modals.jsx`) : Nouveau projet, Inviter, Nouveau prompt, Nouvelle conversation, Aperçu
  d'artefact, Lancer depuis un prompt. **Toasts** de confirmation.

### 3. Administration (`Synelia Cowork - Admin.html`)
Console admin (`#admin-root`, données dans `src/admin-data.js`) avec sections :
- **Vue d'ensemble** (`admin-overview.jsx`) — KPI de l'espace.
- **Membres** (`admin-members.jsx`) — annuaire, rôles, statuts.
- **Projets** (`admin-projects.jsx`) — gouvernance des espaces, visibilité.
- **Usage** (`admin-usage.jsx`) — consommation / adoption.
- **Gouvernance** (`admin-governance.jsx`) — politiques, sécurité, conformité.
Shell admin partagé : `admin-shared.jsx` + `admin-app.jsx`, styles dans `src/admin.css`.

### 4. Variations de tableau de bord (`...3 variations.html`)
Trois mises en page candidates du dashboard présentées côte‑à‑côte sur un canvas comparatif
(`src/dashboard-variations.jsx` + `src/design-canvas.jsx`). **Outil d'exploration** — à utiliser pour
choisir une direction, pas une surface à livrer telle quelle.

---

## Interactions & comportements clés
- **Navigation** par état (`view`, `activeProject`, `activeChat`) — à mapper sur des routes.
- **Temps réel simulé** : présence (`online`/`last`), états de conversation `live` / `liveState`
  (`ai-typing`, `user-typing`), réponse IA streamée (`LIVE_AI_REPLY`), flux d'activité `ACTIVITY`.
- **Lancement de conversation depuis un prompt** : passe un texte initial à la conversation.
- **Visibilité projet** public/privé basculable (toast).
- **Création** : projet, conversation, prompt (optimiste, avec toast).
- **Tweaks** (panneau de prototypage, `src/tweaks-panel.jsx`) : `layout` (centered/canvas/wide) et
  `accent` (couleur d'accent). **À ne pas porter en production** — c'est un outil de design ; conserver
  `centered` comme disposition par défaut sauf indication contraire.

## State management (à prévoir)
- Utilisateur courant (`ME`), équipe (`TEAM`).
- Projets + appartenance + visibilité.
- Conversations par projet, messages, présence/live, streaming IA.
- Routines + runs. Bibliothèque de prompts. Artefacts. Flux d'activité.
- Vue active / projet actif / conversation active / modale ouverte / toasts.

---

## Design tokens
Source unique : **`src/tokens.css`** (47 variables CSS). Extrait :

**Couleurs** — primary `#4B2882` · primary-dark `#2D1557` · primary-mid `#6B3FA0` · accent `#C0297A` ·
accent-dark `#A0206A` · bg `#FFFFFF` · bg-alt `#F5F4F8` · text `#1C1C2E` · text-sub `#3D3550` ·
text-muted `#9A90A8` · border `#9A90A8` · border-soft `#E7E3EE` · success `#00C48C` · warning `#FF6B35` ·
error `#E63946` · info `#00AEEF` (+ fonds de callouts `--bg-*`).

**Type** — display `Montserrat` · body `Open Sans` (interligne 1.6) · mono `JetBrains Mono`.
Échelle : xs .75 / sm .875 / base 1 / lg 1.25 / xl 1.75 / 2xl 2.5 / 3xl 3.25 rem.

**Espacement** (base 8px) — xs 4 · sm 8 · md 16 · lg 24 · xl 32 · 2xl 48 · 3xl 64 px.
**Rayons** — sm 4 · md 8 · lg 16 · pill 999 px.
**Ombres** (teintées violet) — sm `0 1px 3px rgba(45,21,87,.08)` · md `0 4px 12px rgba(45,21,87,.12)` ·
lg `0 8px 32px rgba(45,21,87,.16)`.

---

## Assets & dépendances
- **Police** : Montserrat / Open Sans / JetBrains Mono (Google Fonts). Pour l'offline, fournir des `.woff2`
  et remplacer le `@import` de `tokens.css` par des `@font-face`.
- **Icônes** : Lucide (`lucide-react` en production).
- **Logo** : le design system note que le logo officiel n'a pas pu être récupéré ; un **wordmark
  typographique de substitution** est utilisé (« SYNELIA · Cowork »). → **Fournir le logo officiel** (PNG/SVG)
  pour la production.
- Pas d'images bitmap dans les prototypes (illustrations géométriques / placeholders).

---

## Files (référence)
Dans `design_files/` :
- `Synelia Cowork.html`, `... - Connexion.html`, `... - Admin.html`, `... - Tableau de bord (3 variations).html`
- `src/tokens.css` — **design tokens (source)** · `src/app.css`, `src/login.css`, `src/admin.css`,
  `src/dashboard-variations.css` — styles
- `src/data.js`, `src/admin-data.js` — **données simulées** (modèle de données de référence)
- `src/app.jsx`, `src/sidebar.jsx`, `src/dashboard.jsx`, `src/project.jsx`, `src/chat.jsx`,
  `src/rightpanel.jsx`, `src/library.jsx`, `src/artifacts.jsx`, `src/modals.jsx`, `src/primitives.jsx`
  — composants de l'app
- `src/admin-*.jsx` — composants de la console admin
- `src/dashboard-variations.jsx`, `src/design-canvas.jsx` — exploration (non‑livrable)
- `src/tweaks-panel.jsx` — panneau de tweaks (outil de prototypage, **non‑livrable**)

> Ouvrir les fichiers `.html` dans un navigateur pour voir les designs en action.
