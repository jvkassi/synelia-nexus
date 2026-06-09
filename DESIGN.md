---
version: alpha
name: Synelia Nexus
description: Violet-magenta multi-user AI workspace for Synelia. French copy. The Synelia cowork reference built on a Next.js + AI SDK substrate.
colors:
  primary: "#4B2882"
  primary-dark: "#2D1557"
  primary-mid: "#6B3FA0"
  accent: "#C0297A"
  background: "#FFFFFF"
  background-alt: "#F5F4F8"
  text: "#1C1C2E"
  text-sub: "#3D3550"
  text-muted: "#9A90A8"
  success: "#00C48C"
  warning: "#FF6B35"
  error: "#E63946"
  info: "#00AEEF"
  white: "#FFFFFF"
  kind-doc: "#4B2882"
  kind-tableur: "#00C48C"
  kind-diagramme: "#00AEEF"
  live-pill: "#C0297A"
typography:
  h1:
    fontFamily: Montserrat
    fontSize: 2.25rem
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  h2:
    fontFamily: Montserrat
    fontSize: 1.625rem
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  h3:
    fontFamily: Montserrat
    fontSize: 1.25rem
    fontWeight: 600
    lineHeight: 1.3
  body-md:
    fontFamily: Open Sans
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.55
  body-sm:
    fontFamily: Open Sans
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: Open Sans
    fontSize: 0.8125rem
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.02em"
  button:
    fontFamily: Montserrat
    fontSize: 0.875rem
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.01em"
  eyebrow:
    fontFamily: Open Sans
    fontSize: 0.6875rem
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.12em"
  code:
    fontFamily: JetBrains Mono
    fontSize: 0.875rem
    fontWeight: 400
rounded:
  sm: 4px
  md: 8px
  lg: 16px
  pill: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  sidebar-width: 264px
  composer-height: 72px
  modal-max: 880px
  artifact-card: 280px
  artifact-card-h: 160px
  rule-width: 56px
  rule-height: 3px
  icon-sm: 14px
  icon-md: 17px
  icon-lg: 20px
  avatar-sm: 24px
  avatar-md: 32px
  avatar-stack-overlap: 10px
