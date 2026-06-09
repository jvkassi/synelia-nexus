# Synelia Nexus — Design Handoff (Claude Cowork bundle)

> Reference: `~/cache/documents/doc_833cc086e695_Claude cowork-handoff.zip` (851 KB)
> Author: Olive, 2026-06-09 — the **canonical** design spec for what Synelia Nexus must become.
> Supersedes: `.hermes/DESIGN_BRIEF.md` (which was extracted from the 3-zip prototype, not this bundle).
> Mode: full implementation. Read this top-to-bottom, then ship the screens.

## What this bundle is

A 7-transcript chat log + a complete hi-fi React/JSX prototype + an admin console, exported from
Claude Design (`claude.ai/design`) after 7 iterative sessions (2026-06-05 → 2026-06-09) with the
user. The user wants a **real, production** implementation of what the prototype shows, in the
existing `synelia-nexus` Next.js codebase.

**Skip these prototype files** (per the chat7 kickoff prompt):
- `src/tweaks-panel.jsx` (541 lines) — the in-app layout/style playground
- `src/dashboard-variations.jsx` (372) + `dashboard-variations.css` (179) — the 3-layout variant picker
- `src/design-canvas.jsx` (974) — the designer's pixel canvas
- `project/scraps/`, `project/uploads/`, `project/screenshots/` — designer's reference only
- `project/design_handoff_synelia_cowork/` — duplicate of the bundle, ignore

**Port these** (the real product):

| File | Lines | What it ships |
|---|---|---|
| `src/tokens.css` | 131 | Canonical design system — colors, type, spacing, shadows |
| `src/app.css` | 860 | The big one — every component style, dark sidebar, modals, chat |
| `src/primitives.jsx` | 69 | `Icon` (Lucide UMD), `Avatar`, `AvatarStack`, `LivePill` |
| `src/sidebar.jsx` | 72 | 4 nav items + projects list + dept card + user pill |
| `src/dashboard.jsx` | 262 | Dashboard (2-col) + `RoutinesView` (master-detail Tasks) |
| `src/project.jsx` | 223 | Project view with 5 tabs (Chats/Artefacts/Connaissances/Routines/Équipe) |
| `src/rightpanel.jsx` | 170 | Per-project right panel (members, files, live state) |
| `src/chat.jsx` | 381 | The heart — streaming AI, steering, copresence, live artifact |
| `src/modals.jsx` | 172 | `NewProjectModal` (no icon/color), `InviteModal`, `NewChatModal`, `NewPromptModal`, `UsePromptModal`, `VisibilityModal` |
| `src/library.jsx` | 249 | Prompt library: search, categories, "Utiliser" launches a chat |
| `src/artifacts.jsx` | 378 | Project tab + global gallery + `ArtifactModal` + share-by-link |
| `src/data.js` | 360 | Mock data: TEAM, PROJECTS, CHATS, ROUTINES, ARTIFACTS, RISK_ROWS, THREAD_SYNTHESE, LIVE_AI_REPLY, PROMPTS, PROMPT_CATS |
| `admin-*.jsx` × 9 | ~1500 | The admin console (5 tabs + shared components) |
| `admin.css`, `login.css` | 204 + 177 | Admin + login styles |
| `Synelia Cowork.html` | 30 | App shell HTML (loads tokens + babel + components) |
| `Synelia Cowork - Connexion.html` | 173 | Login HTML (split brand/form) |
| `Synelia Cowork - Admin.html` | 29 | Admin HTML |

Total in-scope source: **~4,500 lines JSX + 1,400 lines CSS + 360 lines mock data**.

## The 7 chat transcripts (read in this order)

1. **chat1.md** — "Claude Web Workspace" — the original brief. User wants a **Claude Cowork clone
   but multi-user web**, French, Synelia-branded, departments share projects + chats + routines,
   real-time presence, project files + knowledge + artifacts. Decisions captured: desktop wide
   layout, 2 roles (Owner/Member), 4 screens (chat workspace, files/knowledge/artifacts panel,
   new project flow, invite teammates), shared thread (each msg attributed to a person), AI
   capabilities = answer + read project files + produce artifacts + run agentic tasks. The first
   prototype is built end-to-end here, including the **steering** feature (interrupt the AI
   mid-stream and re-orient via Enter).
