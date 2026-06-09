"use client";

import { PlusIcon } from "lucide-react";
import { useModal } from "@/components/synelia/modal-context";

/**
 * Client button that opens the NewChat modal.
 * Used in the project header to trigger Phase 2.5 toast wiring.
 */
export function NewChatButton() {
  const { openModal } = useModal();
  return (
    <button
      className="btn btn-primary btn-sm"
      type="button"
      onClick={() => openModal("new-chat")}
    >
      <PlusIcon size={14} />
      Nouvelle conversation
    </button>
  );
}
