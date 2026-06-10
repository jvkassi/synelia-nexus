# Synelia Cowork — Implementation Plan

## Statut (2026-06-10)

| Phase | État |
|---|---|
| 0 — Fondations (tokens, fonts, reskin, deps, env) | ✅ livré |
| 1 — Connexion + backend tenancy (schéma 0001, guards, CRUD, seed) | ✅ livré |
| 2 — Shell workspace + dashboard + détail projet + modales | ✅ livré |
| 3 — Migration chat sous projets + multi-auteur | 🔄 en cours (workflow `wf_51d7bc4d-f14`) |
| 4 — Présence temps réel (Supabase) | ⬜ |
| 5 — Streaming partagé + steering | ⬜ |
| 6 — Bibliothèque + Artefacts + Routines | ⬜ |
| 7 — Console admin | ⬜ |
| 8 — Mobile + finitions | ⬜ |

Démo : `pnpm db:seed` puis connexion `awa@synelia.tech` / `cowork2026` → `/w/data-ia`.
La référence design est vendorée dans `design/reference/` (le bundle d'origine était sous `/tmp/cowork/`).
Note exécution : OpenCode (`opencode run`, minimax-m3) est utilisé pour les petits objectifs mécaniques (sweep couleurs, routes CRUD, seed) ; les chantiers transverses (migration chat, realtime) sont faits directement ou via workflows multi-agents.

## Context

Evolve the Vercel AI Chatbot template (branch `vercel-chatbot`) into **Synelia Cowork**: a French, Synelia-branded, multi-tenant collaborative AI workspace for the Direction Data & IA. Design source is a Claude Design handoff bundle extracted at `/tmp/cowork/claude-cowork/` (canonical files: `project/src/*.jsx|css`; READMEs + 7 chat transcripts hold intent). The prototype simulates realtime; we build it **real**.

**Locked decisions:** Workspace → Projects → (chats, artifacts, files, routines); users belong to many workspaces (switcher, self-serve create, owner/member roles); prompt library is workspace-level; project visibility `private | public_to_workspace`; realtime (co-presence, shared AI streaming, steering) real from day one; every message attributed to its author; ship only the `centered` chat layout and `projects` sidebar variant; drop tweaks-panel / dashboard-variations / design-canvas (design tools, non-deliverable); French hardcoded (no i18n lib), `lang="fr"`, vouvoiement, no emoji.

**Codebase facts the plan relies on (verified):**
- AI provider = OpenCode local (`minimax-m3`); auth = NextAuth v5 credentials+guest (NOT Supabase Auth); DB = local Supabase Postgres :54322 via drizzle (single squashed migration `0000_initial.sql`, run on every build); files = Vercel Blob (token unset); `REDIS_URL` set.
- `resumable-stream` **supports multiple concurrent readers + late-join buffered replay** (verified in `node_modules/resumable-stream/dist/runtime.js`: `listenerChannels[]`, `chunksToSend` backlog). `app/(chat)/api/chat/[id]/stream/route.ts` is a 3-line stub to implement.
- Supabase local stack has Realtime enabled (`supabase/config.toml`) but no `@supabase/supabase-js` installed, no remote project. Keys come from `supabase status`.
- Chat shell mounts in `app/(chat)/layout.tsx`; pages are near-empty; `hooks/use-active-chat.tsx` extracts chat id from pathname regex and exposes `useChat` (incl. `resumeStream`, currently not exposed in context).
- A `.hermes/feature-test.workflow.js` already expects seeded data (workspace `data-ia`, threads `c-synthese` etc.) — the seed script must match it.

---

## Architecture decisions (with rationale)

1. **Realtime = hybrid.** `resumable-stream` (Redis) is the AI-token fan-out: all co-present clients attach as readers of the same stream via `GET /api/chat/[id]/stream`; late joiners get buffered replay. Supabase Realtime carries only presence + ephemeral control events (`typing`, `generation-started/finished`, `message-created`, `steered`, workspace activity). Rationale: token-rate over Realtime broadcast risks rate limits and has no replay; resumable-stream is already wired and verified multi-reader.
2. **No Postgres RLS on app tables.** Drizzle connects as one role; per-request claims would fight pooling. Authorization is app-layer: `lib/auth/guards.ts` called from route handlers (`requireWorkspaceMember`, `requireWorkspaceOwner`, `requireProjectAccess` honoring `public_to_workspace`, `requireChatAccess`). RLS exists ONLY on `realtime.messages` (Supabase CLI migration) for channel auth.
3. **Supabase channel auth = server-minted JWTs.** `lib/realtime/token.ts` signs HS256 `{sub: userId, role: 'authenticated'}` with `SUPABASE_JWT_SECRET` (jose); `GET /api/realtime/token` (NextAuth-protected) hands it to the browser → `supabase.realtime.setAuth(token)`. Private channels `chat:{id}` / `workspace:{id}` gated by RLS policies joining ProjectMember/WorkspaceMember on `auth.jwt()->>'sub'`. Fallback if local realtime RLS misbehaves: unguessable channel names from an authed endpoint.
4. **Steering = abort + persist partial + regenerate server-side in the same request.** Steer route saves the steering message (`tag:'steering'`), publishes on redis `chat-control:{chatId}`; the initiator's generation loop (new `lib/ai/run-generation.ts`) subscribes, aborts `streamText` via AbortController, persists partial assistant message `isInterrupted:true`, writes a `data-interrupted` part, re-fetches messages, starts a new `streamText` into the SAME dataStream writer (readers keep watching one stream). Cap 3 cycles/request. Generation lock: `SET chat:{id}:generation NX EX 120`; concurrent normal message → 409 → client offers steering. **Fallback** (kept cheap): end stream on interrupt; steerer's client issues a normal POST that everyone re-attaches to.
5. **Active workspace in URL: `/w/[slug]/…`.** Shareable, no cookie desync; cookie only as `/` redirect hint. API routes derive workspace from the resource (chatId→project→workspace); list endpoints take it explicitly.
6. **Design tokens: keep shadcn semantic names, assign Synelia values** so `components/ui/*` keeps working. **Magenta `#C0297A` must NOT map to shadcn `--accent`** (that's menu hover bg) — it becomes `--syn-magenta`, used only punctually (rules, live pills, badges, left borders, steering pill). shadcn `--accent` gets a pale violet tint. Drop dark mode (forced light; dark sidebar comes from `--sidebar-*` values). `--radius: 0.5rem` → sm 4 / lg 8 / 2xl 16. Violet-tinted shadows reassigned to existing `--shadow-*` var names.
7. **Fonts via next/font:** Montserrat (`--font-display`), Open Sans (`--font-body` → `--font-sans`), JetBrains Mono. Do NOT globally color headings violet (would bleed into streamed markdown); use page-level classes.
8. **Routines scheduler = secret-protected cron route.** `POST /api/cron/routines` (Bearer `CRON_SECRET`) scans `status='active' AND nextRunAt<=now()`; prod = vercel.json cron, dev = `scripts/cron-loop.ts`. Runner `lib/ai/routines.ts` uses `generateText` (non-streaming), saves `routine_run`, recomputes `nextRunAt` (`cron-parser`). "Tester" button = `POST /api/routines/[id]/run`.
9. **Migrations: fresh additive `0001_cowork.sql`** via `pnpm db:generate`; never touch `0000_initial.sql` (journal desync).
10. **Admin charts = CSS bars** (as in prototype); no chart lib.

## Schema (drizzle additions in `lib/db/schema.ts`)

New tables: `workspace` (id, name, slug unique, createdBy), `workspaceMember` (PK ws+user, role owner|member), `project` (workspaceId, name, description, icon, color, visibility, createdBy, updatedAt; idx ws+updatedAt), `projectMember` (PK proj+user), `prompt` (workspaceId, title, description, body, category, authorId, official, pinned, uses), `routine` (projectId, title, prompt, icon, cadenceCron, cadenceLabel, status, nextRunAt, lastRunAt, ownerId; idx status+nextRunAt), `routineRun` (routineId, title, output, status running|success|error, error, triggeredBy nullable, startedAt, finishedAt, durationMs; idx routine+startedAt), `projectFile` (projectId, name, contentType, size, url, uploadedBy).

Altered: `Chat` + `projectId` (nullable = legacy personal chat, keeps guest flow green) + `updatedAt` (idx projectId+updatedAt); `Message_v2` + `authorId` nullable, `tag` (null|'steering'), `isInterrupted` bool; `Document` + `projectId`, `chatId`, `shareScope` (project|workspace|link), `shareToken` unique nullable.

`MessageMetadata` in `lib/types.ts` extends with `authorId/tag/isInterrupted`; `convertToUIMessages` in `lib/utils.ts` maps them.

## Route tree (frontend)

```
/                      → redirect to /w/<last|first> or /login
/(auth)/login,register → split-brand layout (port login.css)
/(workspace)/w/[slug]/
  layout.tsx           → auth + workspace fetch, WorkspaceProvider + Presence, Sidebar(264px) + Topbar
  page.tsx             → Accueil (dashboard)
  library/ artifacts/ routines/      (routines selection via ?id=)
  projects/[projectId]/page.tsx      → project detail (composer + convo list + right rail)
  projects/[projectId]/chat/[chatId] → conversation (centered layout)
  admin/{page,members,projects,usage,governance}
```
New chat: project composer generates UUID client-side → `sendMessage` → `router.replace`. Legacy `/chat/[id]` 308-redirects. Breadcrumb from URL segments ("Data & IA › projet › conversation").

## Component mapping (key rows)

| Prototype | Action | Target |
|---|---|---|
| primitives Avatar/AvatarStack/LivePill | new | `components/synelia/avatar.tsx`, `live-pill.tsx` |
| sidebar ('projects' variant) | rebuild on shadcn sidebar primitives (`components/ui/sidebar.tsx`); lift `sidebar-history.tsx` SWR pagination for "Conversations récentes" | `components/synelia/workspace-sidebar.tsx` |
| Topbar (breadcrumb, ⌘K via cmdk, invite, bell) | new | `components/synelia/topbar.tsx` |
| chat thread/messages | **adapt** `components/chat/message.tsx`/`messages.tsx`: add author header (Avatar+name+time), "orientation"/"interrompu" pills from metadata; keep ai-elements machinery | same files |
| composer | **adapt** `multimodal-input.tsx`: steer-hint bar while streaming, prompt-picker popover, decorative Connaissances/Connecteurs, typers chip | same file |
| ArtifactViewer | **reuse** `artifact.tsx` + editors + data-stream-handler; restyle chrome to Synelia | same files |
| RightPanel tabs (Artefacts/Fichiers/Présents), copresence banner, ghost typing | new | `components/synelia/chat/*` |
| dashboard, project detail, library (+PromptPicker), artifacts gallery, routines master-detail, modals (on ui/dialog), admin | new | `components/synelia/*`, pages |
| toasts | restyle sonner, French copy | workspace layout |

## Realtime React architecture

`WorkspacePresenceProvider` (workspace channel: online ids, `liveByChatId` map → sidebar/dashboard live dots) and `ChatRealtimeProvider` (chat channel: copresent users, typers, stream lifecycle events). **Viewer-side shared streaming:** on `generation-started` broadcast, viewers call `resumeStream()` (expose it from `use-active-chat.tsx` context) — tokens flow through the SAME `useChat` state and DataStream handler, so streaming artifacts work for viewers free. Relax the `loadedChatIds` once-only guard to id-merge sync; teammates' messages appended via `message-created` broadcast. Do NOT pipe tokens over Supabase broadcast into setMessages.

## API inventory (new/changed)

New: `/api/workspaces` (GET/POST), `/api/workspaces/[id]` (+`/members`, `/projects`, `/prompts`), `/api/projects/[id]` (+`/members`, `/chats`, `/files`, `/routines`), `/api/prompts/[id]` (+`/use`), `/api/routines/[id]` (+`/run`, `/runs`), `/api/cron/routines`, `/api/realtime/token`, `/api/chat/[id]/steer`.
Changed: `POST /api/chat` (requireChatAccess replaces owner-equality, projectId in body schema, authorId persist, generation lock, regen loop, maxDuration 300); `GET /api/chat/[id]/stream` (implement resume); `/api/messages`, `/api/history`, `/api/document`, `/api/suggestions`, `/api/vote` (membership authz).

## Seed (`lib/db/seed.ts`, `pnpm db:seed`)

Idempotent (UUIDv5 from stable keys, delete-cascade `data-ia` first). From `/tmp/cowork/.../src/data.js`: 6 users `{awa,kofi,fatou,yao,mariam,ibrahim}@synelia.tech` / `cowork2026`; workspace `data-ia` (awa owner); 4 projects (academy public); 6 coris chats with `c-synthese` thread seeded (NOT `LIVE_AI_REPLY` — that's the live demo); 12 prompts; 6 routines + runs (cron derived from labels); 11 documents (Document→text, Tableur→sheet, Diagramme→text; shared→`workspace` scope); 5 projectFiles. Matches `.hermes/feature-test.workflow.js` expectations.

---

## Phases (each lands green: `pnpm build` + existing playwright; guest flow on `/` untouched until Phase 3)

**Phase 0 — Foundations (M).** Deps (`@supabase/supabase-js`, `jose`, `cron-parser`), env keys from `supabase status` into `.env.local`. Token swap in `app/globals.css` (+`--syn-*` namespace), fonts in `app/layout.tsx`, drop dark mode, de-gradient/de-oklch audit of `components/chat` (message bubbles, CodeMirror rules), restyle sonner, `lang="fr"` + FR metadata, Synelia primitives (SynIcon strokeWidth 1.75, Avatar, LivePill). Result: existing app, fully Synelia-violet.

**Phase 1 — Login + tenancy backend (M).** Split-brand login/register restyle. Schema `0001_cowork.sql` + queries + `lib/auth/guards.ts` (additive; nothing reads new columns yet). Workspace/project/prompt CRUD routes. Seed script.

**Phase 2 — Workspace shell + dashboard + project (L).** `(workspace)/w/[slug]/layout.tsx`, WorkspaceSidebar, Topbar (+⌘K), workspace switcher, `/` redirect; Accueil dashboard; project detail page + rail (rail actions decorative v1); NewProject/Invite modals. Old `(chat)` chat reachable behind it temporarily.

**Phase 3 — Chat migration + multi-author (L, highest regression surface).** Move ActiveChatProvider/ChatShell under `projects/[pid]/chat/[cid]`; fix `extractChatId` regex, new-chat flow, sidebar SWR keys; `requireChatAccess` in chat/messages/history/vote/document/suggestions routes; authorId persistence + author header UI; RightPanel tabs; artifact.tsx restyle; delete `app/(chat)` pages (+308 redirect); update playwright page objects in same PR. Legacy project-less chats keep owner-only semantics → existing tests pass.

**Phase 4 — Realtime presence (M).** `/api/realtime/token`, supabase CLI migration for `realtime.messages` RLS, `lib/realtime/{server,token}.ts`, WorkspacePresenceProvider + ChatRealtimeProvider, copresence banner, typing (throttled presence track), live dots.

**Phase 5 — Shared streaming + steering (L, riskiest).** **Spike first**: two browser tabs on one chat — implement stream GET + generation lock + `generation-started` broadcast, validate `resumeStream()` for second consumer mid-stream. Then steering: steer route, redis control channel (`lib/realtime/redis-control.ts`), abort/persist-partial/regen loop in `lib/ai/run-generation.ts`, "orientation"/"interrompu" UI. Fallback ready (steerer-client regenerates).

**Phase 6 — Library + Artifacts + Routines (L).** Three pages, PromptPicker in composer, share-by-link (shareToken read path), routines master-detail + runner + cron route + vercel.json cron + dev loop script.

**Phase 7 — Admin (M).** 5 tabs under `/w/[slug]/admin`, admin sidebar variant, role gating (owner-only), CSS bar charts, usage aggregates queries.

**Phase 8 — Mobile + polish (M).** ≤980px drawer (shadcn Sheet ~free), chat-aside drawer, burger, stacking; FR string sweep into `lib/i18n/fr.ts` constants; empty states.

## Top risks

1. **Steering regen loop (P5):** AI SDK 6 partial-persist on abort + second `streamText` merged into same writer — spike early; cheap fallback defined.
2. **Chat route migration (P3):** shell-in-layout + pathname regex + SWR keys + fetch paths all move together.
3. **resumable-stream producer fragility:** replay buffer lives in the producing request; if the initiator's invocation dies, watchers stall until persistence. Acceptable v1; persist partials on maxDuration aborts.
4. **Authz regression surface (P3):** six routes flip owner-equality→membership; one miss leaks cross-tenant. Add dedicated authz tests in `tests/e2e/api.test.ts` style.
5. **Realtime RLS bridging (P4):** NextAuth→Supabase JWT minting + local realtime quirks; documented fallback (unguessable channel names).

## Execution strategy — OpenCode delegation

Claude orchestrates; well-bounded tasks are delegated to the local OpenCode agent (`opencode run --model opencode-go/minimax-m3 "<task spec>"`, verified available: opencode 1.16.2, server live at 127.0.0.1:4096). Per delegated task: write a precise spec (files, exact tokens/values, acceptance), run it, review `git diff`, gate with `pnpm check` + `pnpm build`, commit as a checkpoint (revertable), re-prompt or hand-fix on failure.

- **Delegate:** Phase 0 token/font swap + de-gradient audit, login restyle, page/component scaffolding (dashboard, project, library, artifacts, routines, admin), CRUD routes, seed script.
- **Claude does directly:** schema+guards design (P1 core), Phase 3 chat migration, Phase 5 shared-streaming + steering (incl. the spike), realtime providers — the cross-file/stateful work where review costs more than doing.

## Verification

- Per phase: `pnpm build` (runs migrations) + `pnpm test` (playwright; update page objects in P3) + `pnpm check` (biome).
- Seed + click-through: `pnpm db:seed`, log in as `awa@synelia.tech`, walk login → dashboard → project coris → chat c-synthese → library → routines.
- Realtime (P4/P5): two browsers (awa + kofi) on the same chat — presence banner, typing indicator, kofi sends → awa watches the same reply stream live, awa steers mid-stream → "interrompu" + "orientation" + regenerated reply visible in both.
- The `.hermes/feature-test.workflow.js` agent-browser workflow can run as a final acceptance sweep (10 areas) once Phases 0–6 land.
