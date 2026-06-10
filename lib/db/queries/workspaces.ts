import "server-only";

import { and, asc, eq } from "drizzle-orm";
import { ChatbotError } from "@/lib/errors";
import { db } from "../client";
import {
  user,
  type Workspace,
  type WorkspaceMember,
  workspace,
  workspaceMember,
} from "../schema";

export async function createWorkspace({
  name,
  slug,
  userId,
}: {
  name: string;
  slug: string;
  userId: string;
}): Promise<Workspace> {
  try {
    return await db.transaction(async (tx) => {
      const [ws] = await tx
        .insert(workspace)
        .values({ name, slug, createdBy: userId })
        .returning();

      await tx.insert(workspaceMember).values({
        workspaceId: ws.id,
        userId,
        role: "owner",
      });

      return ws;
    });
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to create workspace"
    );
  }
}

export async function getWorkspaceBySlug({
  slug,
}: {
  slug: string;
}): Promise<Workspace | undefined> {
  try {
    const [ws] = await db
      .select()
      .from(workspace)
      .where(eq(workspace.slug, slug));
    return ws;
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get workspace by slug"
    );
  }
}

export async function getWorkspacesByUserId({
  userId,
}: {
  userId: string;
}): Promise<Array<Workspace & { role: WorkspaceMember["role"] }>> {
  try {
    const rows = await db
      .select({
        workspace,
        role: workspaceMember.role,
      })
      .from(workspaceMember)
      .innerJoin(workspace, eq(workspaceMember.workspaceId, workspace.id))
      .where(eq(workspaceMember.userId, userId))
      .orderBy(asc(workspace.createdAt));

    return rows.map((r) => ({ ...r.workspace, role: r.role }));
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get workspaces by user id"
    );
  }
}

export async function getWorkspaceMembership({
  userId,
  workspaceId,
}: {
  userId: string;
  workspaceId: string;
}): Promise<WorkspaceMember | undefined> {
  try {
    const [row] = await db
      .select()
      .from(workspaceMember)
      .where(
        and(
          eq(workspaceMember.workspaceId, workspaceId),
          eq(workspaceMember.userId, userId)
        )
      );
    return row;
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get workspace membership"
    );
  }
}

export async function getWorkspaceMembers({
  workspaceId,
}: {
  workspaceId: string;
}) {
  try {
    return await db
      .select({
        userId: workspaceMember.userId,
        role: workspaceMember.role,
        joinedAt: workspaceMember.joinedAt,
        email: user.email,
        name: user.name,
        image: user.image,
      })
      .from(workspaceMember)
      .innerJoin(user, eq(workspaceMember.userId, user.id))
      .where(eq(workspaceMember.workspaceId, workspaceId))
      .orderBy(asc(workspaceMember.joinedAt));
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get workspace members"
    );
  }
}

export async function addWorkspaceMember({
  workspaceId,
  userId,
  role = "member",
}: {
  workspaceId: string;
  userId: string;
  role?: WorkspaceMember["role"];
}) {
  try {
    await db
      .insert(workspaceMember)
      .values({ workspaceId, userId, role })
      .onConflictDoNothing();
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to add workspace member"
    );
  }
}
