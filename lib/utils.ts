import type {
  UIMessage,
  UIMessagePart,
} from 'ai';
import { type ClassValue, clsx } from 'clsx';
import { formatISO } from 'date-fns';
import { twMerge } from 'tailwind-merge';
import type { DBMessage, Document } from '@/lib/db/schema';
import { ChatbotError, type ErrorCode } from './errors';
import type { ChatMessage, ChatTools, CustomUIDataTypes } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fetcher = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    const { code, cause } = await response.json();
    throw new ChatbotError(code as ErrorCode, cause);
  }

  return response.json();
};

export async function fetchWithErrorHandlers(
  input: RequestInfo | URL,
  init?: RequestInit,
) {
  try {
    const response = await fetch(input, init);

    if (!response.ok) {
      const { code, cause } = await response.json();
      throw new ChatbotError(code as ErrorCode, cause);
    }

    return response;
  } catch (error: unknown) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new ChatbotError('offline:chat');
    }

    throw error;
  }
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getDocumentTimestampByIndex(
  documents: Document[],
  index: number,
) {
  if (!documents) { return new Date(); }
  if (index > documents.length) { return new Date(); }

  return documents[index].createdAt;
}

export function sanitizeText(text: string) {
  return text.replace('<has_function_call>', '');
}

export function convertToUIMessages(
  messages: DBMessage[],
  options?: { authorNames?: Map<string, string> },
): ChatMessage[] {
  return messages.map((message) => ({
    id: message.id,
    role: message.role as 'user' | 'assistant' | 'system',
    parts: message.parts as UIMessagePart<CustomUIDataTypes, ChatTools>[],
    metadata: {
      createdAt: formatISO(message.createdAt),
      authorId: message.authorId ?? null,
      authorName:
        (message.authorId
          ? options?.authorNames?.get(message.authorId)
          : null) ?? null,
      tag: message.tag ?? null,
      isInterrupted: message.isInterrupted,
    },
  }));
}

/* Chemins de conversation — racine héritée (/chat/:id) ou
   espace de travail (/w/:slug/projects/:projectId/chat/:id). */

const PROJECT_BASE_PATTERN = /^\/w\/[^/]+\/projects\/[0-9a-fA-F-]{36}/;

export function getProjectBasePath(pathname: string): string | null {
  const match = pathname.match(PROJECT_BASE_PATTERN);
  return match ? match[0] : null;
}

/** URL de la conversation, selon le contexte courant (pathname sans basePath). */
export function buildChatPath(pathname: string, chatId: string): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  const projectBase = getProjectBasePath(pathname) ?? '';
  return `${basePath}${projectBase}/chat/${chatId}`;
}

/** Cible « accueil » : la page projet dans l'espace, sinon la racine. */
export function buildChatHomePath(pathname: string): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  const projectBase = getProjectBasePath(pathname);
  return projectBase ? `${basePath}${projectBase}` : `${basePath}/`;
}

export function getTextFromMessage(message: ChatMessage | UIMessage): string {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => (part as { type: 'text'; text: string}).text)
    .join('');
}