2. **chat2.md** — "Prompt Library Menu" — adds a department-level **prompt library** (12 prompts
   in 6 categories: Audit, Cybersécurité, Cloud, Data & IA, Gestion de projet, Rédaction),
   "Utiliser" launches a conversation, copy button, contribute flow, and a quick-pick button in
   the chat composer. Then: **Artefacts tab per project, global Artefacts menu, project
   visibility (public for onboarding), share artifacts as a link**. The verifier caught a
   state-leak bug between artifacts (fixed via `key={artifact.id}` on the modal).
3. **chat3.md** — "Menu restructuring" — removes "Activité de l'équipe" sidebar item; **global
   Routines view** now navigable (not dead-ending on home).
4. **chat4.md** — "Tâches restantes" — what remains. The user said: **"do the rest, not the
   mobile version yet"**. Changes: **remove Icon and Couleur pickers from the New Project
   modal**, make project creation actually functional (was just toast). Later: **remove "Activité
   de l'équipe" and "conversation en direct" from dashboard; replace with "Conversations
   récentes"**.
5. **chat5.md** — "Mobile view" — built a mobile-responsive CSS layer. (User later said no
   mobile yet, so we keep the desktop implementation but skip the mobile polish for now.)
6. **chat6.md** — "Admin File Structure" — built `Synelia Cowork - Admin.html`, a standalone
   console with 5 tabs (Vue d'ensemble / Membres & rôles / Projets & espaces / Usage IA /
   Gouvernance & sécurité), 8 files (~1,500 lines JSX + 200 lines CSS). Functional role
   changes, suspend/reactivate, visibility toggles, policy switches. **Note**: had to rename
   CSS prefix `ad-` → `adm-` because the preview's ad-blocker hides `.ad-wrap` — same gotcha
   will hit us if we name classes that way in Next.js.
7. **chat7.md** — "Claude Code Project" — the user asks for a **kickoff prompt** to start the
   project in Claude Code. This is the **canonical handoff spec**:

> Je veux construire **Synelia Cowork**, l'espace de travail IA collaboratif de la Direction
> Data & IA du Groupe Synelia. Le dossier `design_handoff_synelia_cowork/` contient le package
> complet.
>
> **Commence par lire `design_handoff_synelia_cowork/README.md` en entier**, puis explore les
> fichiers de référence dans `design_handoff_synelia_cowork/design_files/` (les 4 `.html` et le
> dossier `src/`).
>
> Ce sont des **prototypes HTML/React‑via‑Babel haute‑fidélité**, pas du code de production.
> Recrée‑les fidèlement (au pixel près) dans une vraie codebase **React + TypeScript + Vite**,
> avec **React Router**, **lucide-react** pour les icônes, et un build réel (pas de
> CDN/Babel in‑browser). Mappe les **tokens de `src/tokens.css`** vers des variables CSS / un
> thème, et modélise les données d'après `src/data.js` et `src/admin-data.js`.
>
> Périmètre, dans l'ordre :
> 1. **Fondations** : tokens, polices, primitives UI, shell (sidebar + topbar).
> 2. **Connexion** (split marque / formulaire + validation).
> 3. **Application** : dashboard, vue projet, conversation (3 dispositions), bibliothèque de
>    prompts, artefacts, routines, modales + toasts.
> 4. **Administration** : vue d'ensemble, membres, projets, usage, gouvernance.
>
> Respecte strictement le design language Synelia. Pour l'instant, branche l'UI sur des
> **données mockées** reproduisant `data.js`. **N'implémente pas** le panneau de Tweaks ni la
> page de variations du dashboard — ce sont des outils de design.
>
> Propose d'abord une structure de dossiers et un plan d'implémentation par étapes, puis
> attends mon feu vert avant de coder.

**The user changed substrate** (from Next.js to React + Vite in chat7). But the project is
already a Next.js app with real auth + DB schema. We are NOT going to rewrite to Vite. We
port the Cowork UI into the existing Next.js shell, keeping the deeper infrastructure. See
"Substrate decision" below.

## The product spec, decoded

