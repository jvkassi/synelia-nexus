# Synelia Nexus — Kanban (2026-06-09, post-Cowork-handoff)

> Status: design handoff received. Plan locked. **Pixel-replicate** the Cowork HTML in the
> existing Next.js shell — do not change substrate. Strictly follow the designer's component
> decomposition (`src/*.jsx`) and CSS (`src/tokens.css`, `src/app.css`).

## Locked decisions

- **Substrate**: Next.js 16 + React 19 (current). **Do NOT** rewrite to Vite + React Router.
  The chat7 kickoff suggested Vite, but the user's real auth/DB/worker is Next.js. We port
  the Cowork UI into the existing app.
- **Reference**: `~/cache/documents/doc_833cc086e695_Claude cowork-handoff.zip` (851 KB).
  Full inventory in `.hermes/DESIGN_HANDOFF.md`.
- **Token source of truth**: `src/tokens.css` from the handoff. Replace `app/globals.css`
  with it (the current globals.css is a partial copy).
- **CSS strategy**: port the handoff's `app.css` (860 lines) wholesale into a new
  `app/cowork.css` (or split per-component). Keep Tailwind v4 for utilities only.
- **Skip**: `tweaks-panel.jsx`, `dashboard-variations.*`, `design-canvas.jsx` (design tools).
  Skip the mobile-responsive layer for now.
- **Mock data**: `lib/synelia/data.ts` gets replaced with the full `data.js` content (TEAM,
  PROJECTS, CHATS, ROUTINES, ARTIFACTS, RISK_ROWS, THREAD_SYNTHESE, LIVE_AI_REPLY, PROMPTS,
  PROMPT_CATS). The real Drizzle schema stays in `lib/db/schema.ts` — both layers coexist
  (mock drives the UI today, schema is the production target).
- **Chat stream**: build the prototype's simulator (28-45ms/word + thinking pause +
  `cancelStream` ref + steering) AS the development path. Wire the real `/api/chat` to
  produce the same `UIMessage[]` shape when `OPENCODE_URL` is set, and the UI doesn't care
  which one feeds it.
- **Gotchas**: `SYN.RISK_ROWS` must be on the global before the chat reads it; modals need
  `key={obj.id}`; CSS prefix `ad-` collides with ad-blockers (use `adm-` for admin); no
  emoji; no gradients; French copy, vouvoiement.

## Phases

### Phase 1 — Foundations (start here)

- [ ] **1.1 Tokens** — replace `app/globals.css` with the handoff's `tokens.css` (131 lines,
      canonical design system: colors, type, spacing, shadows, semantic states, kind colors,
      `.synelia-rule`).
- [ ] **1.2 Component CSS** — copy `src/app.css` (860 lines) into `app/cowork.css`. Add the
      login and admin CSS files too (`login.css`, `admin.css`).
- [ ] **1.3 Primitives** — port `primitives.jsx` to TS:
      - `components/synelia/icon.tsx` (exists, extend with `LivePill` and the full Lucide set)
      - `components/synelia/avatar.tsx` (build: `Avatar`, `AvatarStack`, `LivePill`)
- [ ] **1.4 Mock data** — port `data.js` to `lib/synelia/data.ts` with full type annotations.
      Re-export as `SYN = { TEAM, ME, PROJECTS, CHATS, ROUTINES, ARTIFACTS, RISK_ROWS,
      THREAD_SYNTHESE, LIVE_AI_REPLY, PROMPTS, PROMPT_CATS }` from a client-safe module.
- [ ] **1.5 Sidebar** — port `sidebar.jsx` to `components/shell/sidebar.tsx`. Replaces the
      current 264px shell. Adds: SYNELIA wordmark + Cowork sub, Direction Data & IA card,
      "+ Nouveau projet" button, 4 nav items (Accueil / Bibliothèque / Artefacts / Routines)
      with Routines count badge, projects list with public globe + live dot, user pill.
- [ ] **1.6 Topbar** — build `components/shell/topbar.tsx`. Burger (mobile, hidden desktop),
      breadcrumb, search input with ⌘K hint, "+ Inviter" + bell icon buttons.
- [ ] **1.7 App layout** — rewrite `app/(app)/layout.tsx` to mount Sidebar + Topbar + the
      `Modals` host (7 modals) + the `Toaster` (toast container). 5 routes go here:
      `/`, `/library`, `/artifacts`, `/routines`, `/w/[slug]`, `/w/[slug]/t/[id]`.
