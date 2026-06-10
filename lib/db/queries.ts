import "server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  inArray,
  lt,
  type SQL,
} from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { ArtifactKind } from "@/components/chat/artifact";
import type { VisibilityType } from "@/components/chat/visibility-selector";
import { ChatbotError } from "../errors";
import { generateUUID } from "../utils";
import {
  type Chat,
  chat,
  type DBMessage,
  document,
  message,
  type Project,
  project,
  projectMember,
  type Suggestion,
  stream,
  suggestion,
  type User,
  user,
  vote,
  type Workspace,
  type WorkspaceMember,
  workspace,
  workspaceMember,
} from "./schema";
import { generateHashedPassword } from "./utils";

const client = postgres(process.env.POSTGRES_URL ?? "");
const db = drizzle(client);

export async function getUser(email: string): Promise<User[]> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get user by email"
    );
  }
}

export async function getUserById(id: string): Promise<User[]> {
  try {
    return await db.select().from(user).where(eq(user.id, id));
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to get user by id");
  }
}

export async function createUser(email: string, password: string) {
  const hashedPassword = generateHashedPassword(password);

  try {
    return await db.insert(user).values({ email, password: hashedPassword });
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to create user");
  }
}

export async function createGuestUser() {
  const email = `guest-${Date.now()}`;
  const password = generateHashedPassword(generateUUID());

  try {
    return await db.insert(user).values({ email, password }).returning({
      id: user.id,
      email: user.email,
    });
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to create guest user"
    );
  }
}

export async function saveChat({
  id,
  userId,
  title,
  visibility,
}: {
  id: string;
  userId: string;
  title: string;
  visibility: VisibilityType;
}) {
  try {
    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
      visibility,
    });
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to save chat");
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await db.delete(vote).where(eq(vote.chatId, id));
    await db.delete(message).where(eq(message.chatId, id));
    await db.delete(stream).where(eq(stream.chatId, id));

    const [chatsDeleted] = await db
      .delete(chat)
      .where(eq(chat.id, id))
      .returning();
    return chatsDeleted;
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to delete chat by id"
    );
  }
}

export async function deleteAllChatsByUserId({ userId }: { userId: string }) {
  try {
    const userChats = await db
      .select({ id: chat.id })
      .from(chat)
      .where(eq(chat.userId, userId));

    if (userChats.length === 0) {
      return { deletedCount: 0 };
    }

    const chatIds = userChats.map((c) => c.id);

    await db.delete(vote).where(inArray(vote.chatId, chatIds));
    await db.delete(message).where(inArray(message.chatId, chatIds));
    await db.delete(stream).where(inArray(stream.chatId, chatIds));

    const deletedChats = await db
      .delete(chat)
      .where(eq(chat.userId, userId))
      .returning();

    return { deletedCount: deletedChats.length };
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to delete all chats by user id"
    );
  }
}

export async function getChatsByUserId({
  id,
  limit,
  startingAfter,
  endingBefore,
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}) {
  try {
    const extendedLimit = limit + 1;

    const query = (whereCondition?: SQL<unknown>) =>
      db
        .select()
        .from(chat)
        .where(
          whereCondition
            ? and(whereCondition, eq(chat.userId, id))
            : eq(chat.userId, id)
        )
        .orderBy(desc(chat.createdAt))
        .limit(extendedLimit);

    let filteredChats: Chat[] = [];

    if (startingAfter) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, startingAfter))
        .limit(1);

      if (!selectedChat) {
        throw new ChatbotError(
          "not_found:database",
          `Chat with id ${startingAfter} not found`
        );
      }

      filteredChats = await query(gt(chat.createdAt, selectedChat.createdAt));
    } else if (endingBefore) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, endingBefore))
        .limit(1);

      if (!selectedChat) {
        throw new ChatbotError(
          "not_found:database",
          `Chat with id ${endingBefore} not found`
        );
      }

      filteredChats = await query(lt(chat.createdAt, selectedChat.createdAt));
    } else {
      filteredChats = await query();
    }

    const hasMore = filteredChats.length > limit;

    return {
      chats: hasMore ? filteredChats.slice(0, limit) : filteredChats,
      hasMore,
    };
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get chats by user id"
    );
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    if (!selectedChat) {
      return null;
    }

    return selectedChat;
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to get chat by id");
  }
}

