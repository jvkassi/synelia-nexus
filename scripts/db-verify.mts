// scripts/db-verify.mts
// One-shot script: print row counts of every Cowork table + the top
// 3 prompts. Run with:
//   npx tsx scripts/db-verify.mts
// (or `pnpm tsx scripts/db-verify.mts`)

import { config } from "dotenv";
import { createClient } from "@libsql/client";

config({ path: ".env" });
const rawUrl = process.env.DATABASE_URL ?? "./data/synelia-nexus.db";
const url = rawUrl.startsWith("file:") || rawUrl.startsWith("libsql:") || rawUrl.startsWith("http")
  ? rawUrl
  : `file:${rawUrl}`;
const c = createClient({ url });

const tables = [
  "User", "Workspace", "WorkspaceMember", "Thread", "ThreadParticipant",
  "Message", "Artifact", "Routine", "RoutineRun",
  "PromptCategory", "Prompt", "ScheduledTask",
];

console.log("Table row counts:");
for (const t of tables) {
  const r = await c.execute(`SELECT COUNT(*) as c FROM ${t}`);
  console.log(`  ${t}: ${r.rows[0].c}`);
}

const p = await c.execute("SELECT id, title, categoryId, uses FROM Prompt ORDER BY uses DESC LIMIT 3");
console.log("\nTop 3 prompts:");
p.rows.forEach((r) => console.log(`  ${r.id} "${r.title}" cat=${r.categoryId} uses=${r.uses}`));

const a = await c.execute("SELECT id, title, kind, shared FROM Artifact LIMIT 3");
console.log("\nFirst 3 artifacts:");
a.rows.forEach((r) => console.log(`  ${r.id} "${r.title}" kind=${r.kind} shared=${r.shared}`));

c.close();
