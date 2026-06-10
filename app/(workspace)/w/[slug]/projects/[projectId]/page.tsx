import {
  ArrowUp,
  BookOpen,
  Folder,
  Globe,
  Lock,
  MessageSquare,
  Plug,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { colorFor, SynAvatarStack } from "@/components/synelia/avatar";
import { ProjectRail } from "@/components/synelia/project/project-rail";
import {
  getChatsByProjectId,
  getProjectAccess,
  getProjectFiles,
  getProjectMembers,
  getRoutinesByProjectId,
} from "@/lib/db/queries";

/* Détail projet — composeur + conversations à gauche, rail à droite */

const STROKE = 1.75;

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string; projectId: string }>;
}) {
  const { slug, projectId } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const access = await getProjectAccess({
    userId: session.user.id,
    projectId,
  });
  if (!access) {
    notFound();
  }
  const { project } = access;

  const [chats, members, routines, files] = await Promise.all([
    getChatsByProjectId({ projectId }),
    getProjectMembers({ projectId }),
    getRoutinesByProjectId({ projectId }),
    getProjectFiles({ projectId }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-8 py-8">
      {/* En-tête */}
      <div className="mb-7 flex items-center gap-4">
        <span
          className="grid size-11 flex-none place-items-center rounded-lg"
          style={{ background: project.color ?? colorFor(project.id) }}
        >
          <Folder className="text-white" size={20} strokeWidth={STROKE} />
        </span>
        <div className="min-w-0 flex-1">
          <h1
            className="truncate font-bold text-2xl text-primary"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {project.name}
          </h1>
          <p className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
            Mis à jour le {project.updatedAt.toLocaleDateString("fr-FR")}
            <span aria-hidden>·</span>
            {project.visibility === "public_to_workspace" ? (
              <span className="inline-flex items-center gap-1">
                <Globe size={12} strokeWidth={STROKE} /> Public pour
                l&apos;espace
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <Lock size={12} strokeWidth={STROKE} /> Espace privé
              </span>
            )}
          </p>
        </div>
        <SynAvatarStack
          size={30}
          users={members.map((m) => ({
            id: m.userId,
            name: m.name ?? m.email,
          }))}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          {/* Composeur (décoratif en v1 — la conversation arrive en phase 3) */}
          <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-composer)]">
            <textarea
              className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Démarrer une tâche dans ce projet…"
              rows={2}
            />
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
                  type="button"
                >
                  <Plus size={15} strokeWidth={STROKE} />
                </button>
                <button
                  className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
                  type="button"
                >
                  <BookOpen size={15} strokeWidth={STROKE} /> Connaissances
                </button>
                <button
                  className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
                  type="button"
                >
                  <Plug size={15} strokeWidth={STROKE} /> Connecteurs
                </button>
              </div>
              <button
                className="grid size-8 place-items-center rounded-full bg-primary text-white opacity-50"
                disabled
                type="button"
              >
                <ArrowUp size={16} strokeWidth={STROKE} />
              </button>
            </div>
          </div>

          {/* Conversations */}
          <h2
            className="mt-6 mb-3 font-semibold text-[15px] text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Conversations
          </h2>
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-[var(--shadow-card)]">
            {chats.map((c) => (
              <Link
                className="flex items-center gap-3 border-secondary border-b px-4 py-3 transition-colors last:border-b-0 hover:bg-secondary"
                href={`/w/${slug}/projects/${projectId}/chat/${c.id}`}
                key={c.id}
              >
                <span className="grid size-8 flex-none place-items-center rounded-md bg-secondary text-primary-mid">
                  <MessageSquare size={15} strokeWidth={STROKE} />
                </span>
                <span className="min-w-0 flex-1 truncate text-[13.5px] text-foreground">
                  {c.title}
                </span>
                <span className="flex-none text-[12px] text-muted-foreground">
                  {(c.updatedAt ?? c.createdAt).toLocaleDateString("fr-FR")}
                </span>
              </Link>
            ))}
            {chats.length === 0 && (
              <div className="px-4 py-6 text-center text-muted-foreground text-sm">
                Aucune conversation. Démarrez-en une ci-dessus.
              </div>
            )}
          </div>
        </div>

        <ProjectRail
          description={project.description}
          files={files}
          routines={routines}
        />
      </div>
    </div>
  );
}