Synelia Cowork is a **multi-user AI workspace** for the *Direction Data & IA* du Groupe Synelia.
Six mock team members: Awa (Lead Data & IA, owner), Kofi (Consultant Cybersécurité), Fatou
(Data Scientist), Yao (Architecte SI), Mariam (Cheffe de projet), Ibrahim (Ingénieur DevOps).
Four real client projects in the mock: **Audit SI Coris Bank**, **Migration Cloud CNPS**,
**Cybersécurité ONECI**, **Open Digital Academy** (the only `public: true` one, used for
onboarding new members).

### The 6 view surfaces (the routing enum in `app.jsx`)

| View | Path | What it shows |
|---|---|---|
| `home` | `/` | Dashboard: greeting + projects grid + recent conversations + active routines |
| `library` | `/library` | Prompt library: search + 6 categories + pinned + "Utiliser" → launch |
| `artifacts` | `/artifacts` | Global artifact gallery: project filter + kind filter + search + cards |
| `routines` | `/routines` | Master-detail Tasks: list of routines left, runs history right |
| `project` | `/w/[slug]` | 5-tab project view: Conversations / Artefacts / Connaissances / Routines / Équipe |
| `chat` | `/w/[slug]/t/[id]` | The conversation workspace — the **real-time heart** |

### The 3 chat layouts (the `t.layout` tweak — we ship all 3, default `centered`)

- **centered** — Conversation column max-width 760px center, right panel for artifacts/members/present
- **canvas** — Conversation left, artifact pinned right (for following a livestream build)
- **wide** — Conversation full width, artifacts inserted inline in the thread

The tweaks panel itself is **out of scope** (design tool), so we hardcode `centered` as the
default but build all 3 layouts in CSS, switchable via a query param `?layout=canvas`.

### The 5 project tabs

1. **Conversations** — Claude-cowork-style home: a big composer up top with 4 suggestion chips,
   then the list of recent chats below (each with live indicator if active). No tab title clutter.
2. **Artefacts** — `ProjectArtifacts` — cards scoped to this project, kind chip + share status
3. **Connaissances** — `FilesTab` — placeholder for now (the prototype is also shallow here)
4. **Routines** — `RoutinesTab` — routines scoped to this project
5. **Équipe** — `TeamTab` — member list with role, last activity, suspend button

### The 6 modals (per the chats)

| Modal | Trigger | What it does |
|---|---|---|
| `NewProjectModal` | "+ Nouveau projet" (sidebar, dashboard) | Name + description + member picker chips. **No icon, no color** (assigned automatically from a palette). Real creation wires to `SYN.PROJECTS.unshift(...)`. |
| `InviteModal` | "+ Inviter" (topbar, project header) | Email + role (Propriétaire/Membre) + pending list. Real send wires to invite table. |
| `NewChatModal` | "+ Nouvelle conversation" (project header) | Title input. Real create opens a new thread. |
| `NewPromptModal` | "+ Nouveau prompt" (library header) | Title input. Real create adds to library. |
| `UsePromptModal` | "Utiliser" on a library card | Project picker + prompt preview. On launch, opens a new conversation with the prompt pre-filled. |
| `VisibilityModal` | Public/Privé badge in project header | Scope picker (Public au workspace / Privé). On apply, live-updates the badge + sidebar globe + dashboard visibility. |
| `ArtifactModal` | Click an artifact card | Full artifact view with **share-by-link** (scope: Membres / Public). `key={artifact.id}` to avoid state-leak. |
| `ShareArtifactModal` | Partager button in ArtifactModal | Generates `https://cowork.synelia.tech/a/<id>-<slug>`, copy button, scope selector. |

### The realtime features (the "en direct" core)

| Feature | Where | What it does |
|---|---|---|
| Live streaming | `chat.jsx` `streamAssistant` | 28-45ms per word + 650ms "thinking" pause. **Interruptible** via `cancelStream`. |
| Steering | chat composer | Type and hit Enter mid-stream → previous message marked "interrompu", yours marked "orientation", AI re-generates incorporating the steer. |
| Copresence banner | chat header | "Kofi est dans cette conversation" + "Suivre la vue" toggle. |
| Ghost typing | chat thread | A teammate is typing — show their draft character by character. |
| Live artifact build | chat right panel | The risk matrix fills row by row as the AI streams its reasoning. |
| Live project dot | sidebar project | Red dot on project cards if any chat is live. |
| LivePill | chat list, project card | "L'IA répond" / "Fatou écrit…" magenta pill with pulsing dot. |
| Sidebar routines counter | sidebar | Routines count badge next to the nav item. |

