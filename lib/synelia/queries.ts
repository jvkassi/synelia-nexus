// lib/synelia/queries.ts
// Drizzle-backed read functions for the Synelia Cowork data. Returns
// the same shape the UI pages expect (the SyneliaData interface from
// lib/synelia/types.ts) so the call sites don't need to change.
//
// In-memory cache: reads are coalesced into a single `getAll()` so
// complex views (Sidebar + Topbar + Dashboard on the same page) only
// hit the DB once per request.

import "server-only";
import { createClient, type Client } from "@libsql/client";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/libsql";
import { eq, asc, inArray } from "drizzle-orm";
import {
  user, workspace, workspaceMember, thread, threadParticipant, message,
  artifact, routine, routineRun, promptCategory, prompt, scheduledTask,
  type User, type Workspace, type Thread, type Artifact, type Routine,
  type RoutineRun, type Prompt, type PromptCategory, type ScheduledTask,
} from "@/lib/db/schema";
import type {
  SyneliaData, Project, Chat, TeamMember, ProjectId, UserId, ArtifactKind,
  PromptCategory as PromptCategoryType, Prompt as PromptType,
  Artifact as ArtifactType, Routine as RoutineType, ChatMessage, ChatId,
} from "@/lib/synelia/data";

config({ path: ".env.local" });
config({ path: ".env" });

const rawUrl = process.env.DATABASE_URL ?? "file:./data/synelia-nexus.db";
const url = /^(file:|libsql:|https?:|wss?:)/.test(rawUrl) ? rawUrl : `file:${rawUrl}`;

let _client: Client | null = null;
function getClient(): Client {
  if (!_client) _client = createClient({ url });
  return _client;
}
const db = drizzle(getClient());

// ===== Cache (per-process, eager-loaded at module init) =====
let _cache: SyneliaData | null = null;
let _cacheAt = 0;
let _cachePromise: Promise<SyneliaData> | null = null;
const CACHE_TTL_MS = 30_000; // 30s — keep live/online badges fresh

