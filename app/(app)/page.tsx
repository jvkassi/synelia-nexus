export const dynamic = "force-dynamic";

import {
  MessageSquareIcon,
  FileTextIcon,
  RepeatIcon,
  PlusIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { auth } from "@/app/(auth)/auth";
import { AvatarStack } from "@/components/synelia/avatar";
import { Icon } from "@/components/synelia/icon";
import {
  ensureLoaded,
  allChats,
  getMember,
  getProjectChats,
  PROJECTS,
  projectNameOf,
  ROUTINES,
} from "@/lib/synelia/queries";

/**
 * Synelia Cowork — Dashboard (Home).
 * Greeting from the signed-in user; project cards, recent conversations and
 * active routines from the workspace data. Uses cowork CSS `dash*` classes.
 */
export default async function HomePage() {
  await ensureLoaded();
  const session = await auth();
  const fullName = session?.user?.name ?? session?.user?.email?.split("@")[0] ?? "";
  const firstName = fullName.split(" ")[0] || "vous";

  const projects = PROJECTS();
  const routines = ROUTINES();

  const recentChats = allChats()
    .filter((c) => c.live)
    .concat(allChats().filter((c) => !c.live))
    .slice(0, 5);

  const activeRoutines = routines.filter((r) => r.status === "active").slice(0, 4);
  const liveCount = allChats().filter((c) => c.live).length;

  return (
    <div className="dash">
      {/* HERO */}
      <div className="dash-hero">
        <div>
          <div className="dash-kicker">Espace de travail collaboratif</div>
          <h1>Bonjour, {firstName}.</h1>
          <p className="greet-sub">
            Votre équipe partage{" "}
            <strong style={{ color: "var(--color-text)" }}>
              {projects.length} projet{projects.length > 1 ? "s" : ""}
            </strong>
            {liveCount > 0 && (
              <>
                {" · "}
                <span style={{ color: "var(--color-accent)", fontWeight: 600 }}>
                  {liveCount} conversation{liveCount > 1 ? "s" : ""} en direct
                </span>
              </>
            )}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <button className="btn btn-ghost" type="button">
            <UsersIcon size={14} />
            Inviter
          </button>
          <Link className="btn btn-primary" href="/new-project">
            <PlusIcon size={14} />
            Nouveau projet
          </Link>
        </div>
      </div>

      <div className="rule-mag" />

      {/* MAIN GRID */}
      <div className="dash-grid">
        {/* LEFT: project cards */}
        <div>
          <p className="col-title">
            Projets partagés
            <span className="n">{projects.length}</span>
            <Link className="more" href="/w">Tout afficher</Link>
          </p>
          <div className="proj-cards">
            {projects.map((p) => {
              const live = getProjectChats(p.id).some((c) => c.live);
              return (
                <Link key={p.id} href={`/w/${p.id}`} className="pcard">
                  {live && (
                    <span className="live-tag">
                      <span className="pill pill-live">
                        <span className="d" />
                        En direct
                      </span>
                    </span>
                  )}
                  <div className="top">
                    <span
                      className="p-ic"
                      style={{ background: p.color }}
                    >
                      <Icon name={p.emoji} size={20} style={{ color: "#fff" }} />
                    </span>
                    <h3>{p.name}</h3>
                  </div>
                  <p className="desc">{p.desc}</p>
                  <div className="foot">
                    <span className="stat">
                      <MessageSquareIcon size={12} />
                      {p.chats}
                    </span>
                    <span className="stat">
                      <FileTextIcon size={12} />
                      {p.artifacts}
                    </span>
                    <span className="members">
                      <AvatarStack ids={p.members} max={4} size={24} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* RIGHT: recent conversations + active routines */}
        <div>
          {/* Recent conversations */}
          <div className="activity-card" style={{ marginBottom: 22 }}>
            <div className="ah">
              <p className="col-title" style={{ margin: 0 }}>Conversations récentes</p>
              {liveCount > 0 && (
                <span className="pill pill-live" style={{ marginLeft: "auto" }}>
                  <span className="d" />
                  {liveCount} en direct
                </span>
              )}
            </div>
            {recentChats.map((c) => {
              const who = getMember(c.lastBy);
              return (
                <div key={c.id} className="act-item">
                  <span
                    className="av sq"
                    style={{
                      width: 34, height: 34,
                      background: c.live ? "rgba(192,41,122,0.1)" : "rgba(75,40,130,0.08)",
                      color: c.live ? "var(--color-accent)" : "var(--color-primary)",
                    }}
                  >
                    <MessageSquareIcon size={15} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="txt">
                      <b>{c.title}</b>
                      {c.liveState === "ai-typing" && (
                        <span className="act-live"> · L&apos;IA répond</span>
                      )}
                    </div>
                    <div className="when">
                      <span>{projectNameOf(c.project)}</span>
                      {c.liveState === "user-typing" && who
                        ? <span> · {who.name.split(" ")[0]} écrit…</span>
                        : <span> · {c.updated}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active routines */}
          <div className="activity-card">
            <div className="ah">
              <p className="col-title" style={{ margin: 0 }}>Routines actives</p>
              <Link className="more" href="/routines" style={{ marginLeft: "auto", fontSize: 12, color: "var(--color-primary-mid)", fontWeight: 600 }}>
                Tout voir
              </Link>
            </div>
            {activeRoutines.map((r) => (
              <Link key={r.id} href={`/routines?id=${r.id}`} className="routine-row" style={{ display: "flex" }}>
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
            {activeRoutines.length === 0 && (
              <div className="empty">Aucune routine active.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