components:
  synelia-rule:
    size: 56px
    height: 3px
    backgroundColor: "{colors.accent}"
    rounded: "{rounded.sm}"
  sidebar-root:
    width: 264px
    backgroundColor: "{colors.primary-dark}"
    textColor: "{colors.white}"
    padding: 24px
  sidebar-wordmark:
    typography: "{typography.eyebrow}"
    textColor: "{colors.white}"
  sidebar-dot:
    size: 6px
    backgroundColor: "{colors.accent}"
    rounded: "{rounded.pill}"
  sidebar-dept-chip:
    backgroundColor: "{colors.primary-mid}"
    textColor: "{colors.white}"
    rounded: "{rounded.md}"
    padding: 8px
  sidebar-section-label:
    typography: "{typography.eyebrow}"
    textColor: "{colors.text-muted}"
  sidebar-project-row:
    rounded: "{rounded.md}"
    padding: 8px
    textColor: "{colors.white}"
  sidebar-project-row-active:
    backgroundColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: 8px
    textColor: "{colors.white}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 10px
  button-primary-hover:
    backgroundColor: "{colors.primary-mid}"
    textColor: "{colors.white}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 10px
  button-ghost:
    backgroundColor: "{colors.white}"
    textColor: "{colors.primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 10px
  button-ghost-hover:
    backgroundColor: "{colors.background-alt}"
    textColor: "{colors.primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 10px
  hero-greeting:
    typography: "{typography.h1}"
    textColor: "{colors.primary}"
  hero-subline:
    typography: "{typography.body-md}"
    textColor: "{colors.text-muted}"
  project-header-title:
    typography: "{typography.h1}"
    textColor: "{colors.text}"
  project-header-desc:
    typography: "{typography.body-md}"
    textColor: "{colors.text-sub}"
  project-icon-tile:
    size: 56px
    backgroundColor: "{colors.primary}"
    rounded: "{rounded.md}"
    textColor: "{colors.white}"
  tab:
    typography: "{typography.label}"
    textColor: "{colors.text-muted}"
    padding: 12px
  tab-active:
    typography: "{typography.label}"
    textColor: "{colors.primary}"
    padding: 12px
  tab-count:
    typography: "{typography.label}"
    textColor: "{colors.text-muted}"
  visibility-badge:
    typography: "{typography.eyebrow}"
    backgroundColor: "{colors.background-alt}"
    textColor: "{colors.text-sub}"
    rounded: "{rounded.pill}"
    padding: 6px
  artifact-card:
    size: 280px
    height: 160px
    backgroundColor: "{colors.white}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: 12px
  artifact-kind-chip-doc:
    backgroundColor: "{colors.kind-doc}"
    textColor: "{colors.white}"
    typography: "{typography.eyebrow}"
    rounded: "{rounded.sm}"
    padding: 4px
  artifact-kind-chip-tableur:
    backgroundColor: "{colors.kind-tableur}"
    textColor: "{colors.primary-dark}"
    typography: "{typography.eyebrow}"
    rounded: "{rounded.sm}"
    padding: 4px
  artifact-kind-chip-diagramme:
    backgroundColor: "{colors.kind-diagramme}"
    textColor: "{colors.primary-dark}"
    typography: "{typography.eyebrow}"
    rounded: "{rounded.sm}"
    padding: 4px
  artifact-live-pill:
    backgroundColor: "{colors.live-pill}"
    textColor: "{colors.white}"
    typography: "{typography.eyebrow}"
    rounded: "{rounded.pill}"
    padding: 4px
  artifact-modal-overlay:
    backgroundColor: "#1C1C2E"
  artifact-modal:
    size: 880px
    backgroundColor: "{colors.white}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: 24px
  modal-title:
    typography: "{typography.h1}"
    textColor: "{colors.text}"
  modal-share-link-button:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 8px
  chat-composer:
    height: 72px
    backgroundColor: "{colors.white}"
    rounded: "{rounded.lg}"
    padding: 12px
  chat-bubble-user:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 12px
  chat-bubble-assistant:
    backgroundColor: "{colors.background-alt}"
    textColor: "{colors.text}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 12px
  suggest-chip:
    backgroundColor: "{colors.white}"
    textColor: "{colors.primary}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: 8px
  suggest-chip-hover:
    backgroundColor: "{colors.background-alt}"
    textColor: "{colors.primary}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: 8px
  input-field:
    backgroundColor: "{colors.white}"
    textColor: "{colors.text}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 10px
  input-field-focus:
    backgroundColor: "{colors.white}"
    textColor: "{colors.text}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 10px
  card-default:
    backgroundColor: "{colors.white}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: 16px
  callout-info:
    backgroundColor: "#E6F7FD"
    textColor: "{colors.text-sub}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 12px
  callout-success:
    backgroundColor: "#E0FAF1"
    textColor: "{colors.text-sub}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 12px
  callout-warning:
    backgroundColor: "#FFEDE3"
    textColor: "{colors.text-sub}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 12px
  callout-error:
    backgroundColor: "#FBE6E8"
    textColor: "{colors.text-sub}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 12px
---

## Overview

Synelia Nexus is a **multi-user AI workspace** for the Synelia group (African ESN focused on Telcos and Banking). The unit of organization is the **project** (shared team space), the unit of conversation inside it is the **thread**, and the unit of output the AI produces is the **artefact** (Document · Tableur · Diagramme). The whole product is in French.

Visually, the identity is **violet-magenta Synelia**: a deep, architectural violet as the structural color, and a sharp magenta as the single accent. White surfaces dominate; the magenta is used sparingly — the 56×3 px rule under titles, the live-state pill, the dot in the wordmark, the pin icon. Anything that needs to *shout* gets the magenta. Anything structural is violet. Everything else is neutral text on white.

The reference build (`Synelia Cowork`) is the source of truth for shape, tone, and information architecture. This DESIGN.md encodes the tokens for agents that will build features against the existing Next.js + AI SDK substrate (`app/`, `components/`, `lib/`).

## Colors

