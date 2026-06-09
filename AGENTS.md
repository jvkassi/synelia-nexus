# Synelia Nexus — AGENTS.md

> A shared index file for AI coding agents (Claude Code, Cursor, Aider, …)
> working in this repo. Keep it terse; this is a *signpost*, not docs.
>
> **Design spec**: `.hermes/DESIGN_HANDOFF.md` (canonical, from the Claude
> cowork-handoff.zip). **Work plan**: `.hermes/kanban.md` (6 phases).
> **History**: `RECAP.md`. **Architecture**: `ARCHITECTURE.md`. Tokens:
> the handoff's `src/tokens.css`, ported into `app/cowork.css` in Phase 1.

## What this is

Multi-user AI workspaces. Not a chatbot, not a chat app — a place where a team
talks to a **long-running AI** that can read & write shared files on disk and
run tasks on a schedule.

Every team gets a **workspace** (real folder on disk + DB row). Inside a
workspace, members share **threads** (conversations) — the AI is a participant,
history is visible to all members, and the AI can `workspace_read`,
`workspace_write`, `workspace_list`, `workspace_edit`, `web_search`,
`web_fetch`, `create_artifact`, `schedule_task`.

## Repo map (as of 2026-06-09 — post Cowork handoff)

```
synelia-nexus/
├─ app/
│  ├─ (auth)/                NextAuth v5 (credentials) — login, register, layout
│  ├─ (app)/                 The Cowork app surface (auth-gated)
│  │  ├─ layout.tsx          Sidebar + Topbar + Modals host + Toaster
│  │  ├─ page.tsx            Dashboard — projects + recent convs + active routines
│  │  ├─ library/page.tsx    Prompt library (12 prompts, 6 categories, search)
│  │  ├─ artifacts/page.tsx  Global artifact gallery (project/kind filters, search)
│  │  ├─ routines/page.tsx   Routines master-detail (Tasks-inspired)
│  │  └─ w/[slug]/
│  │     ├─ page.tsx         5-tab project view (Conv/Artefacts/Connaiss/Rout/Équipe)
│  │     └─ t/[id]/
│  │        ├─ page.tsx      Chat workspace (3 layouts: centered/canvas/wide)
│  │        └─ chat-view.tsx  Client chat — useChatStream + steering + copresence
│  ├─ (admin)/               Workspace owner admin console
│  │  ├─ layout.tsx          Admin sidebar (Retour à l'espace)
│  │  └─ admin/[tab]/page.tsx Vue d'ensemble | Membres | Projets | Usage | Gouvernance
│  ├─ api/chat/route.ts      POST/GET chat — streams AI responses, persists msgs
│  ├─ actions.ts             Server actions
│  ├─ globals.css            Token sheet + base styles (will be replaced by cowork.css)
│  └─ cowork.css             Ported from handoff src/app.css (860 lines, in plan)
├─ lib/
│  ├─ db/
│  │  ├─ schema.ts           Drizzle: User, Workspace, WorkspaceMember, Thread,
│  │  │                      Message, Artifact, ScheduledTask, NextAuth tables
│  │  ├─ client.ts           better-sqlite3 + Drizzle
│  │  ├─ migrate.ts          Idempotent Drizzle migrator
│  │  ├─ migrations/         0000_reflective_true_believers.sql
│  │  └─ queries.ts          All CRUD: workspaces, members, threads, messages, …
│  ├─ synelia/data.ts        Mock data: TEAM, PROJECTS, CHATS, ROUTINES, ARTIFACTS,
│  │                         PROMPTS — drives the UI today, replaced by real queries later
│  ├─ ai/                    (planned) AI SDK provider, workspace tools, prompts
│  ├─ redis.ts               ioredis singleton (rate limits + scheduler ZSET)
│  ├─ ratelimit.ts           Redis-backed per-user limiter
│  ├─ worker.ts              Standalone scheduled-task worker (polls Redis ZSET)
│  └─ types.ts, utils.ts, constants.ts, errors.ts
├─ components/
│  ├─ shell/
│  │  ├─ sidebar.tsx         264px dark sidebar (SYNELIA wordmark, dept card, 4 nav,
│  │  │                      projects list, user pill) — handoff `sidebar.jsx`
│  │  └─ topbar.tsx          Breadcrumb + ⌘K search + invite + bell — handoff `Topbar`
│  ├─ synelia/               Primitives (handoff `primitives.jsx` ported to TS)
│  │  ├─ icon.tsx            Lucide line icons
│  │  ├─ avatar.tsx          Avatar + AvatarStack + LivePill
│  │  ├─ modals.tsx          7 modals (NewProject, Invite, NewChat, NewPrompt,
│  │  │                      UsePrompt, Visibility, Artifact, ShareArtifact)
│  │  ├─ rich-text.tsx       Minimal markdown renderer (bold + lists)
│  │  └─ toaster.tsx         Global toast container
│  ├─ chat/                  Chat building blocks (composer, message bubble, etc.)
│  ├─ artifacts/             Artifact cards + modal + share footer
│  ├─ ai-elements/           shadcn ai-elements (code-block, conversation, message,
│  │                         model-selector, prompt-input, reasoning, shimmer,
│  │                         suggestion, tool)
│  └─ ui/                    shadcn/ui primitives (Tailwind v4 + Radix)
├─ hooks/
│  ├─ use-chat-stream.ts     Streaming simulator (28-45ms/word + thinking + cancelRef)
│  ├─ use-realtime-presence.ts  Copresence + ghost typing (currently mocked)
│  └─ use-mobile.ts
├─ public/brand/             Synelia logo SVGs (mark + wordmark + wordmark-white)
├─ workspaces/               Runtime dir; each subfolder = one workspace's files
├─ data/synelia-nexus.db     SQLite file (gitignored, volume-mounted in prod)
├─ .hermes/
│  ├─ DESIGN_HANDOFF.md      Canonical design spec (from Claude cowork-handoff.zip)
│  ├─ DESIGN_BRIEF.md        Superseded by DESIGN_HANDOFF — kept for token reference
│  ├─ kanban.md              6-phase implementation plan (post-handoff)
│  └─ …
├─ proxy.ts                  Edge middleware — JWT gate on every page
├─ Dockerfile                Multi-stage build (deps → builder → runner)
├─ docker-compose.yml        Swarm stack: app, worker, opencode sidecar, redis
├─ DEPLOY.md                 Dokploy/Traefik deploy notes
├─ package.json              Next 16, React 19, AI SDK 6, Drizzle 0.34, …
└─ pnpm-lock.yaml
```

