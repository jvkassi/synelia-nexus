import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/app/(auth)/auth";
import { WorkspaceChrome } from "@/components/synelia/workspace-chrome";
import {
  getProjectsForUser,
  getRecentChatsForWorkspace,
  getWorkspaceBySlug,
  getWorkspaceMembers,
  getWorkspaceMembership,
} from "@/lib/db/queries";
import {
  type WorkspaceContextValue,
  WorkspaceProvider,
} from "@/lib/workspace-context";

/* Shell de l'espace de travail : résout l'espace depuis le slug,
   vérifie l'appartenance, charge les données du shell. Le travail
   dynamique vit dans <WorkspaceShell> sous une frontière Suspense
   (exigence cacheComponents de Next 16). */

export default function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<div className="flex h-dvh bg-primary-dark" />}>
      <WorkspaceShell params={params}>{children}</WorkspaceShell>
    </Suspense>
  );
}

async function WorkspaceShell({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const workspace = await getWorkspaceBySlug({ slug });
  if (!workspace) {
    notFound();
  }

  const membership = await getWorkspaceMembership({
    userId: session.user.id,
    workspaceId: workspace.id,
  });
  if (!membership) {
    notFound();
  }

  const [members, projects, recentChats] = await Promise.all([
    getWorkspaceMembers({ workspaceId: workspace.id }),
    getProjectsForUser({ workspaceId: workspace.id, userId: session.user.id }),
    getRecentChatsForWorkspace({
      workspaceId: workspace.id,
      userId: session.user.id,
    }),
  ]);

  const value: WorkspaceContextValue = {
    workspace: {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
    },
    role: membership.role,
    currentUserId: session.user.id,
    members: members.map((m) => ({
      userId: m.userId,
      role: m.role,
      email: m.email,
      name: m.name,
    })),
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      icon: p.icon,
      color: p.color,
      visibility: p.visibility,
      isMember: p.isMember,
    })),
    recentChats: recentChats.map((c) => ({
      id: c.id,
      title: c.title,
      projectId: c.projectId,
      projectName: c.projectName,
      projectColor: c.projectColor,
    })),
  };

  const userName =
    members.find((m) => m.userId === session.user.id)?.name ??
    session.user.email ??
    "Utilisateur";

  return (
    <WorkspaceProvider value={value}>
      <WorkspaceChrome
        userName={userName}
        userRole={membership.role === "owner" ? "Propriétaire" : "Membre"}
      >
        {children}
      </WorkspaceChrome>
    </WorkspaceProvider>
  );
}