- **`primary` `#4B2882` — Synelia Violet.** Buttons, primary CTAs, H1 hero greeting, H3 project card titles, links, active tab indicator, composer focus ring. The structural color.
- **`primary-dark` `#2D1557` — Deep Violet.** Sidebar background, premium/dense sections, modal overlay scrim variant. ~10% darker than primary; read it as "this is the chassis, not the call to action."
- **`primary-mid` `#6B3FA0` — Mid Violet.** Hover state on primary buttons, active borders, department chip in sidebar, focus outlines.
- **`accent` `#C0297A` — Magenta.** The single accent. The 56×3 px rule under section titles (`synelia-rule`). The dot in the `SYNELIA •` wordmark. The "En cours" live pill on streaming artifacts. The pin icon. Nothing else gets magenta by default — overuse kills the signal.
- **`background` `#FFFFFF` — Page surface.** Default canvas.
- **`background-alt` `#F5F4F8` — Cool gray-violet.** Sidebar inner content, callout backgrounds base, hover state on ghost buttons, alt sections. Slight violet tint to harmonize with the primary.
- **`text` `#1C1C2E` — Ink.** Body text, modal titles, project names. Slight violet undertone rather than pure black — softer on the eye, more on-brand.
- **`text-sub` `#3D3550` — Subtitle.** Subtitles, descriptions, secondary headings.
- **`text-muted` `#9A90A8` — Muted.** Placeholders, captions, sidebar section labels (uppercase, eyebrow), count badges.
- **State colors.** `success #00C48C` (positive status, "Lien actif"), `warning #FF6B35`, `error #E63946`, `info #00AEEF`. Each has a paired ~10% tint background for callouts (see `callout-*` components).
- **Kind chip colors** map 1:1 to artifact types and are *not* design-system generics: `kind-doc` = violet (the primary), `kind-tableur` = emerald (success), `kind-diagramme` = cyan (info). The card icon chip on the top-left of every artifact card carries the kind identity.
- **`live-pill` `#C0297A`** mirrors `accent` — same magenta, but a semantic alias for "the AI is currently generating this artefact."

WCAG check (AA / 4.5:1 for body text, 3:1 for large text and UI):
- `text` on `background`: ~15:1 ✓
- `text` on `background-alt`: ~13:1 ✓
- `text-sub` on `background`: ~11:1 ✓
- `text-muted` on `background`: ~4.6:1 ✓ (passes for body, marginal for fine print)
- `white` on `primary` (button): ~9:1 ✓
- `white` on `primary-dark` (sidebar): ~13:1 ✓
- `white` on `accent` (live pill, magenta rule caption): ~4.9:1 ✓
- `primary` on `background-alt` (suggest chip default): ~7:1 ✓

## Typography

Three families, each with a single job:

- **Montserrat** — Display + UI chrome. All H1/H2/H3, project names, button labels, the wordmark, tab labels. Weights: 400 / 500 / 600 / 700 / 800. 600+ for H3 and above; 600 for buttons; 700 for hero H1.
- **Open Sans** — Body. All paragraph copy, form labels, subtitles, captions. 400 body, 600 labels, 700 italic for emphasis only. The 0.6875 rem / 700 / 0.12 em letter-spacing eyebrow (used for "PROJETS PARTAGÉS", kind chips, section labels) is Open Sans, *not* Montserrat — it's a small all-caps label, not a heading.
- **JetBrains Mono** — Code, IDs, tokens, share-link URLs. 400 regular, 500 for emphasized tokens.

Webfonts load from Google Fonts in `app/globals.css` (`@import url(...)`). All three families are preloaded; no FOUT workaround is needed beyond `font-display: swap`.

The 56×3 px **`.synelia-rule`** is the typographic signature. Every H1, H2, and section title on a content surface gets one immediately under the title, 8 px below, full magenta. It's a divider that says "this is a Synelia page" without needing the wordmark.

## Layout

The product is a two-column shell: a **fixed 264 px sidebar on the left** and a fluid content area on the right. The sidebar is dark (`primary-dark`) and runs the full viewport height. The content area is white and scrolls independently.

**Sidebar (264 px, fixed left, `primary-dark` background)**
- Top: `SYNELIA • COWORK` wordmark (Montserrat eyebrow, uppercase, white) with a 6 px magenta dot replacing the bullet between `SYNELIA` and `COWORK`.
- Below: a department card (violet chip, "Direction Data & IA · 6 membres", collapse chevron) on `primary-mid`.
- A full-width white "Nouveau projet" button (`box-shadow: var(--shadow-sm)`, hover `shadow-md`).
- Primary nav: Accueil / Activité de l'équipe (with count badge) / Bibliothèque de prompts / Artefacts / Routines.
- Section: "PROJETS PARTAGÉS" eyebrow (muted on dark) + list of project rows (icon + name + green live dot when any thread is active). Active row gets `primary` background tint.
- Footer: current user pill (avatar + name + role) + settings gear icon.