async function loadAll(): Promise<SyneliaData> {
  const now = Date.now();
  if (_cache && now - _cacheAt < CACHE_TTL_MS) return _cache;
  if (_cachePromise) return _cachePromise;

  _cachePromise = (async () => {
  const users = await db.select().from(user);
  const projects = await db.select().from(workspace);
  const memberships = await db.select().from(workspaceMember);
  const threads = await db.select().from(thread);
  const participants = await db.select().from(threadParticipant);
  const messages = await db.select().from(message);
  const artifacts = await db.select().from(artifact);
  const routines = await db.select().from(routine);
  const runs = await db.select().from(routineRun);
  const cats = await db.select().from(promptCategory);
  const prompts = await db.select().from(prompt);

  const team: Record<string, TeamMember> = {};
  let me: TeamMember | null = null;
  for (const u of users) {
    const tm: TeamMember = {
      id: stripUserPrefix(u.id),
      name: u.name ?? "",
      initials: u.initials ?? (u.name ?? "?").slice(0, 2).toUpperCase(),
      color: u.color ?? "#4B2882",
      role: u.role === "owner" ? "Propriétaire" : "Membre",
      title: u.title ?? "",
      online: !u.isAnonymous,
      you: u.id === "u-awa",
    };
    team[tm.id] = tm;
    if (u.id === "u-awa") me = tm;
  }
  if (!me) me = team["awa"];

  const projectRows: Project[] = projects.map((p) => ({
    id: p.slug as ProjectId,
    name: p.name,
    emoji: p.emoji,
    color: p.color,
    desc: p.description ?? "",
    members: memberships
      .filter((m) => m.workspaceId === p.id)
      .map((m) => stripUserPrefix(m.userId)),
    updated: p.updated,
    chats: threads.filter((t) => t.workspaceId === p.id).length,
    files: 0,
    routines: routines.filter((r) => r.workspaceId === p.id).length,
    artifacts: artifacts.filter((a) => a.workspaceId === p.id).length,
    public: p.isPublic,
  }));

  const chatsByProject: Record<string, Chat[]> = {};
  for (const t of threads) {
    const ws = projects.find((w) => w.id === t.workspaceId);
    if (!ws) continue;
    const projectKey = ws.slug;
    const userIds = participants.filter((p) => p.threadId === t.id).map((p) => stripUserPrefix(p.userId));
    const chat: Chat = {
      id: t.id as Chat["id"],
      title: t.title,
      project: projectKey as ProjectId,
      lastBy: stripUserPrefix(t.lastById ?? "awa") as UserId,
      preview: t.preview ?? "",
      updated: t.updated,
      live: !!t.liveState,
      liveUser: t.liveUserId ? stripUserPrefix(t.liveUserId) as UserId : undefined,
      liveState: t.liveState ?? undefined,
      participants: userIds as UserId[],
      pinned: t.pinned,
    };
    if (!chatsByProject[projectKey]) chatsByProject[projectKey] = [];
    chatsByProject[projectKey].push(chat);
  }

  const artifactRows: SyneliaData["ARTIFACTS"] = artifacts.map((a) => {
    const ws = projects.find((w) => w.id === a.workspaceId);
    const projectKey = (ws?.slug ?? "coris") as ProjectId;
    return {
      id: a.id as SyneliaData["ARTIFACTS"][number]["id"],
      title: a.title,
      kind: a.kind as ArtifactKind,
      icon: a.icon,
      creator: stripUserPrefix(a.createdById) as UserId,
      when: a.when,
      project: projectKey,
      chat: (a.threadId ?? undefined) as Chat["id"] | undefined,
      live: a.live,
      shared: a.shared,
    };
  });

  const routineRows: SyneliaData["ROUTINES"] = routines.map((r) => {
    const ws = projects.find((w) => w.id === r.workspaceId);
    const rRuns = runs.filter((run) => run.routineId === r.id);
    return {
      id: r.id as SyneliaData["ROUTINES"][number]["id"],
      title: r.title,
      cadence: r.cadence,
      owner: stripUserPrefix(r.ownerId) as UserId,
      next: r.next,
      project: (ws?.slug ?? "coris") as ProjectId,
      icon: r.icon,
      status: r.status,
      ago: r.ago,
      prompt: r.prompt,
      runs: rRuns.map((run) => ({
        title: run.title,
        date: run.date,
        ranFor: run.ranFor,
        thought: run.thought,
        output: run.output,
      })),
    };
  });

  const promptCatRows: SyneliaData["PROMPT_CATS"] = cats.map((c) => ({
    id: c.id,
    label: c.label,
    icon: c.icon,
    count: prompts.filter((p) => p.categoryId === c.id).length,
  }));
  // "All" is a UI filter, not a DB row
  const allCat: SyneliaData["PROMPT_CATS"][number] = { id: "all", label: "Tous", icon: "library", count: prompts.length };
  promptCatRows.unshift(allCat);

  const promptRows: SyneliaData["PROMPTS"] = prompts.map((p) => ({
    id: p.id,
    title: p.title,
    cat: p.categoryId,
    icon: p.icon,
    author: stripUserPrefix(p.authorId) as UserId,
    uses: p.uses,
    pinned: p.pinned,
    official: p.official,
    desc: p.desc,
    body: p.body,
  }));

  _cache = {
    TEAM: team,
    ME: me!,
    PROJECTS: projectRows,
    CHATS: chatsByProject as SyneliaData["CHATS"],
    ROUTINES: routineRows,
    FILES: [],
    ARTIFACTS: artifactRows,
    ACTIVITY: [],
    THREAD_SYNTHESE: [],
    LIVE_AI_REPLY: "",
    RISK_ROWS: [],
    PROMPT_CATS: promptCatRows,
    PROMPTS: promptRows,
  };
  _cacheAt = Date.now();
  _cachePromise = null;
  return _cache;
  })();
  return _cachePromise;
}