### Things explicitly stripped (per the user in chat1)

- **NO "en ligne" presence chrome** — no topbar counter, no sidebar presence block, no green dots
  on avatars, no "en ligne" mentions in member lists. The "en direct" **real-time** indicators
  stay (they're the heart of the concept), but the static "is this person online" UI is gone.
- **NO "Activité de l'équipe" dashboard column** — replaced with "Conversations récentes"
- **NO "Conversation en direct" dashboard column** — same
- **NO team activity simulation** — pure client-side live indicators only

### The 12 prompts in the library (mock content)

Categories: Audit, Cybersécurité, Cloud, Data & IA, Gestion de projet, Rédaction. Each prompt
has: title, description, body (the actual instruction), author (TEAM member), uses count,
official flag, icon. The library search is fuzzy on title + desc + body. Pinned prompts shown
first. "Utiliser" opens the UsePromptModal with a project picker.

### The 5 routines in the mock

Each routine: title, cadence ("Chaque lundi · 08:00"), owner (TEAM), next run date, project,
icon, status (`active` / `paused`), prompt, runs[] (most recent first, each with title, date,
duration, thought-seconds, output in markdown). The master-detail Tasks UI shows the selected
routine on the right with run history navigation (chevrons + "Dernier" button), full markdown
output, Active/Pause toggle, Modifier + Tester buttons. Inspired by the user with "inspire-toi
de sa pour les tasks. C'est grok" (chat4).

## Substrate decision: **port to Next.js, not Vite**

Chat7 says "React + TypeScript + Vite + React Router + lucide-react". The current project is
Next.js 16 + React 19 + AI SDK 6. **We are not rewriting to Vite.** The user's real investment
is in:

- A real auth system (NextAuth v5 credentials + bcrypt, member table, invite tokens)
- A real schema (Drizzle + SQLite: User, Workspace, WorkspaceMember, Thread, Message, Artifact, ScheduledTask)
- A real chat API route (`/api/chat` 501-stubbed today, but scaffolded for the real stream)
- A real worker (`pnpm worker`) + Redis for scheduled tasks
- An MCP-ready substrate for the AI provider (`opencode-go` on `:4096`)

The Vite suggestion in chat7 was made by the design assistant without knowing about all this.
The right move is to **port the Cowork UI into the Next.js shell** so we keep both:

1. **Cowork UI surface** — every view, modal, live indicator, layout, and the 5 project tabs
2. **Next.js depth** — Drizzle schema, auth, real chat route, scheduled-task worker, MCP

For the chat stream: we keep the **prototype's client-side simulator** (28-45ms/word + thinking
pause + interrupt + cancel) as the development fallback (no AI key required), AND wire the
real `/api/chat` route to drive the same UI shape when `OPENCODE_URL` is set. Both paths
produce the same `UIMessage[]` shape, so the chat UI doesn't care which one feeds it.

## Mapping to current `synelia-nexus`

