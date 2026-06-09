# Synelia Nexus — Design Brief (source: Synelia Cowork)

> Reference: `~/cache/documents/doc_87cc885871ab_Claude cowork.zip` (cloned at `/tmp/cc-zip/`)
> Author: Olive, 2026-06-09 — direction the UI should evolve toward.

## TL;DR

Synelia Cowork (the reference build) is **not** a chat app with a sidebar of files. It's a **multi-user AI workspace** where the unit of organization is the **project** (shared team space), the **artifact** is the *output* the AI produces inside a conversation, and the whole thing is a French, **purple-magenta Synelia-branded** product. The current Synelia Nexus build is structurally right (workspaces, threads, files, scheduled tasks) but visually a generic Vercel template, and the artifact model is **wrong** (I built "users create artifacts in a dialog" — the truth is "the AI produces them during a conversation, users only consume and share").

## The 5 things to fix in priority

1. **Artifacts are AI outputs, not user inputs.** Remove any "Create artifact" UI. The AI tool produces them. The page is a read-only gallery.
2. **Clicking an artifact opens a modal, not a route.** The modal shows the artifact content (table / diagram / doc), with a sharing footer.
3. **Project view is tabbed**: Conversations · Artefacts · Connaissances · Routines · Équipe — same horizontal tabs as the reference.
4. **Adopt the Synelia design tokens**: violet `#4B2882`, magenta `#C0297A`, Montserrat display + Open Sans body, magenta accent rule under section titles.
5. **French copy throughout the UI** (the reference is a French product, and so is the Synelia Nexus user base).

## Visual system (the real one — `src/tokens.css`)

| Token | Value | Use |
|---|---|---|
| `--color-primary` | `#4B2882` | Synelia violet — buttons, H1, links |
| `--color-primary-dark` | `#2D1557` | Sidebar background, premium sections |
| `--color-primary-mid` | `#6B3FA0` | Hover, active borders |
| `--color-accent` | `#C0297A` | Magenta — accent rule, pin icon, badges |
| `--color-bg` | `#FFFFFF` | Page background |
| `--color-bg-alt` | `#F5F4F8` | Alternate sections, sidebar content area |
| `--color-text` | `#1C1C2E` | Body text |
| `--color-text-sub` | `#3D3550` | Subtitles, callouts |
| `--color-text-muted` | `#9A90A8` | Secondary text, placeholders |
| `--color-success` | `#00C48C` | Positive state |
| `--color-warning` | `#FF6B35` | Warning state |
| `--color-error` | `#E63946` | Error state |
| `--color-info` | `#00AEEF` | Info callouts |
| `--font-display` | Montserrat | H1/H2/H3, project titles, buttons |
| `--font-body` | Open Sans | Body, form labels |
| `--font-mono` | JetBrains Mono | Code, IDs, tokens |
| `--radius-sm/md/lg` | 4 / 8 / 16 px | Buttons / cards / panels |
| `--shadow-sm/md/lg` | rgba(45,21,87,0.08/12/16) | Cards / popovers / modals |
| `.synelia-rule` | 56×3 px magenta | The signature accent line under titles |

Webfonts via Google Fonts: `Montserrat 400/500/600/700/800`, `Open Sans 400/600/700 italic`, `JetBrains Mono 400/500`. (Already in the existing global CSS — verify before re-adding.)

## Iconography

Lucide v0.469.0 via CDN, rendered as `<i data-ic="name" data-size="17">` and a small bootstrap that converts the attribute into an SVG. Keep the same convention when porting to React: a tiny `<Icon name="..." size={17} />` component backed by `lucide-react`.

Icons that matter: `shield-check`, `cloud`, `lock`, `graduation-cap` (project emojis); `message-square`, `layout-grid`, `folder`, `repeat`, `users` (project tabs); `file-text`, `table-2`, `git-fork` (artifact kinds); `globe`, `share-2`, `link`, `copy`, `download` (sharing); `sparkles`, `pin`, `user-plus` (utility).

## Information architecture

### Routes
- `/` — Dashboard (greet + project cards + routines + recent chats)
- `/p/[id]` — Project view with 5 tabs (Conversations · Artefacts · Connaissances · Routines · Équipe)
- `/p/[id]/t/[id]` — Thread (chat canvas) inside a project
- `/artefacts` — Global artifact gallery (cross-project, with project filter chips and kind filter)
- `/artefacts/[id]` — Currently a modal; if deep-linked, show as modal over `/artefacts` (or as a clean page — see "open questions")
- `/bibliotheque-prompts` — Prompt library (pinned prompts, category chips, "Utiliser" to start a chat with the prompt)
- `/routines` — Master-detail view (list left, selected routine + run history right)
- `/activite` — Team activity feed
- `/admin` — Overview, members, projects, data (admin sub-routes)

### The 3 artifact kinds (NOT 4)
- **Document** — markdown body rendered as bullets
- **Tableur** — `risk-table` with rows (header bold)
- **Diagramme** — `diag-stack` with colored layer cards (Présentation / Services / Données / Sécurité)

