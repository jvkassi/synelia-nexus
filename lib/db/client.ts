import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

/* Client Postgres partagé. En dev, le pool est mis en cache sur globalThis
   pour survivre au rechargement à chaud — sinon chaque recompilation ouvre
   un nouveau pool et épuise les connexions du serveur. */

const globalForDb = globalThis as unknown as {
  __syneliaSql?: ReturnType<typeof postgres>;
};

const client =
  globalForDb.__syneliaSql ??
  postgres(process.env.POSTGRES_URL ?? "", { max: 10 });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__syneliaSql = client;
}

export const db = drizzle(client);