| Handoff file | Current file | Status |
|---|---|---|
| `tokens.css` | `app/globals.css` (`.synelia-*` classes) | **Replace** with the canonical version |
| `primitives.jsx` Icon (Lucide) | `components/synelia/icon.tsx` (Lucide) | **Port + extend** with `LivePill` |
| `primitives.jsx` Avatar / Stack | `components/synelia/avatar.tsx` (missing) | **Build** |
| `sidebar.jsx` | `components/shell/sidebar.tsx` (basic) | **Rebuild** to match — add dept card, projects list, routines counter |
| `app.jsx` `Topbar` | `app/(app)/layout.tsx` (no topbar) | **Build** with breadcrumb + ⌘K + invite + bell |
| `dashboard.jsx` (Dashboard part) | `app/(app)/page.tsx` (basic) | **Rebuild** — 2-col grid, kicker, magenta rule, project cards, recent convs, routines |
| `dashboard.jsx` (RoutinesView part) | (missing) | **Build** — master-detail Tasks |
| `project.jsx` | `app/(app)/w/[slug]/page.tsx` (5 tabs but shallow) | **Rebuild** to match — Chats home is the Claude-cowork composer + list pattern, not a "conversations" tab list |
| `chat.jsx` | `app/(app)/w/[slug]/t/[id]/chat-view.tsx` (deleted) + `app/api/chat/route.ts` (501 stub) | **Build** — the whole realtime workspace |
| `library.jsx` | (missing) | **Build** as `/library` |
| `artifacts.jsx` (project tab) | tab in `w/[slug]/page.tsx` (basic) | **Rebuild** to match |
| `artifacts.jsx` (global) | `app/(app)/artifacts/page.tsx` (basic) | **Rebuild** — project filter + kind filter + search + share modal |
| `modals.jsx` | (missing) | **Build** — 7 modals as a `<Modals />` host mounted in `(app)/layout.tsx` |
| `rightpanel.jsx` | (missing) | **Build** — per-project panel (artifacts, members, live state) |
| `admin-*` (9 files) | (missing) | **Build** as `/admin` route group (or `/settings`) — 5 tabs |
| `Synelia Cowork - Connexion.html` | `app/(auth)/login/page.tsx` (split-screen exists) | **Polish** to match — Synelia wordmark, French copy, validation, member chip |
| `data.js` | `lib/synelia/data.ts` (basic mock) | **Replace** with the full mock (TEAM, PROJECTS, CHATS, ROUTINES, ARTIFACTS, RISK_ROWS, THREAD_SYNTHESE, LIVE_AI_REPLY, PROMPTS, PROMPT_CATS) |
| `tweaks-panel.jsx`, `dashboard-variations.*`, `design-canvas.jsx` | — | **Skip** (design tools, per chat7) |

## Visual system (canonical, from `src/tokens.css`)

The current `app/globals.css` already has the violet/magenta tokens but is **incomplete** — it
misses semantic state colors, the magenta rule, the kind-chip colors, the LivePill. Replace it
with the handoff's tokens.css wholesale, plus a new `app.css` containing all the component
styles. That's ~1,000 lines of CSS. The handoff uses standard CSS variables — no Tailwind
required for the Cowork UI (we can keep Tailwind v4 for utilities and skip it where the
component CSS does the work).

## Implementation plan (the order, in `.hermes/kanban.md`)

See `.hermes/kanban.md` for the current task list. The phases:

1. **Tokens + primitives + shell** — replace `globals.css`, port primitives, build Sidebar +
   Topbar + `(app)/layout.tsx` mounting the 7 modals host.
2. **Dashboard + project home** — rebuild the 2-col dashboard and the Claude-cowork-style
   project home (composer + suggestions + chat list).
3. **Library + global artifacts + routines** — the 3 new top-level views at `/library`,
   `/artifacts`, `/routines`.
4. **Chat workspace** — the big one. Streaming simulator, 3 layouts, steering, copresence,
   ghost typing, live artifact ticker, share modal. Wire to the real `/api/chat` when ready.
5. **Admin console** — 5 tabs as `/admin` route group, sidebar with Retour à l'espace.
6. **Polish** — login polish, mobile-responsive layer (skip until user says go), ⌘K search,
   toast styling, loading states, error states.

## Gotchas to remember (the things that bit the prototype)

- **CSS prefix `ad-` collides with ad-blockers** in preview environments. Use `adm-` or another
  prefix for the admin console's wrapper classes.
- **`SYN.RISK_ROWS` must be on the global `SYN` object** before the chat reads it, or the
  stream loop throws. Easy to miss when splitting data across files.
- **Modal state leaks between artifacts** — every modal that takes a data object must use
  `key={obj.id}` so it remounts on switch.
- **Streaming interrupt requires a `cancelStream` ref** — using state for the cancel flag
  doesn't work because the closure captures the stale value.
- **No emoji in the UI** — per chat1's design language decision, use Lucide line icons only.
- **No gradients** — solid colors + violet-tinted shadows. The handoff's tokens have
  `shadow-sm/md/lg` with `rgba(45,21,87,...)` already.
- **French copy throughout, vouvoiement** — "Bonjour, Awa." not "Hi Awa". "Créer le projet"
  not "Create project". "En direct" not "Live".

## Open questions for the user (before we start)

None blocking. The chat7 prompt says "Propose d'abord une structure de dossiers et un plan
d'implémentation par étapes, puis attends mon feu vert avant de coder." — so this document IS
the plan. The user said "full implementation" via the picker, so I have the green light to
start once the plan is reviewed.
