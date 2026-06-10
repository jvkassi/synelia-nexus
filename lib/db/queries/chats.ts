import "server-only";

import { and, desc, eq, gt, inArray, lt, type SQL } from "drizzle-orm";
import type { VisibilityType } from "@/components/chat/visibility-selector";
import { ChatbotError } from "@/lib/errors";
import { db } from "../client";
import {
  type Chat,
  chat,
  message,
  type Project,
  stream,
  vote,
} from "../schema";
import { getProjectAccess, getProjectsForUser } from "./projects";

export async function saveChat({
  id,
  userId,
  title,
  visibility,
  projectId,
}: {
  id: string;
  userId: string;
  title: string;
  visibility: VisibilityType;
  projectId?: string | null;
}) {
  try {
    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
      visibility,
      projectId: projectId ?? null,
      updatedAt: new Date(),
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
