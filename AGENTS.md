# Synelia Nexus — AGENTS.md

> A shared index file for AI coding agents (Claude Code, Cursor, Aider, …)
> working in this repo. Keep it terse; this is a *signpost*, not docs.

## What this is

Multi-user AI workspaces. Not a chatbot, not a chat app — a place where a team
talks to a **long-running AI** that can read & write shared files on disk and
run tasks on a schedule.

Every team gets a **workspace** (real folder on disk + DB row). Inside a
workspace, members share **threads** (conversations) — the AI is a participant,
history is visible to all members, and the AI can `workspace_read`,
`workspace_write`, `workspace_list`, `workspace_edit`, `web_search`,
`web_fetch`, `create_artifact`, `schedule_task`.

## Repo map (as of 2026-06-09)

```
synelia-nexus/
├─ app/
│  ├─ (auth)/                NextAuth v5 (credentials) — login, register, layout
│  ├─ api/chat/route.ts      POST/GET chat — streams AI responses, persists msgs
│  ├─ page.tsx               Home — list workspaces, create one, join via token
│  ├─ join.tsx               Client component for invite-token paste
│  ├─ actions.ts             Server actions (createWorkspace, createInvite, createThread)
│  └─ w/[slug]/
│     ├─ page.tsx            Workspace hub — threads, artifacts, members
│     └─ t/[id]/
│        ├─ page.tsx         Thread server page (load history, hydrate client)
│        └─ chat-view.tsx    Client chat UI — useChat() + streaming + tool bubbles
├─ lib/
│  ├─ ai/
│  │  ├─ providers.ts        AI SDK v6 → opencode SDK (local :4096)
│  │  ├─ prompts.ts          systemPrompt(), artifactsPrompt()
│  │  ├─ tools.ts            buildWorkspaceTools() — workspace_read/write/list/edit
│  │  └─ workspace-fs.ts     Sandbox: WORKSPACES_ROOT, safeJoin, AGENTS.md seed
│  ├─ db/
│  │  ├─ schema.ts           Drizzle: User, Workspace, WorkspaceMember, Thread,
│  │  │                      Message, Artifact, ScheduledTask, NextAuth tables
│  │  ├─ client.ts           better-sqlite3 + Drizzle
│  │  ├─ migrate.ts          Idempotent Drizzle migrator
│  │  └─ queries.ts          All CRUD: workspaces, members, threads, messages, …
│  ├─ redis.ts               ioredis singleton (rate limits + scheduler ZSET)
│  ├─ ratelimit.ts           Redis-backed per-user limiter
│  ├─ worker.ts              Standalone scheduled-task worker (polls Redis ZSET)
│  └─ types.ts, utils.ts, constants.ts, errors.ts
├─ components/ui/            shadcn/ui primitives (Tailwind v4, Radix)
├─ hooks/use-mobile.ts
├─ workspaces/               Runtime dir; each subfolder = one workspace's files
├─ data/synelia-nexus.db     SQLite file (gitignored, volume-mounted in prod)
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

- Real-time presence / typing indicators (just poll `/api/chat`).
- Web search / web fetch tools (in prompts, no implementation).
- Image generation tool.
- Per-workspace AGENTS.md editor (read-only `workspace_read` works).
- Public artifact sharing.
- Slack/Teams inbound connectors.
- E2E tests beyond the Playwright skeleton in `playwright.config.ts`.

See `.hermes/kanban.md` for the current work plan and `RECAP.md` for
the history.
