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
  border: "#E0DCE8"
  border-soft: "#E7E3EE"
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
  3xl: 64px
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

Synelia Nexus is a **multi-user AI workspace** for the Synelia group — an Ivorian
digital-transformation leader (founded 2013, Abidjan) serving telcos, banks and
public institutions across West Africa. The unit of organization is the
**project** (a shared team space), the unit of conversation inside it is the
**thread**, and the unit of output the AI produces is the **artefact**
(Document · Tableur · Diagramme). The whole product is in French.

Visually, the identity is **violet-magenta Synelia**: a deep, architectural
violet as the structural color, and a sharp magenta as the single accent. White
surfaces dominate; magenta is used sparingly — the 56×3 px rule under titles,
the live-state pill, the dot in the wordmark, the pin icon. Anything that needs
to *shout* gets magenta. Anything structural is violet. Everything else is
neutral text on white.

This document is the **contract**. The YAML frontmatter is the token + component
spec; `app/globals.css` (`@theme inline` + `:root`) is its operative
implementation, and `lib/design-tokens.ts` mirrors it for feature code that needs
the palette in JS. The brand context, voice and visual rationale live in
[`design/BRAND.md`](design/BRAND.md); the upstream canonical token sheet is
[`design/colors_and_type.css`](design/colors_and_type.css). **To change a token,
edit this file first**, then update `globals.css` and `design-tokens.ts` to match.

## Guiding principles

Five principles outrank any single rule. When a choice isn't covered below,
decide with these.

1. **Violet structures, magenta punctuates.** Violet `#4B2882` carries the
   architecture (strong fills, headers, sidebar, covers); magenta `#C0297A` only
   *signals* (the rule, a bullet, a left border, the live pill). You never see
   them 50/50. If a composition has as much magenta as violet, that's a defect to fix.
2. **Institutional sobriety before effect.** Synelia speaks to banks, telcos and
   public institutions. Prefer the flat fill to the gradient, the hairline to the
   heavy shadow, breathing white to density. When torn between *more* and *less*, choose less.
3. **Grounded expertise.** The brand is West African and proud of it. The tone is
   confident and precise; imagery favors real product and African context. No
   generic "tech-startup" slop.
4. **Every formal artefact is framed.** Headers/footers, alternating-row tables,
   a clear type hierarchy. The frame isn't decoration — it's the brand's signature of seriousness.
5. **Consistency over surprise.** Reuse the established motifs (eyebrow + title +
   magenta rule, hairline card, left-border callout) rather than inventing.
   Variety comes from rhythm and scale, not new components.

## Colors

Each color has a **role** and a **budget** — the palette is not a free swatch set.
Target mix on a typical surface: **~60% neutral** (white / `background-alt`),
**~30% violet**, **~10% magenta + semantic**. That ratio keeps the brand
recognizable without saturating.

- **`primary` `#4B2882` — Synelia Violet.** Buttons, primary CTAs, H1 hero
  greeting, H3 project card titles, links, active tab indicator, composer focus
  ring. The structural color.
- **`primary-dark` `#2D1557` — Deep Violet.** Sidebar background, premium/dense
  sections, modal overlay scrim variant. ~10% darker than primary; read it as
  "this is the chassis, not the call to action."
- **`primary-mid` `#6B3FA0` — Mid Violet.** Hover state on primary buttons, active
  borders, department chip in sidebar, focus outlines.
- **`accent` `#C0297A` — Magenta.** The single accent. The 56×3 px rule under
  section titles (`synelia-rule`). The dot in the `SYNELIA •` wordmark. The
  "En cours" live pill on streaming artifacts. The pin icon. Nothing else gets
  magenta by default — overuse kills the signal.
- **`background` `#FFFFFF` — Page surface.** Default canvas.
- **`background-alt` `#F5F4F8` — Cool gray-violet.** Sidebar inner content,
  callout bases, hover state on ghost buttons, alternated sections. Slight violet
  tint to harmonize with the primary.
- **`text` `#1C1C2E` — Ink.** Body text, modal titles, project names. A slight
  violet undertone rather than pure black — softer on the eye, more on-brand.
