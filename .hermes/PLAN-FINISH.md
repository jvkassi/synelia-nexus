# Synelia Nexus — Audit + plan to finish (2026-06-09)

> Written after a full checkout of `claude/checkout-app-plan-bsd5zd` (= `main` + 7 Cowork
> commits): file inventory, build attempt, CSS/class audit, data-layer trace, CI review.
> This document corrects `.hermes/kanban.md` where it has drifted from reality and
> sequences the remaining work.

## Verdict in one paragraph

The **foundations are done and committed** (design tokens, the full 1,253-line Cowork
component CSS, typed mock data, primitives, DB schema + seed + live Drizzle query layer),
but the **UI rebuild has not actually started**: every page still uses the previous
session's Tailwind shells, zero pages use the ported `cowork.css` classes, and nothing
imports the live query layer. The chat workspace, modals, topbar, library, routines view,
and admin console don't exist yet. On top of that, `bun run build` is **broken** for two
unrelated reasons, the repo is split between two package managers, and the Playwright CI
workflow is a leftover from the Vercel template that can never pass. The design handoff
zip is **no longer available** — the plan below accounts for that.

## What is actually done (verified, not from the kanban)

| Layer | File(s) | State |
|---|---|---|
| Tokens | `app/globals.css` | ✅ canonical handoff tokens |
| Component CSS | `app/cowork.css` (1,253 lines) | ✅ complete — covers sidebar (`sb-*`), topbar (`tb-*`), dashboard (`dash*`), project (`proj*`, `ph-tab`), chat (`thread`, `composer`, `copresence`, `steer-hint`, `streaming-row`, `risk-table`), modals (`modal*`, `overlay`), library (`pcard`, `pc-*`), routines (`tasks-view`, `td-*`, `trh-*`), right panel (`rp-*`), login (`brandside`, `bs-*`), admin (`adm-*`), toast |
| Primitives | `components/synelia/{icon,avatar,rich-text,toaster}.tsx` | ✅ Icon +50, Avatar/AvatarStack/LivePill, RichText, Toaster |
| Mock data | `lib/synelia/{data,types}.ts` | ⚠️ partial — TEAM/PROJECTS/CHATS(coris)/ROUTINES/ARTIFACTS/PROMPTS done, but `RISK_ROWS: []`, `LIVE_AI_REPLY: ""`, `FILES: []`, `ACTIVITY: []`, all `runs: []`, and CHATS for cnps/oneci/academy are empty |
| DB | `lib/db/schema.ts`, migration `0000`, `lib/synelia/{seed,queries}.ts`, `db:*` scripts | ✅ built — but `queries.ts` (the live Drizzle layer) is imported by **nothing**; every page reads the mock compat shims from `data.ts` |
| Shell v1 | `components/shell/sidebar.tsx`, `app/(app)/{page,artifacts/page,w/[slug]/page}.tsx` | ⚠️ structurally follow the design but styled with Tailwind utilities, **not** the cowork classes — to be migrated, not rebuilt from scratch |
| Auth | NextAuth v5 split-screen login/register | ✅ works; visual polish to `bs-*` classes pending |
| Chat | `app/w/[slug]/t/[id]/chat-view.tsx` (orphan, outside `(app)`), `app/api/chat/route.ts` (501 stub) | ❌ not built — the orphan has useful AI-SDK transport/wire-shape code to salvage |

## Constraint: the design source is gone

The handoff zip (`~/cache/documents/doc_833cc086e695_….zip`) referenced everywhere in
`.hermes/` does **not exist in this environment** and was never committed. What survives:

- `.hermes/DESIGN_HANDOFF.md` — the 294-line decoded spec (views, modals, realtime
  behaviours, gotchas, file-by-file mapping)
- `app/cowork.css` — the **entire** visual design, class by class
- `lib/synelia/types.ts` — the full data shapes

What is lost: the prototype JSX sources (`chat.jsx`, `modals.jsx`, `library.jsx`,
`admin-*.jsx`…) and the un-ported mock content (`RISK_ROWS`, `LIVE_AI_REPLY`, routine
`runs[]`, the cnps/oneci/academy chats, `admin-data.js`).

**Consequence**: screens are reconstructed from the CSS class structure + the spec (the
CSS is prescriptive enough — every element the JSX rendered has a class here), and the
missing mock content must be **re-authored** in the same voice (French, vouvoiement,
Ivorian client context: Coris Bank, CNPS, ONECI, Open Digital Academy).

---

## Phase 0 — Repair the substrate (do first, ~half a day)

Blockers found by actually running the build:

