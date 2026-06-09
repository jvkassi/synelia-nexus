export const dynamic = "force-dynamic";

import { ensureLoaded, ROUTINES, PROJECTS } from "@/lib/synelia/queries";
import { RoutinesClient } from "./routines-client";

/**
 * Synelia Cowork — Routines (master-detail).
 * Server component: loads data, renders client shell.
 */
export default async function RoutinesPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  await ensureLoaded();
  const { id } = await searchParams;

  const routines = ROUTINES();
  const projects = PROJECTS();

  return (
    <RoutinesClient
      routines={routines}
      projects={projects}
      initialId={id ?? null}
    />
  );
}
