import type { UIMessage } from "ai";

/**
 * Synelia Cowork — shared types.
 *
 * Kept intentionally minimal until the chat data model is migrated
 * (Phase 2 of the rebuild plan; see .hermes/TODO.md). For now we
 * just re-export the AI SDK's UIMessage as the chat-message shape,
 * and define the small Attachment type the prompt-input UI uses.
 *
 * DO NOT add Vercel-fork-shaped types here (e.g. tool registries,
 * document/suggestion unions, visibility-selector unions). Those
 * come back in Phase 2 alongside the Workspace/Thread schema.
 */

export type ChatMessage = UIMessage;

export type Attachment = {
  name: string;
  url: string;
  contentType: string;
};