- **`text-sub` `#3D3550` — Subtitle.** Subtitles, descriptions, secondary headings, callout body copy.
- **`text-muted` `#9A90A8` — Muted.** Placeholders, captions, sidebar section
  labels (uppercase eyebrow), count badges.
- **`border` `#E0DCE8` / `border-soft` `#E7E3EE`.** Structural 1 px borders and
  softer dividers on light surfaces. (The upstream charte uses `#9A90A8` for
  structural borders; the product softens this to `#E0DCE8` for the lighter,
  airier UI feel — keep this product value.)
- **State colors.** `success #00C48C` (positive status, "Lien actif"),
  `warning #FF6B35`, `error #E63946`, `info #00AEEF`. Each has a paired ~10% tint
  background for callouts (see `callout-*` components).
- **Kind chip colors** map 1:1 to artifact types and are *not* design-system
  generics: `kind-doc` = violet (primary), `kind-tableur` = emerald (success),
  `kind-diagramme` = cyan (info). The chip on the top-left of every artifact card
  carries the kind identity.
- **`live-pill` `#C0297A`** mirrors `accent` — same magenta, but a semantic alias
  for "the AI is currently generating this artefact."

**Cyan is a trap.** The source charte mentions `#00AEEF` for iconography *and*
forbids blue as a brand color (documented conflict, see `design/BRAND.md §4`).
Resolution: icons in violet or white; cyan confined to Info callouts and
`kind-diagramme`. Never introduce blue as a general accent.

WCAG check (AA — 4.5:1 body, 3:1 large text & UI):
- `text` on `background`: ~15:1 ✓ · `text` on `background-alt`: ~13:1 ✓
- `text-sub` on `background`: ~11:1 ✓ · `text-muted` on `background`: ~4.6:1 ✓ (body ok, marginal for fine print)
- `white` on `primary`: ~9:1 ✓ · `white` on `primary-dark`: ~13:1 ✓ · `white` on `accent`: ~4.9:1 ✓
- `primary` on `background-alt`: ~7:1 ✓

## Typography

