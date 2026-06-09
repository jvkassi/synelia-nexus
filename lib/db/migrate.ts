import { createClient } from "@libsql/client";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

config({ path: ".env.local" });
config({ path: ".env" });

const runMigrate = async () => {
  const rawUrl = process.env.DATABASE_URL ?? "file:./data/synelia-nexus.db";
  const url = /^(file:|libsql:|https?:|wss?:)/.test(rawUrl)
    ? rawUrl
    : `file:${rawUrl}`;

  const client = createClient({ url });
  const db = drizzle(client);

  console.log("Running migrations...");

  const start = Date.now();
  await migrate(db, { migrationsFolder: "./lib/db/migrations" });
  const end = Date.now();

  console.log("Migrations completed in", end - start, "ms");
  process.exit(0);
};

runMigrate().catch((err) => {
  console.error("Migration failed");
  console.error(err);
  process.exit(1);
});