function stripUserPrefix(id: string): UserId {
  return (id.startsWith("u-") ? id.slice(2) : id) as UserId;
}

// ===== Sync public API (eager-loaded) =====

/** Block until the first load completes. Safe to call from server components
 *  that need the data immediately. After the first call, all reads come
 *  from the in-memory cache. */
export async function ensureLoaded(): Promise<SyneliaData> {
  return loadAll();
}

export function getAll(): SyneliaData {
  if (!_cache) throw new Error("lib/synelia/queries: call ensureLoaded() first");
  return _cache;
}

export function getMember(id: UserId | string): TeamMember | undefined {
  return getAll().TEAM[id as UserId];
}

/** Stable, sync accessors for the loaded data. These exist so call sites
 *  that just need to render a list (PROJECTS, CHATS, ARTIFACTS, ROUTINES, ME)
 *  can do `import { PROJECTS } from "./queries"` without going through a
 *  function call. They re-read from the cache on every access. */
export function PROJECTS(): Project[] { return getAll().PROJECTS; }
export function CHATS(): SyneliaData["CHATS"] { return getAll().CHATS; }
export function ME(): TeamMember { return getAll().ME; }
export function TEAM(): SyneliaData["TEAM"] { return getAll().TEAM; }
export function ARTIFACTS(): SyneliaData["ARTIFACTS"] { return getAll().ARTIFACTS; }
export function ROUTINES(): SyneliaData["ROUTINES"] { return getAll().ROUTINES; }

export function getProject(slugOrId: string): Project | undefined {
  return getAll().PROJECTS.find((p) => p.id === slugOrId || p.name === slugOrId);
}

export function getProjectChats(pid: ProjectId | string): Chat[] {
  return getAll().CHATS[pid as ProjectId] ?? [];
}

export function getProjectArtifacts(pid: ProjectId | string): SyneliaData["ARTIFACTS"] {
  return getAll().ARTIFACTS.filter((a) => a.project === pid);
}

export function getProjectFiles(pid: ProjectId | string): SyneliaData["FILES"] {
  return getAll().FILES;
}

export function getProjectRoutines(pid: ProjectId | string): SyneliaData["ROUTINES"] {
  return getAll().ROUTINES.filter((r) => r.project === pid);
}

export function getProjectMembers(pid: ProjectId | string): Project["members"] {
  const p = getProject(pid as string);
  return p ? p.members : [];
}

export function allChats(): Chat[] {
  return (Object.values(getAll().CHATS) as Chat[][]).flat();
}

export function projectNameOf(pid: ProjectId | string): string {
  return getAll().PROJECTS.find((p) => p.id === pid)?.name ?? String(pid);
}

/** Sync-array exports for places that need to iterate the data without
 *  awaiting (most call sites should use the async functions above). */
export const DEPARTMENT = { id: "data-ia", name: "Direction Data & IA", company: "Groupe Synelia", memberCount: 6, initials: "DDIA" };
export const KIND_VAR: Record<ArtifactKind, string> = {
  Document: "rgba(75,40,130,0.10)", Tableur: "rgba(0,196,140,0.10)", Diagramme: "rgba(0,174,239,0.10)",
};
export const KIND_TEXT: Record<ArtifactKind, string> = {
  Document: "#4B2882", Tableur: "#00936A", Diagramme: "#0086BB",
};

/** Eager-load on first import. Call sites that don't await anything
 *  before using the queries will get the cache (which is loaded by
 *  this top-level call). */
const _init = loadAll().then((data) => { _cache = data; }).catch((e) => { console.error("[queries] init failed:", e); });

// Force-invalidate the cache (e.g. after a write in the worker).
export function invalidateCache(): void { _cache = null; _cacheAt = 0; }
