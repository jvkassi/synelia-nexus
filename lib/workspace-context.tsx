"use client";

import { createContext, type ReactNode, useContext } from "react";

/* Synelia — contexte de l'espace de travail actif (résolu côté serveur
   dans app/(workspace)/w/[slug]/layout.tsx, consommé par le shell). */

export type WorkspaceInfo = {
  id: string;
  name: string;
  slug: string;
};

export type WorkspaceMemberInfo = {
  userId: string;
  role: "owner" | "member";
  email: string;
  name: string | null;
};

export type ProjectInfo = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  visibility: "private" | "public_to_workspace";
  isMember: boolean;
};

export type RecentChatInfo = {
  id: string;
  title: string;
  projectId: string | null;
  projectName: string;
  projectColor: string | null;
};

export type WorkspaceContextValue = {
  workspace: WorkspaceInfo;
  role: "owner" | "member";
  currentUserId: string;
  members: WorkspaceMemberInfo[];
  projects: ProjectInfo[];
  recentChats: RecentChatInfo[];
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({
  value,
  children,
}: {
  value: WorkspaceContextValue;
  children: ReactNode;
}) {
  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace doit être utilisé sous WorkspaceProvider");
  }
  return ctx;
}
