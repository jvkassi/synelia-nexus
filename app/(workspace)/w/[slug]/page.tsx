import { Folder, Globe, LayoutGrid, MessageSquare, Users } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { colorFor } from "@/components/synelia/avatar";
import {
  getProjectStatsForWorkspace,
  getProjectsForUser,
  getRecentChatsForWorkspace,
  getWorkspaceBySlug,
} from "@/lib/db/queries";

/* Accueil de l'espace de travail — projets partagés + conversations récentes */

const STROKE = 1.75;

function firstName(name: string | null | undefined): string {
  return name?.split(/\s+/)[0] ?? "";
}

export default async function WorkspaceHomePage({
  params,
}: {
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

  const [projects, recents, stats] = await Promise.all([
    getProjectsForUser({ workspaceId: workspace.id, userId: session.user.id }),
    getRecentChatsForWorkspace({
      workspaceId: workspace.id,
      userId: session.user.id,
      limit: 7,
    }),
    getProjectStatsForWorkspace({ workspaceId: workspace.id }),
  ]);

  const greeting = firstName(session.user.name);

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <div className="mb-2 flex items-end justify-between gap-4">
        <div>
          <h1
            className="page-title font-bold text-3xl text-primary"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {greeting ? `Bonjour, ${greeting}` : "Bonjour"}
          </h1>
          <p className="mt-1 text-[15px] text-muted-foreground">
            Voici l&apos;activité de votre espace de travail.
          </p>
        </div>
      </div>
      <div className="synelia-rule" />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Projets partagés */}
        <section>
          <h2
            className="mb-4 font-semibold text-[15px] text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Projets partagés
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {projects.map((p) => {
              const s = stats.get(p.id);
              return (
                <Link
                  className="group rounded-lg border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-px hover:shadow-[var(--shadow-float)]"
                  href={`/w/${slug}/projects/${p.id}`}
                  key={p.id}
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span
                      className="grid size-9 flex-none place-items-center rounded-[7px]"
                      style={{ background: p.color ?? colorFor(p.id) }}
                    >
                      <Folder
                        className="text-white"
                        size={17}
                        strokeWidth={STROKE}
                      />
                    </span>
                    <span
                      className="min-w-0 flex-1 truncate font-semibold text-[14.5px] text-foreground group-hover:text-primary"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {p.name}
                    </span>
                    {p.visibility === "public_to_workspace" && (
                      <Globe
                        className="flex-none text-muted-foreground"
                        size={14}
                        strokeWidth={STROKE}
                      />
                    )}
                  </div>
                  {p.description && (
                    <p className="mb-4 line-clamp-2 text-[13px] text-muted-foreground leading-relaxed">
                      {p.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare size={13} strokeWidth={STROKE} />
                      {s?.chatCount ?? 0} conversations
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users size={13} strokeWidth={STROKE} />
                      {s?.memberCount ?? 0} membres
                    </span>
                  </div>
                </Link>
              );
            })}
            {projects.length === 0 && (
              <div className="col-span-full rounded-lg border border-border border-dashed p-8 text-center text-muted-foreground text-sm">
                Aucun projet pour le moment. Créez votre premier projet depuis
                la barre latérale.
              </div>
            )}
          </div>
        </section>

        {/* Conversations récentes */}
        <aside>
          <h2
            className="mb-4 font-semibold text-[15px] text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Conversations récentes
          </h2>
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-[var(--shadow-card)]">
            {recents.map((c) => (
              <Link
                className="flex items-center gap-3 border-secondary border-b px-4 py-3 transition-colors last:border-b-0 hover:bg-secondary"
                href={`/w/${slug}/projects/${c.projectId}/chat/${c.id}`}
                key={c.id}
              >
                <span
                  className="grid size-7 flex-none place-items-center rounded-md"
                  style={{
                    background: `${c.projectColor ?? "#6B3FA0"}1A`,
                  }}
                >
                  <LayoutGrid
                    size={13}
                    strokeWidth={STROKE}
                    style={{ color: c.projectColor ?? "#6B3FA0" }}
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] text-foreground">
                    {c.title}
                  </span>
                  <span className="block truncate text-[11.5px] text-muted-foreground">
                    {c.projectName}
                  </span>
                </span>
              </Link>
            ))}
            {recents.length === 0 && (
              <div className="px-4 py-6 text-center text-muted-foreground text-sm">
                Aucune conversation récente.
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