- [ ] **0.1 Un-commit the SQLite DB.** `data/synelia-nexus.db` (+ a `.bak`) is committed,
      and its tables predate the drizzle journal → `tsx lib/db/migrate` dies with
      `table 'User' already exists`, so `bun run build` fails on a fresh clone unless you
      override `DATABASE_URL`. Fix: `git rm --cached data/*`, add `data/` to `.gitignore`,
      rely on `pnpm db:reset` (migrate + seed) for local/CI bootstrap. Verified: with a
      fresh DB the migration runs clean.
- [ ] **0.2 Fix the `/w/[slug]` prerender crash.** Next 16 cache-components mode:
      "Uncached data was accessed outside of <Suspense>" during `next build` static
      generation. The `(app)` pages are session-gated and DB-backed — they should be
      dynamic. Add `await connection()` (or a `<Suspense>` boundary in the layout) so the
      build stops trying to prerender them. Compile + typecheck already pass.
- [ ] **0.3 Pick one package manager.** `package.json` declares `pnpm@10.32.1` and both CI
      workflows use pnpm, but `pnpm-lock.yaml` is stale (missing `@libsql/client`) while
      `bun.lock` is current — `pnpm install --frozen-lockfile` fails today. Smallest fix:
      refresh `pnpm-lock.yaml` and keep CI as-is; delete `bun.lock` (or commit to bun and
      rewrite both workflows). Either way, stop carrying two lockfiles.
- [ ] **0.4 Defuse the Playwright workflow.** `.github/workflows/playwright.yml` is the
      Vercel-template original: it references `BETTER_AUTH_SECRET` / `POSTGRES_URL`
      secrets that no longer apply, and `playwright.config.ts` points at `./tests` which
      doesn't exist. It fails on every PR to main. Either delete it until Phase 6 ships
      real e2e, or rewrite it now (sqlite + seed + `next start`).

**Done when**: `pnpm install --frozen-lockfile && pnpm build` succeeds on a fresh clone
and CI is green on a no-op PR.

## Phase 1 — Finish the shell (kanban 1.5–1.8, ~1 day)

The CSS for all of this already exists; the work is JSX.

- [ ] **1.5b Migrate Sidebar to the cowork classes** (`sb-brand`, `sb-dept`, `sb-newbtn`,
      `sb-nav`/`sb-link`, `sb-section`, `sb-proj` + live dot, `sb-me`). Keep the existing
      props/structure — it already matches the spec.
- [ ] **1.6 Topbar** — `components/shell/topbar.tsx` (`tb-burger`, `tb-crumb`,
      `tb-search` with ⌘K hint, `tb-right`: « + Inviter » + bell).
- [ ] **1.7 App layout** — mount Sidebar + Topbar + Modals host + Toaster in
      `app/(app)/layout.tsx`; switch the wrapper to `.app`/`.content` classes.
- [ ] **1.8 Modals host** — `components/synelia/modals.tsx`: `NewProjectModal` (no
      icon/color pickers — palette auto-assigns), `InviteModal`, `NewChatModal`,
      `NewPromptModal`, `UsePromptModal`, `VisibilityModal`. Single `modal` enum + props
      in a client context provider; `key={obj.id}` on data-bound modals (state-leak gotcha).
- [ ] **1.9 Wire the live data layer.** Pages import from `@/lib/synelia/queries`
      (30s-cached Drizzle reads) instead of the `data.ts` compat shims; `data.ts` remains
      seed-only, as its header comment already intends. Modal "create" actions get server
      actions writing through `queries.ts` → this is what makes NewProject/NewChat/Invite
      real instead of toast-only.

**Done when**: dashboard renders pixel-styled from the DB, the 4 nav items + topbar work,
all 6 modals open/close and `NewProjectModal` actually inserts a project.

## Phase 2 — Dashboard + project home (~1 day)

- [ ] **2.1** Migrate `app/(app)/page.tsx` to `dash*` classes: kicker, « Bonjour, {prénom}. »,
      magenta rule, 2-col grid (project cards + active routines | « Conversations récentes »).
      No « Activité de l'équipe », no « Conversations en direct » (stripped per chat4).
- [ ] **2.2** Rebuild `w/[slug]` Conversations tab as the Claude-cowork home: big composer
      (`composer-wrap`) + 4 suggestion chips (`suggest-chip`) + chat list (`chat-row` +
      LivePill). Header: icon tile, visibility badge, avatar stack, Inviter + Nouvelle
      conversation (`projhead`, `ph-tab`).
- [ ] **2.3** The other 4 tabs as thin wrappers (Artefacts + Routines filled first).
- [ ] **2.4** VisibilityModal wired: badge → modal → server action → sidebar globe +
      dashboard card update.
- [ ] **2.5** Toasts on every mutating action (2.6 s auto-dismiss; toaster exists).

## Phase 3 — Library + artifacts + routines (~1 day)

