export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { ensureLoaded } from "@/lib/synelia/queries";
import { AdminOverviewClient } from "./admin-client";

export default async function AdminPage() {
  const data = await ensureLoaded();
  return (
    <Suspense>
      <AdminOverviewClient
        projects={data.PROJECTS}
        team={Object.values(data.TEAM)}
        routines={data.ROUTINES}
        artifacts={data.ARTIFACTS}
      />
    </Suspense>
  );
}