- [ ] **1.8 Modals host** — port `modals.jsx` to `components/synelia/modals.tsx`:
      `NewProjectModal`, `InviteModal`, `NewChatModal`, `NewPromptModal`, `UsePromptModal`,
      `VisibilityModal`. State machine in `(app)/layout.tsx` (single `modal` enum + `props`).

**Phase 1 done when**: `pnpm dev` opens a working dashboard, sidebar nav switches between the
4 top-level views, modals open and close cleanly, all on the mock data.

### Phase 2 — Dashboard + project home

- [ ] **2.1 Dashboard** — port the `Dashboard` part of `dashboard.jsx` to
      `app/(app)/page.tsx`. Kicker "Espace de travail collaboratif", greeting "Bonjour, Awa.",
      magenta rule, 2-col grid: left = project cards (4) + active routines list; right =
      "Conversations récentes" (7 items, clickable). **No "Activité de l'équipe", no
      "Conversations en direct"** (stripped per chat4).
- [ ] **2.2 Project home** — port `ProjectView` + `ChatsHome` to `app/(app)/w/[slug]/page.tsx`.
      The Conversations tab is the **Claude-cowork-style home**: big composer up top with 4
      suggestion chips, then the chat list below. Header has the project icon tile, visibility
      badge (Public/Privé), avatar stack, "Inviter" + "Nouvelle conversation" buttons.
- [ ] **2.3 Project tabs** — Conversations / Artefacts / Connaissances / Routines / Équipe.
      Each tab is a thin wrapper for now (the depths come in phases 3+4). `ProjectArtifacts`
      and `ProjectRoutines` are the first to be filled.
- [ ] **2.4 Visibility modal** — clicking the badge opens `VisibilityModal`. On apply, the
      header badge and sidebar globe update live, dashboard updates the card.
- [ ] **2.5 Toast** — wire the global toast (2.6s auto-dismiss) to all the dashboard + project
      actions (new project created, visibility changed, invite sent, etc.).

**Phase 2 done when**: a user can open a project, change its visibility, and the change
reflects live across sidebar + dashboard. The 5 tabs render without crashes.

### Phase 3 — Library + global artifacts + routines

- [ ] **3.1 Library** — port `library.jsx` to `app/(app)/library/page.tsx`. Search + 6
      category filters + pinned-first + "Utiliser" → `UsePromptModal` → new conversation.
- [ ] **3.2 Global artifacts** — port `ArtifactsView` to `app/(app)/artifacts/page.tsx`.
      Project filter + kind filter (Document / Tableur / Diagramme) + search + cards.
- [ ] **3.3 Routines (master-detail Tasks)** — port the `RoutinesView` part of
      `dashboard.jsx` to `app/(app)/routines/page.tsx`. List on left (selected routine
      featured, others in grid), detail on right with run history (chevrons + "Dernier"),
      Active/Pause toggle, Modifier + Tester buttons. The "Grok-inspired" change.
- [ ] **3.4 Artifact modal** — port `ArtifactModal` + `ShareArtifactModal` from
      `artifacts.jsx`. Click a card → modal with `key={artifact.id}` (no state-leak).