**Content area** — page-level layout rules:
- Maximum content width is implicitly 1280 px on dashboard, 1080 px on thread, 880 px on artifact modal. Pages never horizontally scroll.
- Vertical rhythm uses an 8 px scale: `4 / 8 / 16 / 24 / 32 / 48`.
- The hero block on every page (Dashboard, Project view) is 64 px tall H1, 24 px subline, then `synelia-rule`, then content.
- Project view header layout: 56 px project icon tile · title + description (left), avatar stack + visibility badge + Inviter ghost + Nouvelle conversation primary (right), 24 px below: 5 horizontal tabs.
- Dashboard: 2-col grid — projects cards (4 col) + recent activity (2 col), 24 px gap.
- Thread canvas: full-bleed scroll area, composer pinned at the bottom, max-width 1080 px centered.

## Elevation & Depth

Three shadow levels, all tinted with violet undertones to match the primary:

- **`shadow-sm`**: `rgba(45, 21, 87, 0.08)` — cards at rest, default state, "Nouveau projet" button.
- **`shadow-md`**: `rgba(45, 21, 87, 0.12)` — popovers, dropdowns, hover on `shadow-sm` surfaces.
- **`shadow-lg`**: `rgba(45, 21, 87, 0.16)` — modals, artifact viewer, composer focus.