export async function saveMessages({ messages }: { messages: DBMessage[] }) {
  try {
    return await db.insert(message).values(messages);
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to save messages");
  }
}

export async function updateMessage({
  id,
  parts,
}: {
  id: string;
  parts: DBMessage["parts"];
}) {
  try {
    return await db.update(message).set({ parts }).where(eq(message.id, id));
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to update message");
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get messages by chat id"
    );
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: "up" | "down";
}) {
  try {
    const [existingVote] = await db
      .select()
      .from(vote)
      .where(and(eq(vote.messageId, messageId)));

    if (existingVote) {
      return await db
        .update(vote)
        .set({ isUpvoted: type === "up" })
        .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
    }
    return await db.insert(vote).values({
      chatId,
      messageId,
      isUpvoted: type === "up",
    });
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to vote message");
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db.select().from(vote).where(eq(vote.chatId, id));
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get votes by chat id"
    );
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}) {
  try {
    return await db
      .insert(document)
      .values({
        id,
        title,
        kind,
        content,
        userId,
        createdAt: new Date(),
      })
      .returning();
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to save document");
  }
}

export async function updateDocumentContent({
  id,
  content,
}: {
  id: string;
  content: string;
}) {
  try {
    const docs = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(desc(document.createdAt))
      .limit(1);

    const latest = docs[0];
    if (!latest) {
      throw new ChatbotError("not_found:database", "Document not found");
    }

    return await db
      .update(document)
      .set({ content })
      .where(and(eq(document.id, id), eq(document.createdAt, latest.createdAt)))
      .returning();
  } catch (_error) {
    if (_error instanceof ChatbotError) {
      throw _error;
    }
    throw new ChatbotError(
      "bad_request:database",
      "Failed to update document content"
    );
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const documents = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(asc(document.createdAt));

    return documents;
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get documents by id"
    );
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const [selectedDocument] = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(desc(document.createdAt));

    return selectedDocument;
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get document by id"
    );
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await db
      .delete(suggestion)
      .where(
        and(
          eq(suggestion.documentId, id),
          gt(suggestion.documentCreatedAt, timestamp)
        )
      );

    return await db
      .delete(document)
      .where(and(eq(document.id, id), gt(document.createdAt, timestamp)))
      .returning();
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to delete documents by id after timestamp"
    );
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Suggestion[];
}) {
  try {
    return await db.insert(suggestion).values(suggestions);
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to save suggestions"
    );
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await db
      .select()
      .from(suggestion)
      .where(eq(suggestion.documentId, documentId));
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get suggestions by document id"
    );
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id));
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get message by id"
    );
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = await db
      .select({ id: message.id })
      .from(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp))
      );

    const messageIds = messagesToDelete.map(
      (currentMessage) => currentMessage.id
    );

    if (messageIds.length > 0) {
      await db
        .delete(vote)
        .where(
          and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds))
        );

      return await db
        .delete(message)
        .where(
          and(eq(message.chatId, chatId), inArray(message.id, messageIds))
        );
    }
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to delete messages by chat id after timestamp"
    );
  }
}

export async function updateChatVisibilityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: "private" | "public";
}) {
  try {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to update chat visibility by id"
    );
  }
}

export async function updateChatTitleById({
  chatId,
  title,
}: {
  chatId: string;
  title: string;
}) {
  try {
    return await db.update(chat).set({ title }).where(eq(chat.id, chatId));
  } catch (_error) {
    return;
  }
}

