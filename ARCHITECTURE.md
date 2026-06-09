# Synelia Nexus — Architecture

> One-page reference for what each piece does and how it talks to the
> others. Read top-down, follow the edges.

## Runtime topology (Swarm / production)

```
                        ┌──────────────────────────────────┐
                        │   Browser (Chrome, Firefox, …)   │
                        └───────────────┬──────────────────┘
                                          │ HTTPS
                                          ▼
                        ┌──────────────────────────────────┐
                        │ Traefik (Dokploy host)           │
                        │  • TLS via Let's Encrypt        │
                        │  • dynamic config:              │
                        │    traefik/synelia-nexus.yml    │
                        │  • routes Host() to swarm svc   │
                        └───────────────┬──────────────────┘
                                          │
                       ┌──────────────────┴──────────────────┐
                       │  dokploy-network (Docker overlay)    │
                       │                                     │
   ┌───────────────────▼────────────┐    ┌──────────────────▼──────────┐
   │  service: synelia-nexus_app    │    │  service: synelia-nexus_   │
   │  • Next.js 16 (next start)     │    │        worker               │
   │  • port 3000 (host)            │    │  • tsx lib/worker.ts        │
   │  • healthcheck: GET /login     │    │  • no port, no healthcheck  │
   │  • command: migrate → start    │    │  • command: migrate → loop  │
   │  • volumes: synelia-data,      │    │  • volumes: same            │
   │               synelia-workspaces│    │                             │
   │  • restart: on-failure (5x)    │    │  • restart: on-failure (5x) │
   └──────┬──────────────┬──────────┘    └──────────┬──────────────────┘
          │              │                           │
          │              │     ┌─────────────────────▼──────────────┐
          │              │     │  service: synelia-nexus_opencode  │
          │              │     │  • image: smanx/opencode:latest   │
          │              │     │  • OPENCODE_HOST=0.0.0.0          │
          │              │     │  • OPENCODE_PORT=4096             │
          │              │     │  • bind-mount auth.json (ro)      │
          │              │     │  • healthcheck: GET :4096/        │
          │              │     └─────────────────────┬──────────────┘
          │              │                           │
          │              │   HTTP /api/chat          │
          │              │   (AI SDK v6)             │
          │              └─────────┐                 │
          │                        ▼                 ▼
          │            ┌────────────────────────────────────┐
          │            │  service: synelia-nexus_redis       │
          │            │  • image: redis:7-alpine            │
          │            │  • appendonly yes                   │
          │            │  • save 60 1                        │
          │            │  • volume: redis-data               │
          │            └────────────────────────────────────┘
          │
          ▼
   ┌────────────────────────────────────────────┐
   │  synelia-data  →  /app/data/synelia-nexus.db│
   │  synelia-workspaces → /app/workspaces/      │
   │  redis-data   →  /data (redis AOF)          │
   └────────────────────────────────────────────┘
```

## Application architecture (in-process)

```
┌──────────────────────────────────────────────────────────────┐
│  Edge middleware (proxy.ts)                                  │
│  • Public allowlist: /login /register /api/auth /_next/...   │
│  • Everything else → getToken() → 302 /login?next=… if no JWT│
└──────────────────────────┬───────────────────────────────────┘
                           │ JWT valid
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  Server components (app/**/page.tsx)                         │
│  • await auth() → user                                      │
│  • await queries.*() → Drizzle / better-sqlite3             │
│  • Render UI                                                 │
│  • Server actions for mutations (app/actions.ts)             │
└──────────────────────────┬───────────────────────────────────┘
                           │ Client component (where needed)
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  Client UI (app/w/[slug]/t/[id]/chat-view.tsx)               │
│  • useChat() from @ai-sdk/react                              │
│  • DefaultChatTransport → POST /api/chat                     │
│  • Renders bubbles, tool parts, "AI is responding to X"      │
│  • Stop button aborts the in-flight request                  │
└──────────────────────────┬───────────────────────────────────┘
                           │ HTTP POST /api/chat
                           │ { workspaceId, threadId, messages }
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  app/api/chat/route.ts                                       │
│  1. auth() → user                                            │
│  2. isMember(workspaceId, userId) → 403 if no                │
│  3. getThread + getWorkspace → 404 if mismatch               │
│  4. checkRateLimit("chat", userId, 200) → 429 if exceeded    │
│  5. saveMessage(user) → SQLite                               │
│  6. touchThread                                              │
│  7. buildWorkspaceTools({ workspaceId, threadId, … })        │
│  8. streamText({                                             │
│       model: getLanguageModel(),                             │
│       system: systemPrompt({ workspaceName, workspaceDir }), │
│       messages,                                              │
│       tools,                                                 │
│       stopWhen: stepCountIs(8),                              │
│     })                                                       │
│  9. createUIMessageStream → createUIMessageStreamResponse()  │
│ 10. onFinish: saveMessage(assistant) + touchThread            │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  lib/ai/providers.ts                                         │
│  • createOpencode({ baseUrl: OPENCODE_BASE_URL })            │
│  • opencode(`${OPENCODE_PROVIDER}/${OPENCODE_MODEL}`)        │
│  • Defaults: opencode-go / minimax-m3                        │
└──────────────────────────┬───────────────────────────────────┘
                           │ OpenAI-compatible HTTP
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  opencode serve (Swarm sidecar)                              │
│  • :4096                                                     │
│  • auth.json bind-mounted from host                          │
└──────────────────────────────────────────────────────────────┘
```