No `box-shadow` on the sidebar (it sits flush against the viewport edge — depth would fight the chassis feel). No `box-shadow` on the hero rule (it's already loud enough).

## Shapes

- **`rounded-sm` 4 px** — Buttons, kind chips, inputs, suggest chips, small pill labels.
- **`rounded-md` 8 px** — Cards, list rows, project icon tiles, dropdowns, the magenta rule's own corners.
- **`rounded-lg` 16 px** — Panels, modals, the chat composer, artifact card outer.
- **`rounded-pill` 999 px** — Visibility badges, live pills, suggest chips, status pills in the activity feed.

The radius scale is intentionally gentle. We're not a "rounded-everything" product — the corners are present, not declarative.

## Components

The component list below maps 1:1 to the building blocks called out in the reference build. New components inherit from these; do not invent new colors or radii.

**Buttons.** `button-primary` is the only high-emphasis action on a page. `button-ghost` is the secondary. There is no `button-secondary` or `button-tertiary` — those roles are taken by `button-ghost` and an unstyled text link respectively. Hover variants are separate entries (`button-primary-hover`, `button-ghost-hover`) with the lighter `primary-mid` and `background-alt` backgrounds. Disabled state is `text-muted` text on `background-alt` background, no shadow.

**Tabs.** The project view tab bar (5 tabs: Conversations · Artefacts · Connaissances · Routines · Équipe) is the canonical example. Active tab: `text: primary`, 2 px `primary` underline, 600 weight. Inactive: `text-muted`, 500 weight. The count next to each tab label (`tab-count`) is `text-muted`, never magenta.

**Cards.**
- `artifact-card` is 280×160 px, `rounded-md`, `shadow-sm`. The kind chip sits in the top-left corner, the title in 16 px Montserrat 600, the `live-pill` (if streaming) in the top-right. Footer row: avatar + first name · relative time · "Lien actif" green link icon if shared.
- `card-default` is the generic white panel used for project cards on the dashboard, member list rows, prompt library items.

**Modal — Artefact viewer.** Centered, max 880 px, `rounded-lg`, `shadow-lg`, scrim `rgba(28, 28, 46, 0.6)`. Header: kind chip + H1 title + "Document généré par l'IA · {author} · il y a {n} min" + close X. Body: small project chip + H1 (large) + magenta rule + content. Footer: status line left + Télécharger ghost + Partager par lien primary (or Gérer le lien ghost if already shared). Share box, when expanded, shows scope (Membres / Public (lien)) + copyable link.

**Sidebar nav row.** `sidebar-project-row` is the project list item. Inactive: transparent background, white text. Active: `primary` background (one step lighter than the `primary-dark` chassis), white text, small green live dot pulsing if any thread is active.

**Chat composer.** Pinned bottom of thread canvas, max-width 1080 px centered, 72 px tall, `rounded-lg`, `shadow-lg` on focus. Inside: paperclip / Connaissances / Routine icons on the left (16 px), textarea middle, send button right. 4 suggest chips sit 16 px above the composer, full-width row, `pill` rounded, ghost on white.

**Inputs.** Single shape for all text inputs and textareas. Default `input-field` is `white` on `background`, 1 px `border` (`#E0DCE8`), `rounded-md`. Focus state adds a 2 px `primary-mid` ring (not `box-shadow` — outline, for accessibility).

**Callouts.** Four kinds (`info`, `success`, `warning`, `error`), each a tinted `background-alt`-style fill with the matching state color text and a small icon on the left. Used sparingly — callouts interrupt reading, so we use them only when the content genuinely needs to interrupt.

**Project icon tile.** A 56×56 px square with `rounded-md`, filled with `primary` (or a kind-chip color for non-violet projects), white Lucide icon centered. The icon is one of `shield-check`, `cloud`, `lock`, `graduation-cap`, sized 24 px.

**Iconography.** Lucide v0.469.0 via `lucide-react`, default size 17 px (`icon-md`). The set we use:
- Project icons: `shield-check`, `cloud`, `lock`, `graduation-cap`
- Project tabs: `message-square`, `layout-grid`, `folder`, `repeat`, `users`
- Artifact kinds: `file-text` (Document), `table-2` (Tableur), `git-fork` (Diagramme — the fork tree shape)
- Sharing: `globe`, `share-2`, `link`, `copy`, `download`
- Utility: `sparkles` (AI responding), `pin` (magenta), `user-plus` (invite)

**Avatar stack.** Round avatars, 32 px, with a 10 px overlap, ordered by recency. Online presence is a 8 px green dot bottom-right.

## Do's and Don'ts

**Do**
- Put a `synelia-rule` (56×3 px magenta) under every H1, H2, and section title on a content surface. It's the identity.
- Default to white surfaces on a `background-alt` page tint. The product feels light; reserve `primary-dark` for the sidebar and modal scrims only.
- Use the French copy directly in the UI strings (see the design brief for the exact labels: "Conversations", "Artefacts", "Connaissances", "Routines", "Équipe", "Nouvelle conversation", "Partager par lien", "L'IA répond", "En cours").
- Show live state explicitly: a magenta `live-pill` on a streaming artifact, a `sparkles` icon + "L'IA répond" on the chat when the model is responding, a pulsing green dot on a project when any of its threads is live.
- Treat the 3 artefact kinds as a closed set: `Document`, `Tableur`, `Diagramme`. Don't add "code" or "image" as artefact kinds — those are inline chat canvas content, not artefacts.

**Don't**
- Don't use magenta outside the `.synelia-rule`, the wordmark dot, the pin icon, the live pill, and the share-scope globe indicator. Overuse kills the signal.
- Don't add a "Create artefact" button to the UI. Artefacts are AI outputs; the user only consumes, searches, and shares them. The AI tool creates them.
- Don't open artefacts as routes. They open as modals over the gallery; the route (`/artefacts/[id]`) is a deep-link fallback only.
- Don't use the `primary` violet for backgrounds of large text blocks — it's too dense. Keep primary as button / H1 / link color; let `background-alt` carry the visual weight for callouts and content surfaces.
- Don't ship a 4th or 5th button style. Primary + ghost + text link. Period.
- Don't localize the kind chip labels. They are proper-noun product concepts: "Document", "Tableur", "Diagramme".
- Don't use `oklch` values in the component layer — all component tokens are sRGB hex from this file. The current `globals.css` uses `oklch` as a Tailwind v4 convention; when porting a component to match this design system, translate the relevant `oklch(...)` value to its sRGB hex equivalent from the palette above.
- Don't put saturated state-color text on a tinted state-color background in callouts. State color carries the *icon*; the body copy uses `text-sub` on the tint so the line passes WCAG AA. This is the same reason the tableur and diagramme kind chips use `primary-dark` text on their saturated fill — white on emerald/cyan fails AA.
