import "server-only";

import { and, asc, count, desc, eq } from "drizzle-orm";
import { ChatbotError } from "@/lib/errors";
import { db } from "../client";
import {
  chat,
  type Project,
  project,
  projectFile,
  projectMember,
  user,
  type WorkspaceMember,
  workspaceMember,
} from "../schema";

export async function createProject({
  workspaceId,
  name,
  description,
  icon,
  color,
  visibility = "private",
  userId,
  memberIds = [],
}: {
  workspaceId: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  visibility?: Project["visibility"];
  userId: string;
  memberIds?: string[];
}): Promise<Project> {
  try {
    return await db.transaction(async (tx) => {
      const [proj] = await tx
        .insert(project)
        .values({
          workspaceId,
          name,
          description,
          icon,
          color,
          visibility,
          createdBy: userId,
        })
        .returning();

      const members = Array.from(new Set([userId, ...memberIds]));
      await tx.insert(projectMember).values(
        members.map((id) => ({
          projectId: proj.id,
          userId: id,
          addedBy: userId,
        }))
      );

      return proj;
    });
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to create project");
  }
}

export async function getProjectById({
  id,
}: {
  id: string;
}): Promise<Project | undefined> {
  try {
    const [proj] = await db.select().from(project).where(eq(project.id, id));
    return proj;
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get project by id"
    );
  }
}

/**
 * Projets visibles par un utilisateur dans un espace :
 * ceux dont il est membre + ceux publics pour l'espace.
 */
export async function getProjectsForUser({
  workspaceId,
  userId,
}: {
  workspaceId: string;
  userId: string;
}): Promise<Array<Project & { isMember: boolean }>> {
  try {
    const rows = await db
      .select({
        project,
        memberUserId: projectMember.userId,
      })
      .from(project)
      .leftJoin(
        projectMember,
        and(
          eq(projectMember.projectId, project.id),
          eq(projectMember.userId, userId)
        )
      )
      .where(eq(project.workspaceId, workspaceId))
      .orderBy(desc(project.updatedAt));

    return rows
      .filter(
        (r) =>
          r.memberUserId !== null ||
          r.project.visibility === "public_to_workspace"
      )
      .map((r) => ({ ...r.project, isMember: r.memberUserId !== null }));
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get projects for user"
    );
  }
}

export type ProjectAccess = {
  project: Project;
  membership: WorkspaceMember;
  via: "member" | "workspace_public";
};

/**
 * Accès projet en un aller-retour SQL :
 * membre du projet OU (projet public_to_workspace ET membre de l'espace).
 * Retourne undefined si pas d'accès.
 */
export async function getProjectAccess({
  userId,
  projectId,
}: {
  userId: string;
  projectId: string;
}): Promise<ProjectAccess | undefined> {
  try {
    const rows = await db
      .select({
        project,
        wsMember: workspaceMember,
        projMemberUserId: projectMember.userId,
      })
      .from(project)
      .innerJoin(
        workspaceMember,
        and(
          eq(workspaceMember.workspaceId, project.workspaceId),
          eq(workspaceMember.userId, userId)
        )
      )
      .leftJoin(
        projectMember,
        and(
          eq(projectMember.projectId, project.id),
          eq(projectMember.userId, userId)
        )
      )
      .where(eq(project.id, projectId));

    const row = rows.at(0);
    if (!row) {
      return;
    }
    if (row.projMemberUserId !== null) {
      return { project: row.project, membership: row.wsMember, via: "member" };
    }
    if (row.project.visibility === "public_to_workspace") {
      return {
        project: row.project,
        membership: row.wsMember,
        via: "workspace_public",
      };
    }
    return;
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get project access"
    );
  }
}

export async function getProjectMembers({ projectId }: { projectId: string }) {
  try {
    return await db
      .select({
        userId: projectMember.userId,
        addedAt: projectMember.addedAt,
        email: user.email,
        name: user.name,
        image: user.image,
      })
      .from(projectMember)
      .innerJoin(user, eq(projectMember.userId, user.id))
      .where(eq(projectMember.projectId, projectId))
      .orderBy(asc(projectMember.addedAt));
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get project members"
    );
  }
}

export async function addProjectMember({
  projectId,
  userId,
  addedBy,
}: {
  projectId: string;
  userId: string;
  addedBy: string;
}) {
  try {
    await db
      .insert(projectMember)
      .values({ projectId, userId, addedBy })
      .onConflictDoNothing();
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to add project member"
    );
  }
}

export async function updateProjectById({
  id,
  data,
}: {
  id: string;
  data: Partial<
    Pick<Project, "name" | "description" | "visibility" | "icon" | "color">
  >;
}) {
  try {
    const [proj] = await db
      .update(project)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(project.id, id))
      .returning();
    return proj;
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to update project");
  }
}

/**
 * Statistiques par projet (conversations, membres) pour le tableau de bord.
 */
export async function getProjectStatsForWorkspace({
  workspaceId,
}: {
  workspaceId: string;
}): Promise<Map<string, { chatCount: number; memberCount: number }>> {
  try {
    const [chatCounts, memberCounts] = await Promise.all([
      db
        .select({ projectId: chat.projectId, n: count() })
        .from(chat)
        .innerJoin(project, eq(chat.projectId, project.id))
        .where(eq(project.workspaceId, workspaceId))
        .groupBy(chat.projectId),
      db
        .select({ projectId: projectMember.projectId, n: count() })
        .from(projectMember)
        .innerJoin(project, eq(projectMember.projectId, project.id))
        .where(eq(project.workspaceId, workspaceId))
        .groupBy(projectMember.projectId),
    ]);

    const stats = new Map<string, { chatCount: number; memberCount: number }>();
    for (const row of chatCounts) {
      if (row.projectId) {
        stats.set(row.projectId, { chatCount: row.n, memberCount: 0 });
      }
    }
    for (const row of memberCounts) {
      const entry = stats.get(row.projectId) ?? {
        chatCount: 0,
        memberCount: 0,
      };
      entry.memberCount = row.n;
      stats.set(row.projectId, entry);
    }
    return stats;
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get project stats"
    );
  }
}

export async function getProjectFiles({ projectId }: { projectId: string }) {
  try {
    return await db
      .select()
      .from(projectFile)
      .where(eq(projectFile.projectId, projectId))
      .orderBy(desc(projectFile.createdAt));
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get project files"
    );
  }
}