## The AI toolchain

The model is handed **6 tools** (defined in `lib/ai/tools.ts`), each
backed by either SQLite or the workspace filesystem:

| Tool                | What it does                                   | Backed by                            |
| ------------------- | ---------------------------------------------- | ------------------------------------ |
| `workspace_read`    | Read a file inside the workspace               | `lib/ai/workspace-fs.ts` `safeJoin`  |
| `workspace_write`   | Write a file (mkdir -p parents) + create Artifact | `safeJoin` + `createArtifact`     |
| `workspace_list`    | List entries in a subdir                       | `safeJoin` + `node:fs`               |
| `workspace_edit`    | Find/replace a unique string                   | `safeJoin` + `diff-match-patch`      |
| `create_artifact`   | Persist a structured document (no file)        | `createArtifact` (DB only)           |
| `schedule_task`     | Queue a future run in Redis                    | `createScheduledTask` + `redis.zadd` |

`create_artifact` and `schedule_task` are mentioned in the system
prompt but not yet implemented as tool schemas — they're on the
"prompts mention them, not implemented" line in the kanban.

## The scheduled-task subsystem

```
AI tool call: schedule_task({ run_at: ISO, prompt: "…" })
   │
   ▼
createScheduledTask({ status: "pending", runAt, … })
   │
   ├──► SQLite:   ScheduledTask row inserted
   │
   └──► Redis:    ZADD synelia:scheduled <runAtEpoch> <taskId>
                  (whichever lands first; the other is the audit
                   trail / queue respectively)

                  …minutes/hours later…

pnpm worker (lib/worker.ts)
   loop every 5_000 ms:
     due = claimDueScheduledTasks(now, limit=5)
       └─► SELECT * FROM ScheduledTask
            WHERE status = 'pending' AND runAt <= now
            LIMIT 5
            (atomic UPDATE → status = 'running')
     for task in due:
        runTask(task)
          ├─► saveMessage(prompt as user, authorId=createdById)
          ├─► load history → convertToModelMessages
          ├─► streamText({ system, messages, tools, stopWhen: 8 })
          └─► saveMessage(assistant text, userId=null)
        markScheduledTaskDone(task.id)
        redis.ZREM synelia:scheduled task.id
```

The worker is **stateless** beyond what's in SQLite + Redis. Kill it,
restart it, it picks up where it left off.

## The auth/identity chain

```
Browser
  │
  │ POST /api/auth/callback/credentials
  │   { email, password }
  ▼
app/(auth)/api/auth/[...nextauth]/route.ts
  │
  │ auth() from app/(auth)/auth.ts
  │   • authorize() → bcrypt.compare → user row
  │   • jwt callback: id + name on the token
  │   • session callback: id + name on the session
  ▼
JWT cookie (secure, httpOnly in prod)
  │
  │ every request
  ▼
proxy.ts  →  getToken()  →  ok
  │
  │ server components
  ▼
auth() in page.tsx / route.ts → user
  │
  │ per-resource check
  ▼
isMember(workspaceId, userId)  →  Drizzle query
```

`isMember` is the gate everywhere. Workspace pages call it. The chat
route calls it. Every tool call that touches the workspace checks it
implicitly (the tools themselves are only built for workspaces the
user is in, because the route wouldn't have constructed them
otherwise).

## Why these particular choices

- **SQLite + Drizzle over Postgres**: 1 user-facing tenant (Synelia)
  in early access, read-heavy, single-file backup story, no
  connection-pool hassle. Migrating to Postgres later is a
  Drizzle connection-string change.
- **next-auth@5 over better-auth**: better-auth landed in the
  upstream fork but for a credentials-only, JWT-only flow with
  bcrypt, the difference is mostly cosmetic. NextAuth has the
  bigger install base and the Edge middleware story.
- **opencode serve over a hosted API**: keeps the credential on a
  host bind-mount, lets us swap providers (Anthropic, OpenAI,
  local) with a config change, and gives a stable OpenAI-compatible
  HTTP surface.
- **AI SDK v6 over the v5 patterns in the upstream fork**: the
  `createUIMessageStream` + `useChat` flow handles tool parts and
  reasoning transparently. Worth the upgrade.
- **One chat route, scoped by `workspaceId`+`threadId`**: the
  model doesn't care if it's a "DM" or a "team room". Everything is
  a thread in a workspace. Less surface area.
- **Sidecar the LLM**: the opencode container is a black box we
  don't ship. We ship the Next.js app + a worker; the model server
  is someone else's problem.