- [ ] **3.1** `/library` — `pcard` grid, search (fuzzy on title+desc+body), 6 category
      filters, pinned-first, « Utiliser » → `UsePromptModal` → new conversation pre-filled.
- [ ] **3.2** `/artifacts` rebuild — project filter + kind filter (Document/Tableur/
      Diagramme) + search, `agc-*`/`artg-*` cards.
- [ ] **3.3** `/routines` — master-detail Tasks (`tasks-view`, `td-*`): list left, detail
      right with run-history chevrons + « Dernier », Active/Pause toggle, Modifier + Tester.
      **Requires re-authoring `runs[]` mock content** (2–3 runs per routine, markdown
      output, thought-seconds) — lost with the zip.
- [ ] **3.4** `ArtifactModal` + `ShareArtifactModal` (`artview`, `share-box`,
      `share-scope`; link shape `https://cowork.synelia.tech/a/<id>-<slug>`).

## Phase 4 — Chat workspace (the big one, ~2 days)

- [ ] **4.0 Re-author the lost realtime mock content**: `RISK_ROWS` (12 audit findings,
      famille/cotation/niveau/propriétaire), `LIVE_AI_REPLY` (the streamed synthesis), the
      ghost-typing draft for `c-entretiens`, and 3–4 chats each for cnps/oneci/academy.
- [ ] **4.1** `app/(app)/w/[slug]/t/[id]/page.tsx` — 3 layouts (centered default / canvas /
      wide via `?layout=`), `chat-main`/`chat-col`/`chat-aside` + right panel (`rpanel`,
      `rp-tabs`).
- [ ] **4.2** `useChatStream` hook — simulator path: 650 ms thinking, 28–45 ms/word,
      `cancelStream` as a **ref** (not state — stale-closure gotcha). Returns
      `{ messages, streaming, streamText, streamAuthor, send, stop }`.
- [ ] **4.3** Steering — Enter mid-stream cancels, tags « interrompu » / « orientation »,
      re-streams incorporating the steer (`steer-hint`).
- [ ] **4.4** Copresence banner + « Suivre la vue » + ghost typing for `c-entretiens`.
- [ ] **4.5** Live artifact — risk matrix (`risk-table`) fills row by row during the
      `c-synthese` stream.
- [ ] **4.6** Real `/api/chat` — replace the 501 stub: gate on session + membership,
      `streamText` + UIMessage stream, persist on finish. Salvage the transport/wire-shape
      code from the orphan `app/w/[slug]/t/[id]/chat-view.tsx`, then **delete the orphan**
      (it shadows the `(app)` route tree). Same hook consumes SSE when `OPENCODE_URL` is
      set; simulator remains the no-key dev path.
- [ ] **4.7** Composer with library-pick button; send↔stop icon swap while streaming.

## Phase 5 — Admin console (~1 day)

CSS (`adm-*`) is already ported; data (`admin-data.js`) is lost → derive KPIs from the
seeded DB where possible, re-author the rest.

- [ ] **5.1** `app/(admin)/` route group, own dark sidebar + « Retour à l'espace ».
- [ ] **5.2–5.6** Vue d'ensemble (KPIs, conso 7/30/60 j, top membres, audit feed) /
      Membres & rôles / Projets & espaces / Usage IA / Gouvernance & sécurité.
- [ ] **5.7** « Administration » entry in the sidebar user-pill menu.

## Phase 6 — Polish + tests (~1 day)

- [ ] **6.1** Login/register migrated to `brandside`/`bs-*` (Connexion.html layout).
- [ ] **6.2–6.7** Toast polish, skeletons, `error.tsx` (FR), ⌘K palette
      (`components/ui/command.tsx` exists), bell dropdown, avatar menu
      (Mon profil / Administration / Déconnexion).
- [ ] **6.8** Playwright e2e in `./tests`: register → create project → invite → second
      user joins → chat (simulator) → artifact appears. Rewrite `playwright.yml`
      accordingly (sqlite + seed, no Postgres secrets). This is what makes CI meaningful.
- [ ] Mobile responsive: **still out of scope** until the user says go.

---

## Sequencing & estimate

Phases are strictly ordered (0 → 1 → 2 → 3 → 4 → 5 → 6); 2/3 and 5 are parallelizable
once 1 lands. Total ≈ **7–8 focused days**. The riskiest item is Phase 4 (realtime UX +
re-authored content); the cheapest high-value win is Phase 0 + 1.9 (green build + real
data behind the existing pages).

## Standing gotchas (carried from the handoff, still apply)

`adm-` not `ad-` (ad-blockers) · `key={obj.id}` on data modals · `cancelStream` is a ref ·
`RISK_ROWS` must exist before the chat stream reads it · no emoji, no gradients,
violet-tinted shadows · French copy, vouvoiement, « en direct » jamais « live ».
