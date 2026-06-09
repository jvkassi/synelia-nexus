"use client";

import { createContext, useCallback, useContext, useState } from "react";

export type ModalKind =
  | "new-project"
  | "invite"
  | "new-chat"
  | "new-prompt"
  | "use-prompt"
  | "visibility"
  | "artifact";

export interface ModalState {
  kind: ModalKind | null;
  props?: Record<string, unknown>;
}

interface ModalCtx {
  modal: ModalState;
  openModal: (kind: ModalKind, props?: Record<string, unknown>) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalCtx | null>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modal, setModal] = useState<ModalState>({ kind: null });

  const openModal = useCallback((kind: ModalKind, props?: Record<string, unknown>) => {
    setModal({ kind, props });
  }, []);

  const closeModal = useCallback(() => {
    setModal({ kind: null });
  }, []);

  return (
    <ModalContext.Provider value={{ modal, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal(): ModalCtx {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used inside <ModalProvider>");
  return ctx;
}
