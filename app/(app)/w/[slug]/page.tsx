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
  SendIcon,
  SparklesIcon,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarStack } from "@/components/synelia/avatar";
import { Icon } from "@/components/synelia/icon";
import { NewChatButton } from "@/components/shell/new-chat-button";
import {
  ensureLoaded,
  getMember,
  getProject,
  getProjectArtifacts,
  getProjectChats,
  getProjectFiles,
  getProjectMembers,
  getProjectRoutines,
  KIND_TEXT,
  KIND_VAR,
} from "@/lib/synelia/queries";

type TabKey = "conversations" | "artifacts" | "connaissances" | "routines" | "team";

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "conversations", label: "Conversations", icon: "message-square" },
  { key: "artifacts", label: "Artefacts", icon: "file-text" },
  { key: "connaissances", label: "Connaissances", icon: "folder-kanban" },
  { key: "routines", label: "Routines", icon: "repeat" },
  { key: "team", label: "Équipe", icon: "users" },
];

const SUGGEST_CHIPS = [
  { label: "Rédiger une synthèse", icon: "file-text" },
  { label: "Analyser les risques", icon: "shield-check" },
  { label: "Préparer un COPIL", icon: "list-checks" },
  { label: "Veille secteur", icon: "radar" },
];

export default async function ProjectViewPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  await ensureLoaded();
  const { slug } = await params;
  const { tab } = await searchParams;
  const project = getProject(slug);

  if (!project) {
    return (
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "80px 40px", textAlign: "center" }}>
        <h1>Projet introuvable</h1>
        <p style={{ color: "var(--color-text-muted)", marginTop: 8 }}>
          Aucun projet ne correspond à <code>{slug}</code>.
        </p>
        <Link
          href="/"
          style={{ display: "inline-block", marginTop: 24, fontSize: 13, fontWeight: 600, color: "var(--color-primary)" }}
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
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* PROJECT HEADER */}
      <div className="projhead">
        <div className="ph-top">
          <span
            className="p-ic"
            style={{ background: project.color }}
          >
            <Icon name={project.emoji} size={22} style={{ color: "#fff" }} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1>{project.name}</h1>
            <p className="ph-desc">{project.desc}</p>
          </div>
          <button
            className="viz-badge"
            type="button"
            aria-label="Visibilité du projet"
          >
            {project.public ? (
              <><GlobeIcon size={13} /> Public</>
            ) : (
              <><LockIcon size={13} /> Privé</>
            )}
          </button>
          <AvatarStack ids={project.members} max={4} size={30} />
          <div className="ph-actions">
            <button className="btn btn-ghost btn-sm" type="button">
              <UsersIcon size={14} />
              Inviter
            </button>
            <NewChatButton />
          </div>
        </div>

        {/* TABS */}
        <div className="ph-tabs">
          {TABS.map((t) => {
            const isActive = t.key === active;
            return (
              <Link
                key={t.key}
                href={`/w/${project.id}?tab=${t.key}`}
                className={`ph-tab${isActive ? " active" : ""}`}
              >
                <Icon name={t.icon} size={14} />
                {t.label}
                <span className="n">{counts[t.key]}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {active === "conversations" && (
          <ConversationsPane chats={chats} projectId={project.id} />
        )}
        {active === "artifacts" && <ArtifactsPane artifacts={artifacts} />}
        {active === "connaissances" && <FilesPane files={files} />}
        {active === "routines" && <RoutinesPane routines={routines} />}
        {active === "team" && <TeamPane memberIds={project.members} />}
      </div>
    </div>
  );
}

function ConversationsPane({
  chats,
  projectId,
}: {
  chats: ReturnType<typeof getProjectChats>;
  projectId: string;
}) {
  return (
    <div className="proj-home">
      {/* COMPOSER */}
      <div className="home-composer">
        <textarea
          className="home-composer"
          placeholder="Démarrez une nouvelle conversation dans ce projet…"
          rows={2}
          style={{ border: "none", outline: "none", resize: "none", width: "100%", background: "none", fontSize: 15 }}
        />
        <div className="home-cbar">
          <button className="home-send" type="button" aria-label="Envoyer" disabled>
            <SendIcon size={17} />
          </button>
        </div>
      </div>

      {/* SUGGEST CHIPS */}
      <div className="home-suggests">
        {SUGGEST_CHIPS.map((chip) => (
          <button
            key={chip.label}
            type="button"
            className="suggest-chip"
          >
            <span className="ic"><SparklesIcon size={13} /></span>
            {chip.label}
          </button>
        ))}
      </div>

      {/* CHAT LIST */}
      {chats.length > 0 && (
        <div className="home-recents">
          <div className="rec-head">
            <h3>Conversations</h3>
            <span className="n">{chats.length}</span>
          </div>
          <div className="chat-list" style={{ padding: 0, margin: 0 }}>
            {chats.map((c) => {
              const who = getMember(c.lastBy);
              return (
                <div
                  key={c.id}
                  className={`chat-row${c.live ? " live" : ""}`}
                >
                  <span className="cr-ic">
                    <MessageSquareIcon size={17} />
                  </span>
                  <div className="cr-body">
                    <div className="cr-title">
                      {c.title}
                      {c.pinned && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          Épinglé
                        </span>
                      )}
                      {c.liveState === "ai-typing" && (
                        <span className="live-mini">
                          <span className="dots"><i /><i /><i /></span>
                          L&apos;IA répond
                        </span>
                      )}
                    </div>
                    <div className="cr-prev">
                      {who?.name.split(" ")[0] ?? c.lastBy} &middot; {c.preview}
                    </div>
                  </div>
                  <div className="cr-right">
                    <span className="cr-when">{c.updated}</span>
                    <AvatarStack ids={c.participants} max={3} size={22} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {chats.length === 0 && (
        <div className="empty" style={{ marginTop: 32 }}>
          Aucune conversation dans ce projet pour le moment.
        </div>
      )}
    </div>
  );
}

function ArtifactsPane({
  artifacts,
}: {
  artifacts: ReturnType<typeof getProjectArtifacts>;
}) {
  if (artifacts.length === 0) {
    return (
      <div style={{ padding: "32px 36px" }}>
        <EmptyState label="Aucun artefact généré dans ce projet pour le moment." />
      </div>
    );
  }
  return (
    <div style={{ padding: "24px 32px 60px" }}>
      <div className="artg-grid">
        {artifacts.map((a) => {
          const icClass = a.kind === "Document" ? "k-doc" : a.kind === "Tableur" ? "k-sheet" : "k-diag";
          return (
            <Link key={a.id} href={`/a/${a.id}`} className="artg-card">
              <div className="agc-top">
                <span className={`agc-ic ${icClass}`}>
                  <Icon name={a.icon} size={20} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="agc-title">{a.title}</div>
                  <div className="agc-kind">
                    <span className={`kind-chip ${icClass}`}>{a.kind}</span>
                    {a.live && <span className="pill pill-live" style={{ padding: "2px 9px", fontSize: "10.5px" }}><span className="d" />En cours</span>}
                  </div>
                </div>
              </div>
              <div className="agc-foot">
                <span className="agc-by">
                  <Avatar id={a.creator} size={22} />
                  {getMember(a.creator)?.name.split(" ")[0] ?? a.creator}
                  <span className="dotsep">·</span>
                  {a.when}
                </span>
                {a.shared && (
                  <span className="agc-shared">
                    <Share2Icon size={12} />
                    Partagé
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function FilesPane({ files }: { files: ReturnType<typeof getProjectFiles> }) {
  if (files.length === 0) {
    return (
      <div style={{ padding: "32px 36px" }}>
        <EmptyState label="Aucun fichier de connaissances dans ce projet." />
      </div>
    );
  }
  return (
    <div style={{ padding: "24px 32px 60px", maxWidth: 920 }}>
      {files.map((f) => (
        <div key={f.id} className={`file-row`}>
          <span className={`f-ic ${f.type}`}>
            <Icon name={f.icon} size={16} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="f-name">{f.name}</div>
            <div className="f-meta">
              {getMember(f.by)?.name.split(" ")[0] ?? f.by} &middot; {f.when}
            </div>
          </div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)" }}>
            {f.size}
          </span>
        </div>
      ))}
    </div>
  );
}

function RoutinesPane({ routines }: { routines: ReturnType<typeof getProjectRoutines> }) {
  if (routines.length === 0) {
    return (
      <div style={{ padding: "32px 36px" }}>
        <EmptyState label="Aucune routine configurée dans ce projet." />
      </div>
    );
  }
  return (
    <div style={{ padding: "24px 32px 60px", maxWidth: 920 }}>
      {routines.map((r) => (
        <Link
          key={r.id}
          href={`/routines?id=${r.id}`}
          className="routine-row"
          style={{ textDecoration: "none" }}
        >
          <span className="r-ic">
            <Icon name={r.icon} size={16} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="r-name">{r.title}</div>
            <div className="r-cad">{r.cadence}</div>
          </div>
          <div className="r-next">
            <div className="lbl">Prochaine</div>
            <div className="val">{r.next}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function TeamPane({ memberIds }: { memberIds: string[] }) {
  const members = memberIds.map((id) => getMember(id)).filter(Boolean);
  return (
    <div style={{ padding: "24px 32px 60px", maxWidth: 920 }}>
      {members.map(
        (m) =>
          m && (
            <div key={m.id} className="part-row" style={{ borderBottom: "1px solid var(--color-border-soft)" }}>
              <Avatar id={m.id} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="p-name">
                  {m.name}
                  {m.you && (
                    <span style={{ marginLeft: 8, fontSize: 11, color: "var(--color-text-muted)" }}>
                      (vous)
                    </span>
                  )}
                </div>
                <div className="p-title">{m.title}</div>
              </div>
              <span
                className={`role-badge ${m.role === "Propriétaire" ? "owner" : "member"}`}
              >
                {m.role}
              </span>
            </div>
          )
      )}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="empty" style={{ border: "1.5px dashed var(--color-border)", borderRadius: "var(--radius-md)", padding: "60px 20px" }}>
      {label}
    </div>
  );
}