- [ ] **3.5 Prompt composer integration** — add the library picker button to the chat
      composer (deferred to Phase 4 if the chat isn't built yet).

**Phase 3 done when**: `/library` shows 12 prompts with search + filters; `/artifacts` shows
the 12 mock artifacts; `/routines` shows the 5 routines in master-detail; modals work.

### Phase 4 — Chat workspace (the big one)

- [ ] **4.1 Chat layout shell** — port `ChatWorkspace` to `app/(app)/w/[slug]/t/[id]/page.tsx`.
      3 layouts (`centered` / `canvas` / `wide`) — hardcode `centered` as default, all 3 in
      CSS, switchable via `?layout=canvas` query param.
- [ ] **4.2 Streaming simulator** — port `streamAssistant` from `chat.jsx` to a custom hook
      `useChatStream`. 650ms thinking, 28-45ms/word, `cancelStream` ref. Returns
      `{ messages, streaming, streamText, streamAuthor, send, stop }`.
- [ ] **4.3 Steering** — typing and hitting Enter mid-stream cancels, tags previous msg
      "interrompu", yours "orientation", AI re-streams incorporating the steer.
- [ ] **4.4 Copresence + ghost typing** — show "Kofi est dans cette conversation" banner +
      "Suivre la vue" toggle; for `c-entretiens`, show Fatou's ghost typing character by char.
- [ ] **4.5 Live artifact** — for `c-synthese`, the right panel fills the risk matrix row by
      row as the AI streams.
- [ ] **4.6 Real `/api/chat` wiring** — when `OPENCODE_URL` is set, the same `useChatStream`
      hook reads from SSE on `/api/chat` instead of the simulator. The UI doesn't change.
- [ ] **4.7 Chat composer** — composer with the library-pick button (Phase 3.5), send/stop
      button (icon swaps between "send" and "stop" while streaming).
- [ ] **4.8 Markdown rendering** — port `renderRich` (handles `**bold**` and numbered lists)
      to a `components/synelia/rich-text.tsx`. Plus a minimal markdown renderer for routine
      run outputs (bold, ordered/unordered lists, paragraphs).

**Phase 4 done when**: opening the Coris / Synthèse chat shows the live AI streaming the
risk matrix, opening Coris / Trame d'entretiens shows the ghost typing, hitting Enter
mid-stream steers, and the 3 layouts all render cleanly.

### Phase 5 — Admin console

- [ ] **5.1 Route group** — new `app/(admin)/` route group with its own layout (no main
      sidebar, uses `admin-app.jsx`'s dark sidebar with "Retour à l'espace" link).
- [ ] **5.2 Overview tab** — KPIs (membres, sièges, messages IA, artefacts, routines), 7/30/60
      day IA consumption chart, top members, audit feed.
- [ ] **5.3 Members tab** — table with role change, suspend/reactivate, seat meter, invite.
- [ ] **5.4 Projects tab** — visibility + archive toggles, all working.
- [ ] **5.5 Usage tab** — per-member consumption vs. quota, per-project usage, near-limit
      alerts.
- [ ] **5.6 Governance tab** — access policies (SSO, 2FA, résidence souveraine CI, DLP),
      data retention selector, security score, full audit log.
- [ ] **5.7 Link from main app** — add a "Administration" link to the Sidebar's user pill
      menu (the gear icon), navigates to `/admin`.

**Phase 5 done when**: every admin tab renders with the mock data and the role/visibility
toggles fire toasts.

### Phase 6 — Polish

- [ ] **6.1 Login polish** — `app/(auth)/login/page.tsx` matches the Connexion.html split
      (Synelia wordmark left, white form right, French copy, validation, member chip).
- [ ] **6.2 Toast styling** — full polish on the toaster (icon, color, animation).
- [ ] **6.3 Loading states** — skeleton on dashboard cards, project cards, artifact cards
      during route transitions.
- [ ] **6.4 Error states** — `app/error.tsx` + `app/(app)/error.tsx`, French copy.
- [ ] **6.5 Search ⌘K** — topbar search opens a command palette (uses `components/ui/command.tsx`).
- [ ] **6.6 Notifications** — bell icon opens a dropdown with mock activity feed.
- [ ] **6.7 Avatar click menu** — user pill in sidebar opens "Mon profil / Administration /
      Déconnexion" menu.
- [ ] **6.8 Mobile-responsive** — only after user gives the go. Phase 5 of chat1 said no yet.

**Phase 6 done when**: every action has a loading + success + error state, the toasts and
tooltips all match the prototype, and the login page matches the Connexion.html.

## Out of scope (forever)

- **Mobile view** (chat5) — user said not yet
- **Tweaks panel + dashboard variations** (chat1 design tools) — per chat7
- **Design canvas** — designer's pixel canvas, not a user feature
- **Real WebSocket/SSE backend** — the prototype simulates. Wire real SSE in Phase 4.6 as a
  drop-in replacement; the rest of the chat UI doesn't change.
- **Real auth changes** — NextAuth v5 stays. The Cowork UI mounts behind the existing
  `(app)` route group's `auth()` gate.

## Currently in flight (carry-overs from prior session)

- `app/api/chat/route.ts` is a 501 stub. Will be filled in Phase 4.6.
- `app/w/[slug]/t/[id]/chat-view.tsx` is an orphan from the prior deletion. Will be replaced
  in Phase 4.1.
- The current 4-page mock shell (login, register, dashboard, 5-tab project, /artifacts) is
  being **rebuilt in place**, not augmented. The new versions land in the same routes.
