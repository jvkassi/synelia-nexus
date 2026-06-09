import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });
config({ path: ".env" });

const rawUrl = process.env.DATABASE_URL ?? "file:./data/synelia-nexus.db";
const url = /^(file:|libsql:|https?:|wss?:)/.test(rawUrl)
  ? rawUrl
  : `file:${rawUrl}`;

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url,
  },
});
