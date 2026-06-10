"use client";

import { type ReactNode, useState } from "react";
import { Toaster } from "sonner";
import { InviteModal } from "@/components/synelia/modals/invite-modal";
import { NewProjectModal } from "@/components/synelia/modals/new-project-modal";
import { Topbar } from "@/components/synelia/topbar";
import { WorkspaceSidebar } from "@/components/synelia/workspace-sidebar";

/* Enveloppe cliente du shell : porte l'état des modales
   (Nouveau projet, Inviter) au-dessus de la sidebar et de la topbar. */

export function WorkspaceChrome({
  userName,
  userRole,
  children,
}: {
  userName: string;
  userRole: string;
  children: ReactNode;
}) {
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-secondary">
      <WorkspaceSidebar
        onNewProject={() => setNewProjectOpen(true)}
        userName={userName}
        userRole={userRole}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onInvite={() => setInviteOpen(true)} />
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>

      <Toaster
        position="top-center"
        toastOptions={{
          className:
            "!bg-card !text-foreground !border-border/50 !shadow-[var(--shadow-float)]",
        }}
      />

      <NewProjectModal onOpenChange={setNewProjectOpen} open={newProjectOpen} />
      <InviteModal onOpenChange={setInviteOpen} open={inviteOpen} />
    </div>
  );
}