## Architecture (one paragraph)

Browser hits **Next.js (Next 16, App Router)**. Edge middleware
(`proxy.ts`) gates everything except `/login` and `/register` on a NextAuth
JWT. Authenticated server components (`page.tsx` files) load data via
**Drizzle ORM** against **better-sqlite3** (a single file in `./data/`).
Mutations go through **server actions** (`app/actions.ts`).

The chat client uses `useChat()` from `@ai-sdk/react` with a
`DefaultChatTransport` pointed at `/api/chat`. That route:

1. Authenticates the request, verifies the user is a workspace member.
2. Persists the new user message to SQLite.
3. Calls `streamText()` with `getLanguageModel()` (an
   `ai-sdk-provider-opencode-sdk` instance pointed at a local
   `opencode serve` on `:4096`).
4. Hands the model a `buildWorkspaceTools({ workspaceId, threadId })`
   toolbox — `workspace_read/write/list/edit` and `schedule_task` /
   `create_artifact`.
5. Streams the response back via `createUIMessageStreamResponse`. On
   `onFinish`, the assistant message is saved to SQLite.

A **standalone worker** (`pnpm worker`) polls a Redis sorted set
(`synelia:scheduled`) for due tasks. When one fires, it loads the
thread's history, runs the same `streamText` loop, and appends the
result as a new assistant message. The worker is a separate Swarm
service so it survives chat-server restarts.

**OpenCode** runs as a Swarm sidecar (`smanx/opencode:latest`) on the
overlay network. It serves an OpenAI-compatible HTTP API on `:4096`.
The provider is `opencode-go`, the model is `minimax-m3` (configurable
via env). Auth credentials are bind-mounted read-only from
`/opt/data/.local/share/opencode/auth.json` into the sidecar — no
secrets baked into the image.

**Redis** is a sidecar used for two things: (1) per-user chat rate
limits, (2) the `synelia:scheduled` sorted set keyed by `runAt`.

## Security model (what protects the filesystem)

The AI can only touch files inside `WORKSPACES_ROOT/<workspace.dirName>/`.
`safeJoin()` in `lib/ai/workspace-fs.ts` does three things on every path
operation:

1. Rejects absolute paths.
2. Rejects `dirName` containing `/` or `\` (must be created via
   `safeDir` in `queries.ts`).
3. Resolves the requested path and rejects any result that escapes
   the workspace root (no `..` traversal).

That helper is the only thing between the model and the rest of the
filesystem. Don't bypass it.

## Multi-user model

- A **User** can belong to N **Workspaces** via `WorkspaceMember`.
- A **Workspace** has a unique `slug` and a `dirName` (matches the
  on-disk folder name).
- A **Workspace** has N **Threads**. Threads have shared history.
- A **Message** belongs to a thread, has a `userId` (author for user
  msgs; triggering user for assistant msgs), a `role` (`user` |
  `assistant` | `system`), and AI SDK v6 `parts` (JSON).
- An **Artifact** belongs to a workspace (optionally a thread + creator).
  It's a row in the DB *and* a real file on disk. `kind` ∈
  `{text, code, sheet, image}`.
- A **ScheduledTask** is a durable record + Redis ZSET entry. The
  worker claims due tasks, runs them, and updates `status` +
  `resultMessageId`.

## Running it

### Dev (local)

Three terminals:

```bash
# 1. OpenCode server (the LLM gateway)
opencode serve --port 4096 --hostname 127.0.0.1

# 2. The web app
pnpm dev

# 3. The scheduled-task worker
pnpm worker
```

Requires Redis on `localhost:6379` (apt install redis-server) and the
`.env` file from `.env.example` filled in.

### Prod (Swarm)

```bash
docker build -t synelia-nexus:local .
docker stack deploy -c docker-compose.yml synelia-nexus
# Wire Traefik dynamic config from traefik/synelia-nexus.yml
```

Exposed on `https://synelia-nexus.technocify.fr` via the host's
Dokploy-managed Traefik + Let's Encrypt.

## Key design choices (the load-bearing ones)

1. **Workspaces are real folders, not virtual filesystems.** The AI
   sees the same files the human does. A `git` of the workspace folder
   *is* the audit log. No DB-only state.
2. **Threads are shared, not DMs.** Every workspace member sees every
   message. This is the multi-user-equivalent of Cursor's "team
   session".
3. **The AI is a participant, not an oracle.** It can be addressed by
   name in a thread, and it sees messages from humans in the same
   `messages` array.
4. **OpenCode, not a hosted LLM API.** We're routing through a local
   `opencode-go` provider that serves the `minimax-m3` model. Swap
   `OPENCODE_PROVIDER` and `OPENCODE_MODEL` to change.
5. **Scheduled tasks land in Redis + DB.** Redis is the queue
   (efficiency), SQLite is the audit trail (durability). Worker
   claims tasks with a `pending → running` state flip, then resolves
   to `done`/`failed`/`cancelled`.
6. **Auth is a hard gate, not a soft one.** `proxy.ts` rejects
   unauthenticated requests at the edge. API routes also call
   `auth()` and check `isMember()`. No "trust the client" anywhere.

## Things explicitly NOT built (yet)

The Cowork handoff defines the full product surface; the items below are
the gaps between handoff and shipped code. See `.hermes/kanban.md` for
the 6-phase plan to close them.

- **Cowork UI surface** — the dashboard, library, routines, admin
  console, chat workspace, and 7 modals exist as a hi-fi React
  prototype (`.hermes/DESIGN_HANDOFF.md`) but have not been ported into
  the Next.js shell. The 4 mock-data pages currently in `app/(app)/`
  are the **scaffolding** to be rebuilt in Phase 1–5.
- **Streaming chat** — `/api/chat` is a 501 stub. The chat workspace
  (3 layouts, steering, copresence, live artifact, ghost typing) is
  Phase 4. The streaming simulator that drives the prototype is the
  development path until Phase 4.6 wires the real SSE.
- **Real-time presence / typing / live artifact build** — the prototype
  simulates them client-side. Wiring to a real WebSocket/SSE is part of
  Phase 4.6.
- **Prompt library, global artifacts gallery, routines master-detail** —
  new top-level views at `/library`, `/artifacts` (the route exists
  but the content is basic), `/routines`. Phases 3.1–3.4.
- **Admin console** — 5 tabs at `/admin` (Vue d'ensemble, Membres,
  Projets, Usage, Gouvernance). Phase 5.
- **Web search / web fetch / image generation tools** — declared in
  prompts, no implementation.
- **Mobile-responsive layer** — the prototype has it; user said skip
  until they ask.
- **Public artifact sharing** — `ArtifactModal` + `ShareArtifactModal`
  in the handoff generate a public link; will port in Phase 3.4.
- **Slack/Teams inbound connectors** — not on the roadmap.
- **E2E tests** — Playwright skeleton in `playwright.config.ts`; user
  said use `agent-browser` instead. See `.hermes/kanban.md` Phase 6
  note.

See `.hermes/kanban.md` for the current work plan, `.hermes/DESIGN_HANDOFF.md`
for the canonical design spec, and `RECAP.md` for the history.
