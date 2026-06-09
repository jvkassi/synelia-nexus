// lib/synelia/seed.ts
// Seed the SQLite DB with the canonical Synelia Cowork data (6 team
// members, 1 workspace, 4 projects, 6 chats, 6 routines, 11 artifacts,
// 6 prompt categories, 12 prompts, 1 live thread with 4 messages,
// scheduled tasks).
//
// Reads from lib/synelia/data.ts (the typed mock layer). Run with
//   pnpm db:seed
// Idempotent: re-running upserts (not duplicate-inserts).

import "dotenv/config";
import { config } from "dotenv";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import {
  user, workspace, workspaceMember, thread, threadParticipant, message,
  artifact, routine, routineRun, promptCategory, prompt, scheduledTask,
} from "@/lib/db/schema";
import { SYN } from "@/lib/synelia/data";
import { eq, sql } from "drizzle-orm";

config({ path: ".env.local" });
config({ path: ".env" });

const rawUrl = process.env.DATABASE_URL ?? "file:./data/synelia-nexus.db";
const url = /^(file:|libsql:|https?:|wss?:)/.test(rawUrl) ? rawUrl : `file:${rawUrl}`;
const client = createClient({ url });
const db = drizzle(client);

const uuid = () => crypto.randomUUID();

async function seed() {
  console.log("Seeding Synelia Cowork data…");

  // ---- Users (6 team members) ----
  console.log("  → users");
  const userIdMap: Record<string, string> = {};
  for (const t of Object.values(SYN.TEAM)) {
    const id = `u-${t.id}`; // stable IDs so chat/routine refs work
    await db.insert(user).values({
      id,
      email: `${t.id}@synelia.tech`,
      name: t.name,
      role: t.id === "awa" ? "owner" : "member",
      title: t.title,
      color: t.color,
      initials: t.initials,
      emailVerified: true,
      isAnonymous: false,
    }).onConflictDoNothing();
    userIdMap[t.id] = id;
  }

  // ---- The signed-in user ----
  const meId = userIdMap["awa"];

  // ---- Workspace: Direction Data & IA ----
  console.log("  → workspace");
  const wsId = "ws-data-ia";
  await db.insert(workspace).values({
    id: wsId,
    name: "Direction Data & IA",
    slug: "data-ia",
    description: "Espace partagé de la Direction Data & IA du Groupe Synelia",
    emoji: "brain-circuit",
    color: "#4B2882",
    isPublic: false,
    updated: "maintenant",
    createdById: meId,
  }).onConflictDoNothing();

  // ---- WorkspaceMember: all 6 users belong ----
  console.log("  → workspace members");
  for (const t of Object.values(SYN.TEAM)) {
    await db.insert(workspaceMember).values({
      workspaceId: wsId,
      userId: userIdMap[t.id],
      role: t.id === "awa" ? "owner" : "member",
    }).onConflictDoNothing();
  }

  // ---- Threads (6 chats for coris, all 4 projects) ----
  console.log("  → threads");
  for (const project of SYN.PROJECTS) {
    const chats = SYN.CHATS[project.id];
    for (const c of chats) {
      const threadId = c.id; // preserve the handoff IDs (c-synthese, c-remediation, …)
      await db.insert(thread).values({
        id: threadId,
        workspaceId: wsId,
        title: c.title,
        icon: "message-square",
        preview: c.preview,
        lastById: userIdMap[c.lastBy],
        updated: c.updated,
        pinned: c.pinned ?? false,
        liveState: c.live ? (c.liveState ?? "ai-typing") : null,
        liveUserId: c.live && c.liveUser ? userIdMap[c.liveUser] : null,
        createdById: meId,
      }).onConflictDoNothing();

      // Participants
      for (const p of c.participants) {
        await db.insert(threadParticipant).values({
          threadId,
          userId: userIdMap[p],
        }).onConflictDoNothing();
      }

      // The c-synthese thread gets the pre-existing THREAD_SYNTHESE messages + the
      // live AI reply (streamed).
      if (c.id === "c-synthese") {
        let i = 0;
        for (const m of SYN.THREAD_SYNTHESE) {
          const mid = m.id;
          await db.insert(message).values({
            id: `${threadId}-${mid}`,
            threadId,
            userId: m.author === "ai" ? meId : userIdMap[m.author],
            role: m.role,
            text: m.text,
            at: m.at,
            parts: [{ type: "text", text: m.text }],
            attachments: m.attachments ?? [],
            isSteer: false,
            isInterrupted: false,
          }).onConflictDoNothing();
          i++;
        }
      }
    }
  }

  // ---- Artifacts (11) ----
  console.log("  → artifacts");
  for (const a of SYN.ARTIFACTS) {
    const id = a.id;
    await db.insert(artifact).values({
      id,
      workspaceId: wsId,
      threadId: a.chat ?? null,
      createdById: userIdMap[a.creator],
      title: a.title,
      kind: a.kind,
      icon: a.icon,
      content: `# ${a.title}\n\nArtefact généré par l'IA dans le cadre du projet ${SYN.PROJECTS.find((p) => p.id === a.project)?.name ?? a.project}.`,
      when: a.when,
      live: a.live ?? false,
      shared: a.shared ?? false,
      publicSlug: a.shared ? a.id + "-" + a.title.toLowerCase().replace(/[éèê]/g, "e").replace(/[àâ]/g, "a").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 32) : null,
    }).onConflictDoNothing();
  }

  // ---- Routines (6) + their runs ----
  console.log("  → routines + runs");
  for (const r of SYN.ROUTINES) {
    const id = r.id;
    await db.insert(routine).values({
      id,
      workspaceId: wsId,
      title: r.title,
      cadence: r.cadence,
      ownerId: userIdMap[r.owner],
      next: r.next,
      icon: r.icon,
      status: r.status,
      ago: r.ago,
      prompt: r.prompt,
    }).onConflictDoNothing();

    for (let i = 0; i < r.runs.length; i++) {
      const run = r.runs[i];
      await db.insert(routineRun).values({
        id: `${id}-run-${i}`,
        routineId: id,
        title: run.title,
        date: run.date,
        ranFor: run.ranFor,
        thought: run.thought,
        output: run.output,
      }).onConflictDoNothing();
    }
  }

  // ---- Prompt categories (6) + prompts (12) ----
  console.log("  → prompt library");
  for (const c of SYN.PROMPT_CATS) {
    if (c.id === "all") continue; // "Tous" is a UI filter, not a real category
    await db.insert(promptCategory).values({
      id: c.id,
      label: c.label,
      icon: c.icon,
      color: null,
    }).onConflictDoNothing();
  }
  for (const p of SYN.PROMPTS) {
    await db.insert(prompt).values({
      id: p.id,
      title: p.title,
      categoryId: p.cat,
      icon: p.icon,
      authorId: userIdMap[p.author],
      uses: p.uses,
      pinned: p.pinned ?? false,
      official: p.official ?? false,
      desc: p.desc,
      body: p.body,
    }).onConflictDoNothing();
  }

  // ---- One scheduled task to seed the worker ----
  console.log("  → scheduled task");
  const nextMonday = new Date();
  nextMonday.setDate(nextMonday.getDate() + ((1 + 7 - nextMonday.getDay()) % 7 || 7));
  nextMonday.setHours(8, 0, 0, 0);
  await db.insert(scheduledTask).values({
    id: uuid(),
    workspaceId: wsId,
    threadId: "c-synthese",
    routineId: "r1",
    scheduledById: userIdMap["kofi"],
    prompt: SYN.ROUTINES[0].prompt,
    runAt: nextMonday,
    status: "pending",
  }).onConflictDoNothing();

  // ---- Summary ----
  const counts = {
    users: await db.select({ c: sql<number>`count(*)` }).from(user),
    workspaces: await db.select({ c: sql<number>`count(*)` }).from(workspace),
    threads: await db.select({ c: sql<number>`count(*)` }).from(thread),
    artifacts: await db.select({ c: sql<number>`count(*)` }).from(artifact),
    routines: await db.select({ c: sql<number>`count(*)` }).from(routine),
    routineRuns: await db.select({ c: sql<number>`count(*)` }).from(routineRun),
    prompts: await db.select({ c: sql<number>`count(*)` }).from(prompt),
    promptCategories: await db.select({ c: sql<number>`count(*)` }).from(promptCategory),
    messages: await db.select({ c: sql<number>`count(*)` }).from(message),
    scheduledTasks: await db.select({ c: sql<number>`count(*)` }).from(scheduledTask),
  };
  console.log("\nSeed complete:");
  for (const [k, v] of Object.entries(counts)) {
    console.log(`  ${k}: ${v[0].c}`);
  }
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