Three families, each with a single job. **Max 2 families per document** (mono
only counts when there's real code).

- **Montserrat** — Display + UI chrome. All H1/H2/H3, project names, button
  labels, the wordmark, tab labels. Weights 400 / 500 / 600 / 700 / 800; 600+ for
  H3 and above, 600 for buttons, 700 for hero H1.
- **Open Sans** — Body. All paragraph copy, form labels, subtitles, captions. 400
  body, 600 labels, 700 italic for emphasis only, line-height 1.6. The 0.6875 rem
  / 700 / 0.12 em **eyebrow** (used for "PROJETS PARTAGÉS", kind chips, section
  labels) is Open Sans — a small all-caps label, not a heading.
- **JetBrains Mono** — Code, IDs, tokens, share-link URLs. 400 regular, 500 emphasis.

Hierarchy is read before it's read: an H1 never looks like an H2 — distinguish by
size *and* weight (700 → 600 → 500), not color alone. **MAJUSCULES** are owned for
institutional eyebrows/section titles; the recurring motif is *short uppercase
eyebrow → normal-case title → magenta rule*. Use it to open a section rather than
a bare heading.

Webfonts load from Google Fonts in `app/globals.css` (`@import url(...)`), all
three families, `font-display: swap`. The 56×3 px **`.synelia-rule`** is the
typographic signature — every H1, H2 and section title on a content surface gets
one 8 px under the title, full magenta. It says "this is a Synelia page" without
the wordmark.

## Layout

A two-column shell: a **fixed 264 px sidebar on the left** and a fluid content
area on the right. The sidebar is dark (`primary-dark`), full viewport height;
the content area is white and scrolls independently.

**Sidebar (264 px, fixed, `primary-dark`)**
- Top: `SYNELIA • COWORK` wordmark (Montserrat, uppercase, white) with a 6 px
  magenta dot for the bullet between `SYNELIA` and `COWORK`.
- A department card (violet chip on `primary-mid`, "Direction Data & IA · 6 membres", chevron).
- A full-width white "Nouveau projet" button (`shadow-sm`, hover `shadow-md`).
- Primary nav: Accueil / Activité de l'équipe (count badge) / Bibliothèque de prompts / Artefacts / Routines.
- Section "PROJETS PARTAGÉS" (muted eyebrow on dark) + project rows (icon + name +
  pulsing green dot when a thread is live). Active row: `primary` tint.
- Footer: current-user pill (avatar + name + email) + settings gear.

**Content area**
- Max content width: ~1280 px dashboard · 1080 px thread · 880 px artifact modal. Pages never scroll horizontally.
- Vertical rhythm on the 8 px scale: 4 / 8 / 16 / 24 / 32 / 48 / 64.
- Hero block (Dashboard, Project view): H1 greeting · subline · `synelia-rule` · content.
- Project view header: 56 px icon tile · title + description (left); avatar stack +
  visibility badge + "Inviter" ghost + "Nouvelle conversation" primary (right);
  24 px below, the 5-tab bar.
- Dashboard: 12-col grid — project cards (8 col) + recent activity (4 col), 24 px gap.
- Thread canvas: full-bleed scroll, composer pinned bottom, max-width 1080 px centered.

## Elevation & depth

Three shadow levels, all violet-tinted to match the primary — **never black**:

- **`shadow-sm`** `rgba(45,21,87,0.08)` — cards at rest, "Nouveau projet" button.
- **`shadow-md`** `rgba(45,21,87,0.12)` — popovers, dropdowns, hover on `shadow-sm` surfaces.
- **`shadow-lg`** `rgba(45,21,87,0.16)` — modals, artifact viewer, composer focus.

No shadow on the sidebar (it sits flush to the viewport — depth would fight the
chassis feel) and none on the hero rule (already loud enough).

## Shapes

- **`rounded-sm` 4 px** — buttons, kind chips, inputs, small pill labels.
- **`rounded-md` 8 px** — cards, list rows, project icon tiles, dropdowns.
- **`rounded-lg` 16 px** — panels, modals, the chat composer, artifact card outer.
- **`rounded-pill` 999 px** — visibility badges, live pills, suggest chips, status pills.

The scale is intentionally gentle. The corners are present, not declarative.

## Motion

Movement is **sober**: fades and small `translateY`, never bounce or infinite
decorative loops. Hover on primary buttons `#4B2882` → `#6B3FA0`; ghost → `background-alt`;
links violet → magenta. Press darkens the color (no aggressive scale).
Transparency/blur is reserved for hero overlays and modals. Respect
`prefers-reduced-motion`.

## Components

The list below maps 1:1 to the reference build. New components inherit from these;
do not invent new colors or radii.

**Buttons.** `button-primary` is the only high-emphasis action on a page;
`button-ghost` is the secondary. There is no `button-secondary`/`button-tertiary`
— those roles are ghost and an unstyled text link. Hover variants use the lighter
`primary-mid` / `background-alt`. Disabled = `text-muted` on `background-alt`, no shadow.

**Tabs.** The project view tab bar (Conversations · Artefacts · Connaissances ·
Routines · Équipe) is canonical. Active: `text: primary`, 2 px `primary`
underline, 600 weight. Inactive: `text-muted`, 500. The count (`tab-count`) is
`text-muted`, never magenta.

**Cards.** `artifact-card` is 280×160 px, `rounded-md`, `shadow-sm`: kind chip
top-left, title 16 px Montserrat 600, `live-pill` top-right if streaming, footer
row (avatar + first name · relative time · "Lien actif" if shared). `card-default`
is the generic white panel for dashboard project cards, member rows, prompt library.

**Modal — Artefact viewer.** Centered, max 880 px, `rounded-lg`, `shadow-lg`,
scrim `rgba(28,28,46,0.6)`. Header: kind chip + H1 + "Document généré par l'IA ·
{author} · il y a {n} min" + close. Body: project chip + large H1 + magenta rule +
content. Footer: status left + "Télécharger" ghost + "Partager par lien" primary
(or "Gérer le lien" ghost if shared).

**Sidebar nav row.** `sidebar-project-row`: inactive = transparent, white text;
active = `primary` background (one step lighter than the chassis), white text,
small pulsing green dot if any thread is live.

**Chat composer.** Pinned bottom, max-width 1080 px centered, 72 px, `rounded-lg`,
`shadow-lg` on focus. Left: paperclip / Connaissances / Routine icons (16 px);
textarea middle; send right. 4 suggest chips 16 px above, pill, ghost on white.

**Inputs.** One shape for all text inputs and textareas: white on `background`,
1 px `border`, `rounded-md`. Focus adds a 2 px `primary-mid` outline (not box-shadow — accessibility).

**Callouts.** Four kinds (info / success / warning / error): a tinted fill with
the state color carrying the *icon* and `text-sub` carrying the body (saturated
state-color text on the tint would fail AA). Used sparingly — callouts interrupt reading.

**Project icon tile.** 56×56 px, `rounded-md`, filled `primary` (or a kind-chip
color), centered white Lucide icon (`shield-check`, `cloud`, `lock`, `graduation-cap`), 24 px.

**Iconography.** Lucide via `lucide-react`, default 17 px (`icon-md`):
- Project icons: `shield-check`, `cloud`, `lock`, `graduation-cap`
- Tabs: `message-square`, `layout-grid`, `folder`, `repeat`, `users`
- Kinds: `file-text` (Document), `table-2` (Tableur), `git-fork` (Diagramme)
- Sharing: `globe`, `share-2`, `link`, `copy`, `download`
- Utility: `sparkles` (AI responding), `pin` (magenta), `user-plus` (invite)

**Avatar stack.** Round, 32 px, 10 px overlap, ordered by recency. Presence = 8 px green dot bottom-right.

**Brand assets.** Logo wordmarks and the compact mark live in `public/brand/`
(`synelia-wordmark.svg`, `synelia-wordmark-white.svg` for dark surfaces,
`synelia-mark.svg`). These are **substitutes** — replace with the official logo
before final delivery (`design/BRAND.md §5`).

## Voice (UI copy)

French for all institutional/product copy; English only for international technical
docs — **never mixed in a paragraph**. Voice: expert, confident, accessible,
grounded, sober. "Vous" of politeness toward the client; "nous" = Synelia. No
emoji in formal contexts. Use the exact product labels: "Nouvelle conversation",
"Partager par lien", "L'IA répond", "En cours", "Conversations / Artefacts /
Connaissances / Routines / Équipe". See `design/BRAND.md §2`.

## Do's and Don'ts

**Do**
- Put a `synelia-rule` (56×3 px magenta) under every H1, H2 and section title on a content surface.
- Default to white surfaces on a `background-alt` page tint. Reserve `primary-dark` for the sidebar and modal scrims.
- Show live state explicitly: magenta `live-pill` on streaming artifacts, `sparkles` + "L'IA répond" while the model responds, a pulsing green dot on live projects.
- Treat the 3 artefact kinds as a closed set: Document · Tableur · Diagramme.

**Don't**
- Don't use magenta outside the `.synelia-rule`, the wordmark dot, the pin icon, the live pill and the share-scope globe.
- Don't add a "Create artefact" button — artefacts are AI outputs; the user consumes, searches and shares them.
- Don't open artefacts as routes — they open as modals over the gallery; `/artefacts/[id]` is a deep-link fallback only.
- Don't use `primary` violet as the background of large text blocks — keep it for button / H1 / link.
- Don't ship a 4th button style. Primary + ghost + text link. Period.
- Don't localize the kind chip labels — "Document", "Tableur", "Diagramme" are product proper nouns.
- Don't put saturated state-color text on a tinted state-color background in callouts — the state color carries the icon, `text-sub` carries the copy.
- Don't introduce purple gradients, "tech-startup" palettes, or generic stock photos.

## Where to find what

| Need | File |
|---|---|
| Tokens + component spec (this contract) | `DESIGN.md` |
| Operative token implementation | `app/globals.css` |
| Tokens for JS/feature code | `lib/design-tokens.ts` |
| Brand context, voice, foundations, caveats | `design/BRAND.md` |
| Condensed non-negotiables (skill manifest) | `design/SKILL.md` |
| Upstream canonical token sheet (provenance) | `design/colors_and_type.css` |
| Logo wordmark + mark (substitute) | `public/brand/` |
