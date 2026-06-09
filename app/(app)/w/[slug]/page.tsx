export const dynamic = "force-dynamic";

import {
  BookOpenIcon,
  FileTextIcon,
  GlobeIcon,
  LockIcon,
  MessageSquareIcon,
  PlusIcon,
  RepeatIcon,
  Share2Icon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { SyneliaRule } from "@/components/synelia-rule";
import { Avatar, AvatarStack } from "@/components/synelia/avatar";
import { Icon } from "@/components/synelia/icon";
import {
  getMember,
  getProject,
  getProjectArtifacts,
  getProjectChats,
  getProjectFiles,
  getProjectMembers,
  getProjectRoutines,
  KIND_TEXT,
  KIND_VAR,
} from "@/lib/synelia/data";

type TabKey = "conversations" | "artifacts" | "connaissances" | "routines" | "team";

const TABS: { key: TabKey; label: string; Icon: typeof MessageSquareIcon }[] = [
  { key: "conversations", label: "Conversations", Icon: MessageSquareIcon },
  { key: "artifacts", label: "Artefacts", Icon: FileTextIcon },
  { key: "connaissances", label: "Connaissances", Icon: BookOpenIcon },
  { key: "routines", label: "Routines", Icon: RepeatIcon },
  { key: "team", label: "Équipe", Icon: UsersIcon },
];

export default async function ProjectViewPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { slug } = await params;
  const { tab } = await searchParams;
  const project = getProject(slug);

  if (!project) {
    return (
      <div className="mx-auto max-w-3xl px-10 py-20 text-center">
        <h1 className="font-display text-[24px] font-bold text-[var(--primary)]">
          Projet introuvable
        </h1>
        <p className="mt-2 font-body text-[14px] text-[var(--text-muted)]">
          Aucun projet ne correspond à{" "}
          <code className="rounded bg-[var(--secondary)] px-1.5 py-0.5 font-mono text-[12px]">
            {slug}
          </code>
          .
        </p>
        <Link
          className="mt-6 inline-block font-body text-[13px] font-semibold text-[var(--primary)] hover:underline"
          href="/"
        >
          &larr; Retour au tableau de bord
        </Link>
      </div>
    );
  }

  const chats = getProjectChats(project.id);
  const artifacts = getProjectArtifacts(project.id);
  const files = getProjectFiles(project.id);
  const routines = getProjectRoutines(project.id);
  const members = getProjectMembers(project.id);
  const counts: Record<TabKey, number> = {
    conversations: chats.length,
    artifacts: artifacts.length,
    connaissances: files.length,
    routines: routines.length,
    team: members.length,
  };
  const active: TabKey = TABS.some((t) => t.key === tab) ? (tab as TabKey) : "conversations";

  return (
    <div className="mx-auto max-w-[1280px] px-10 py-10">
      {/* HEADER */}
      <header className="flex items-start gap-5">
        <span
          className="flex size-14 shrink-0 items-center justify-center rounded-md text-white"
          style={{ background: project.color }}
        >
          <Icon className="size-6" name={project.emoji} />
        </span>
        <div className="flex-1">
          <h1 className="font-display text-[32px] font-bold leading-tight text-[var(--primary)]">
            {project.name}
          </h1>
          <p className="mt-1 font-body text-[14px] text-[var(--text-muted)]">
            {project.desc}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="synelia-visibility">
            {project.public ? (
              <>
                <GlobeIcon className="size-3" /> Public
              </>
            ) : (
              <>
                <LockIcon className="size-3" /> Privé
              </>
            )}
          </span>
          <AvatarStack ids={project.members} max={4} size={30} />
          <button className="synelia-btn synelia-btn-ghost h-9 px-3 text-[12px]" type="button">
            Inviter
          </button>
          <button className="synelia-btn synelia-btn-primary h-9 px-4 text-[12px]" type="button">
            <PlusIcon className="size-4" />
            Nouvelle conversation
          </button>
        </div>
      </header>
      <SyneliaRule />

      {/* TABS */}
      <nav
        aria-label="Onglets du projet"
        className="mt-4 flex items-center gap-1 border-b border-[var(--border)]"
      >
        {TABS.map((t) => {
          const isActive = t.key === active;
          return (
            <Link
              className={`flex items-center gap-2 border-b-2 px-4 py-3 font-body text-[13px] font-semibold transition-colors ${
                isActive
                  ? "border-[var(--accent)] text-[var(--primary)]"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--primary)]"
              }`}
              href={`/w/${project.id}?tab=${t.key}`}
              key={t.key}
            >
              <t.Icon className="size-4" />
              {t.label}
              <span
                className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 font-mono text-[10px] font-bold"
                style={{ background: "var(--secondary)", color: "var(--text-sub)" }}
              >
                {counts[t.key]}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-8">
        {active === "conversations" && <ConversationsPane chats={chats} />}
        {active === "artifacts" && <ArtifactsPane artifacts={artifacts} />}
        {active === "connaissances" && <FilesPane files={files} />}
        {active === "routines" && <RoutinesPane routines={routines} />}
        {active === "team" && <TeamPane memberIds={project.members} />}
      </div>
    </div>
  );
}

function ConversationsPane({ chats }: { chats: ReturnType<typeof getProjectChats> }) {
  if (chats.length === 0) {
    return <EmptyState label="Aucune conversation dans ce projet pour le moment." />;
  }
  return (
    <ul className="flex max-w-[920px] flex-col divide-y divide-[var(--border-soft)] rounded-lg border border-[var(--border)] bg-white">
      {chats.map((c) => {
        const who = getMember(c.lastBy);
        return (
          <li className="flex items-center gap-4 px-5 py-4" key={c.id}>
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-md"
              style={{ background: "var(--secondary)", color: "var(--primary)" }}
            >
              <MessageSquareIcon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-display text-[14px] font-semibold text-[var(--foreground)]">
                  {c.title}
                </span>
                {c.pinned && (
                  <span className="font-body text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Épinglé
                  </span>
                )}
                {c.liveState === "ai-typing" && (
                  <span className="synelia-live-pill">L&rsquo;IA répond</span>
                )}
                {c.liveState === "user-typing" && who && (
                  <span className="synelia-live-pill">{who.name.split(" ")[0]} écrit</span>
                )}
              </div>
              <p className="mt-1 line-clamp-1 font-body text-[12px] text-[var(--text-muted)]">
                <span className="font-semibold text-[var(--text-sub)]">
                  {who?.name ?? c.lastBy}
                </span>{" "}
                &middot; {c.preview}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <AvatarStack ids={c.participants} max={3} size={24} />
              <span className="font-body text-[11px] text-[var(--text-muted)]">
                {c.updated}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function ArtifactsPane({ artifacts }: { artifacts: ReturnType<typeof getProjectArtifacts> }) {
  if (artifacts.length === 0) {
    return <EmptyState label="Aucun artefact généré dans ce projet pour le moment." />;
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {artifacts.map((a) => (
        <Link
          className="group flex min-h-[160px] flex-col gap-2 rounded-lg border border-[var(--border)] bg-white p-4 transition-all hover:border-[var(--primary-mid)] hover:shadow-[var(--shadow-md)]"
          href={`/a/${a.id}`}
          key={a.id}
        >
          <div className="flex items-start justify-between">
            <span
              className="synelia-kind-chip"
              style={{ background: KIND_VAR[a.kind], color: KIND_TEXT[a.kind] }}
            >
              {a.kind}
            </span>
            {a.live && <span className="synelia-live-pill">En cours</span>}
          </div>
          <h3 className="line-clamp-2 font-display text-[14px] font-semibold text-[var(--primary)] group-hover:text-[var(--primary-mid)]">
            {a.title}
          </h3>
          <div className="mt-auto flex items-center gap-2 font-body text-[10px] text-[var(--text-muted)]">
            <Avatar id={a.creator} size={20} />
            <span className="font-semibold text-[var(--text-sub)]">
              {getMember(a.creator)?.name.split(" ")[0] ?? a.creator}
            </span>
            <span aria-hidden>&middot;</span>
            <span>{a.when}</span>
            {a.shared && (
              <Share2Icon
                aria-label="Lien de partage actif"
                className="ml-auto size-3"
                style={{ color: "var(--success)" }}
              />
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

function FilesPane({ files }: { files: ReturnType<typeof getProjectFiles> }) {
  if (files.length === 0) {
    return <EmptyState label="Aucun fichier de connaissances dans ce projet." />;
  }
  return (
    <ul className="flex max-w-[920px] flex-col divide-y divide-[var(--border-soft)] rounded-lg border border-[var(--border)] bg-white">
      {files.map((f) => (
        <li className="flex items-center gap-4 px-5 py-3.5" key={f.id}>
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-md"
            style={{ background: "var(--secondary)", color: "var(--primary)" }}
          >
            <Icon className="size-4" name={f.icon} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate font-body text-[13px] font-semibold text-[var(--foreground)]">
              {f.name}
            </div>
            <div className="font-body text-[11px] text-[var(--text-muted)]">
              {getMember(f.by)?.name.split(" ")[0] ?? f.by} &middot; {f.when}
            </div>
          </div>
          <span className="shrink-0 font-mono text-[11px] text-[var(--text-muted)]">
            {f.size}
          </span>
        </li>
      ))}
    </ul>
  );
}

function RoutinesPane({ routines }: { routines: ReturnType<typeof getProjectRoutines> }) {
  if (routines.length === 0) {
    return <EmptyState label="Aucune routine configurée dans ce projet." />;
  }
  return (
    <ul className="flex max-w-[920px] flex-col gap-3">
      {routines.map((r) => (
        <li key={r.id}>
          <Link
            className="flex items-center gap-4 rounded-lg border border-[var(--border)] bg-white px-5 py-4 transition-all hover:border-[var(--primary-mid)] hover:shadow-[var(--shadow-sm)]"
            href={`/routines?id=${r.id}`}
          >
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-md text-white"
              style={{ background: "var(--primary)" }}
            >
              <Icon className="size-4" name={r.icon} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-display text-[14px] font-semibold text-[var(--foreground)]">
                  {r.title}
                </span>
                <StatusBadge status={r.status} />
              </div>
              <p className="mt-0.5 font-body text-[12px] text-[var(--text-muted)]">
                {r.cadence} &middot; prochaine : {r.next}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function TeamPane({ memberIds }: { memberIds: string[] }) {
  const members = memberIds.map((id) => getMember(id)).filter(Boolean);
  return (
    <ul className="flex max-w-[920px] flex-col divide-y divide-[var(--border-soft)] rounded-lg border border-[var(--border)] bg-white">
      {members.map(
        (m) =>
          m && (
            <li className="flex items-center gap-4 px-5 py-4" key={m.id}>
              <Avatar id={m.id} size={40} />
              <div className="min-w-0 flex-1">
                <div className="font-display text-[14px] font-semibold text-[var(--foreground)]">
                  {m.name}
                  {m.you && (
                    <span className="ml-2 font-body text-[11px] text-[var(--text-muted)]">
                      (vous)
                    </span>
                  )}
                </div>
                <div className="font-body text-[12px] text-[var(--text-muted)]">
                  {m.title}
                </div>
              </div>
              <span
                className="rounded-full px-3 py-1 font-body text-[11px] font-semibold"
                style={{
                  background: m.role === "Propriétaire" ? "var(--primary)" : "var(--secondary)",
                  color: m.role === "Propriétaire" ? "#fff" : "var(--text-sub)",
                }}
              >
                {m.role}
              </span>
            </li>
          )
      )}
    </ul>
  );
}

function StatusBadge({ status }: { status: "active" | "paused" }) {
  const isActive = status === "active";
  return (
    <span
      className="rounded-full px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider"
      style={{
        background: isActive ? "rgba(0,196,140,0.12)" : "var(--secondary)",
        color: isActive ? "#00936A" : "var(--text-muted)",
      }}
    >
      {isActive ? "Active" : "En pause"}
    </span>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-white px-6 py-16">
      <p className="font-body text-[13px] text-[var(--text-muted)]">{label}</p>
    </div>
  );
}