export async function getMessageCountByUserId({
  id,
  differenceInHours,
}: {
  id: string;
  differenceInHours: number;
}) {
  try {
    const cutoffTime = new Date(
      Date.now() - differenceInHours * 60 * 60 * 1000
    );

    const [stats] = await db
      .select({ count: count(message.id) })
      .from(message)
      .innerJoin(chat, eq(message.chatId, chat.id))
      .where(
        and(
          eq(chat.userId, id),
          gte(message.createdAt, cutoffTime),
          eq(message.role, "user")
        )
      )
      .execute();

    return stats?.count ?? 0;
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get message count by user id"
    );
  }
}

export async function createStreamId({
  streamId,
  chatId,
}: {
  streamId: string;
  chatId: string;
}) {
  try {
    await db
      .insert(stream)
      .values({ id: streamId, chatId, createdAt: new Date() });
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to create stream id"
    );
  }
}

export async function getStreamIdsByChatId({ chatId }: { chatId: string }) {
  try {
    const streamIds = await db
      .select({ id: stream.id })
      .from(stream)
      .where(eq(stream.chatId, chatId))
      .orderBy(asc(stream.createdAt))
      .execute();

    return streamIds.map(({ id }) => id);
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get stream ids by chat id"
    );
  }
}

/* ============================================================
   SYNELIA COWORK — espaces de travail, projets, accès
   ============================================================ */

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

export async function getChatsByProjectId({
  projectId,
}: {
  projectId: string;
}): Promise<Chat[]> {
  try {
    return await db
      .select()
      .from(chat)
      .where(eq(chat.projectId, projectId))
      .orderBy(desc(chat.updatedAt), desc(chat.createdAt));
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get chats by project id"
    );
  }
}

export type ChatAccess = {
  chat: Chat;
  project: Project | null;
};

/**
 * Accès conversation : si la conversation appartient à un projet,
 * l'accès suit getProjectAccess ; sinon (héritage), propriétaire uniquement.
 */
export async function getChatAccess({
  userId,
  chatId,
}: {
  userId: string;
  chatId: string;
}): Promise<ChatAccess | undefined> {
  try {
    const [row] = await db.select().from(chat).where(eq(chat.id, chatId));
    if (!row) {
      return;
    }

    if (row.projectId === null) {
      // conversation personnelle héritée : sémantique propriétaire conservée
      if (row.userId !== userId && row.visibility !== "public") {
        return;
      }
      return { chat: row, project: null };
    }

    const access = await getProjectAccess({
      userId,
      projectId: row.projectId,
    });
    if (!access) {
      return;
    }
    return { chat: row, project: access.project };
  } catch (error) {
    if (error instanceof ChatbotError) {
      throw error;
    }
    throw new ChatbotError("bad_request:database", "Failed to get chat access");
  }
}

export async function touchChat({ chatId }: { chatId: string }) {
  try {
    await db
      .update(chat)
      .set({ updatedAt: new Date() })
      .where(eq(chat.id, chatId));
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to touch chat");
  }
}

/**
 * Conversations récentes de l'espace, limitées aux projets visibles
 * par l'utilisateur (membre ou projet public).
 */
export async function getRecentChatsForWorkspace({
  workspaceId,
  userId,
  limit = 8,
}: {
  workspaceId: string;
  userId: string;
  limit?: number;
}): Promise<
  Array<Chat & { projectName: string; projectColor: string | null }>
> {
  try {
    const visible = await getProjectsForUser({ workspaceId, userId });
    if (visible.length === 0) {
      return [];
    }
    const byId = new Map(visible.map((p) => [p.id, p]));

    const rows = await db
      .select()
      .from(chat)
      .where(
        inArray(
          chat.projectId,
          visible.map((p) => p.id)
        )
      )
      .orderBy(desc(chat.updatedAt), desc(chat.createdAt))
      .limit(limit);

    return rows.map((c) => {
      const proj = c.projectId ? byId.get(c.projectId) : undefined;
      return {
        ...c,
        projectName: proj?.name ?? "",
        projectColor: proj?.color ?? null,
      };
    });
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get recent chats for workspace"
    );
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