No "code" or "image" as separate kinds — those are rendered inside the chat canvas, not as artifacts.

## Component shapes that must match

### Sidebar (fixed left, `--color-primary-dark` background, 264 px)
- `SYNELIA •` wordmark + magenta dot + `COWORK` (uppercase, tracking)
- Department card: violet chip + "Direction Data & IA · 6 membres" + collapse chevron
- White "Nouveau projet" button (full width, `box-shadow: var(--shadow-sm)`, hovers to `shadow-md`)
- Nav: Accueil / Activité de l'équipe (count badge) / Bibliothèque de prompts / Artefacts / Routines
- Section: "PROJETS PARTAGÉS" (uppercase, muted) + list of project rows (icon + name + live dot)
- Footer: current user pill (avatar + name + role) + settings gear

### Project view header
- Big project icon (colored square, 56 px, white Lucide icon)
- H1 project name + description
- Right side: visibility badge (Privé / Public) as a clickable button opening a modal, avatar stack, "Inviter" ghost button, "Nouvelle conversation" primary violet button
- 5 horizontal tabs: Conversations · Artefacts · Connaissances · Routines · Équipe, each with a count

### Artifact gallery card (in project tab or global view)
- 280×160 px card
- Top: colored kind-icon chip (violet for doc, emerald for tableur, blue for diagramme)
- Title (bold), kind chip + "En cours" pink live pill if streaming
- (Global view only) Project chip below title
- Footer: avatar + first name + "·" + relative time + "Lien actif" green link icon if shared

### Artifact modal
- Overlay + centered modal (max 880 px)
- Header: kind-icon chip + title + "Document généré par l'IA · Awa · il y a 35 min" + close X
- Body: project chip (small) + title (large H1) + magenta rule + content (table/diagram/bullets) + share box (when toggled)
- Footer: status line left ("Lien de partage actif" green with globe icon, OR "Visible par les membres du projet" muted with lock icon) + "Télécharger" ghost + "Partager par lien" primary (or "Gérer le lien" ghost if already shared)
- Share box: globe/lock icon + scope label + description + dropdown (Membres / Public (lien)) + link row with copy button

### Dashboard hero
- Greeting: "Bonjour, Awa." (H1 violet) + "Votre équipe travaille sur 3 projets en ce moment." (muted)
- Right: "Inviter" ghost + "Nouveau projet" primary
- 56×3 px magenta rule under the hero
- 2-col grid: projects cards left (4 col) + recent activity right (2 col)
- Project card: colored icon, name (H3 violet), description (muted), stats row (chats, files, avatar stack)

### Thread (chat) canvas
- Header: breadcrumb (project) + thread title
- Messages scroll area
- Composer at bottom: paperclip / Connaissances / Routine tools + send button
- 4 suggest chips above: "Consolide les constats en matrice de risques" / "Génère un plan de remédiation priorisé" / "Rédige une note de synthèse pour le COPIL" / "Analyse les écarts PCI-DSS du référentiel"

## Behavioral rules (from the reference data layer)

- **Live state** on chats: someone is typing OR the AI is responding. Show "L'IA répond" (sparkles icon) or "Awa écrit…" (typing dots). Project view shows a pink live tag on the card when any of its chats is live.
- **Live state** on artifacts: AI is generating. Show "En cours" pill on the card.
- **Share scope** is binary: members-only (default) or public-by-link. Switching to public enables a per-artifact `https://cowork.synelia.tech/a/<id>-<slug>` URL that anyone can read without auth.
- **Visibility scope** on project: Privé (members only) or Public dans le workspace (all Synelia workspace members can read; only invited members can contribute).

## Open questions for the user

1. **French only, or French + English toggle?** The reference is French-only.
2. **Artifact deep-link URL pattern**: keep the current `/w/[slug]/artifacts/[id]` route, or move to `/artefacts/[id]` (global, simpler sharing)?
3. **Routines view**: master-detail (list left + selected routine + run history right) is the reference. Confirm we want the same.
4. **Prompt library** (`/bibliotheque-prompts`): the reference has it as a first-class surface. Out of MVP scope?
5. **Admin sub-routes**: include in MVP or defer?

## The first concrete deliverable

The artifact model fix is the highest-leverage change. New shape:
- `app/w/[slug]/page.tsx` (workspace hub) becomes a tabbed project view with **Artefacts** as a tab, no "+ New artifact" button
- The `CreateArtifactButton` component I just added gets **deleted**
- `app/w/[slug]/artifacts/page.tsx` becomes a read-only gallery (cards with kind chips)
- The `/w/[slug]/artifacts/[id]` route stays as a fallback for sharing, but the primary interaction is a modal opened from the gallery
- Add a new global route `/artefacts` (across all projects the user is a member of) with project filter chips and kind segmented control — same shape as the reference `ArtifactsView`
- All UI copy goes French; design tokens get the Synelia violet/magenta palette + Montserrat/Open Sans
