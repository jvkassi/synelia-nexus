import "server-only";

import { asc, eq } from "drizzle-orm";
import { ChatbotError } from "@/lib/errors";
import { db } from "../client";
import { routine } from "../schema";

export async function getRoutinesByProjectId({
  projectId,
}: {
  projectId: string;
}) {
  try {
    return await db
      .select()
      .from(routine)
      .where(eq(routine.projectId, projectId))
      .orderBy(asc(routine.createdAt));
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get routines by project id"
    );
  }
}
