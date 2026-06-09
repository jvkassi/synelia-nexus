// lib/db/queries.ts
// Minimal auth queries — the rest of the Vercel-fork queries have been
// removed. Real queries live in lib/synelia/queries.ts (Cowork data) and
// will land as the seed refactor progresses.

import "server-only";
import { createClient } from "@libsql/client";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import { user, type User } from "./schema";
import { generateHashedPassword } from "./utils";

config({ path: ".env.local" });
config({ path: ".env" });

const rawUrl = process.env.DATABASE_URL ?? "file:./data/synelia-nexus.db";
const url = /^(file:|libsql:|https?:|wss?:)/.test(rawUrl) ? rawUrl : `file:${rawUrl}`;

const client = createClient({ url });
const db = drizzle(client);

export async function getUser(email: string): Promise<User[]> {
  return db.select().from(user).where(eq(user.email, email));
}

export async function createUser(email: string, password: string, name?: string): Promise<void> {
  await db.insert(user).values({
    email,
    password: generateHashedPassword(password),
    name: name ?? null,
  });
}

export async function createGuestUser(): Promise<User[]> {
  const id = crypto.randomUUID();
  const guestEmail = `guest-${id.slice(0, 8)}@guest.synelia.local`;
  const inserted = await db.insert(user).values({
    email: guestEmail,
    password: null,
    name: "Invité",
    isAnonymous: true,
  }).returning();
  return inserted;
}
