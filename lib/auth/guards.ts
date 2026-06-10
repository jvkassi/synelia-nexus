import "server-only";

import {
  type ChatAccess,
  getChatAccess,
  getProjectAccess,
  getWorkspaceMembership,
  type ProjectAccess,
} from "@/lib/db/queries";
import type { WorkspaceMember } from "@/lib/db/schema";
import { ChatbotError } from "@/lib/errors";

/**
 * Garde-fous d'autorisation appelés depuis les route handlers.
 * L'autorisation est applicative (pas de RLS sur les tables) :
 * chaque garde fait un aller-retour SQL et lève une ChatbotError
 * (403/404) si l'accès est refusé.
 */

export async function requireWorkspaceMember(
  userId: string,
  workspaceId: string
): Promise<WorkspaceMember> {
  const membership = await getWorkspaceMembership({ userId, workspaceId });
  if (!membership) {
    throw new ChatbotError("forbidden:workspace");
  }
  return membership;
}

export async function requireWorkspaceOwner(
  userId: string,
  workspaceId: string
): Promise<WorkspaceMember> {
  const membership = await requireWorkspaceMember(userId, workspaceId);
  if (membership.role !== "owner") {
    throw new ChatbotError("forbidden:workspace");
  }
  return membership;
}

/**
 * Accès projet : membre du projet OU projet public dans l'espace.
 */
export async function requireProjectAccess(
  userId: string,
  projectId: string
): Promise<ProjectAccess> {
  const access = await getProjectAccess({ userId, projectId });
  if (!access) {
    throw new ChatbotError("forbidden:project");
  }
  return access;
}

/**
 * Accès conversation : suit l'accès projet si la conversation est
 * rattachée à un projet ; sinon sémantique propriétaire héritée.
 */
export async function requireChatAccess(
  userId: string,
  chatId: string
): Promise<ChatAccess> {
  const access = await getChatAccess({ userId, chatId });
  if (!access) {
    throw new ChatbotError("forbidden:chat");
  }
  return access;
}
