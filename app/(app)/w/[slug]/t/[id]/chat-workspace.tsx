"use client";

import {
  ArrowLeftIcon,
  BookOpenIcon,
  ChevronRightIcon,
  LayoutPanelLeftIcon,
  LibraryIcon,
  SendIcon,
  SquareIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar, AvatarStack, LivePill } from "@/components/synelia/avatar";
import { Icon } from "@/components/synelia/icon";
import type { RiskRow, Artifact, TeamMember, Chat, Project, ChatMessage } from "@/lib/synelia/types";
import { useChatStream } from "@/hooks/use-chat-stream";

type Layout = "centered" | "canvas" | "wide";
type RpTab = "artefacts" | "membres";

interface Props {
  project: Project;
  chat: Chat;
  layout: Layout;
  initialMessages: ChatMessage[];
  artifacts: Artifact[];
  members: (TeamMember | undefined)[];
  riskRows: RiskRow[];
  ghostTyper: TeamMember | null | undefined;
  me: { id: string; name: string };
}

function toStreamMessages(msgs: ChatMessage[]) {
  return msgs.map((m) => ({
    id: m.id,
    author: m.author,
    name: m.author === "ai" ? "Synelia IA" : (m.author as string),
    role: m.role as "user" | "assistant",
    text: m.text,
    at: m.at,
  }));
}

function renderMsgText(text: string) {
  // Minimal markdown: **bold** and numbered lists
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return <strong key={i}>{p.slice(2, -2)}</strong>;
    }
    return p;
  });
}

function CoteBadge({ lvl }: { lvl: string }) {
  return <span className={`cote ${lvl}`}>{lvl === "crit" ? "C" : lvl === "high" ? "H" : lvl === "med" ? "M" : "L"}</span>;
}

export function ChatWorkspace({
  project,
  chat,
  layout,
  initialMessages,
  artifacts,
  members,
  riskRows,
  ghostTyper,
  me,
}: Props) {
  const { messages, streaming, send, stop } = useChatStream(
    toStreamMessages(initialMessages),
    chat.id,
  );

  const [input, setInput] = useState("");
  const [rpTab, setRpTab] = useState<RpTab>("artefacts");
  const [following, setFollowing] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages, streaming]);

  const handleSend = useCallback(() => {
    const txt = input.trim();
    if (!txt) return;
    setInput("");
    send(txt, me.id, me.name);
  }, [input, me, send]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  // Read-width CSS var per layout
  const readW = layout === "wide" ? 1100 : layout === "canvas" ? 680 : 760;

  // Live artifact rows for c-synthese (stream in as AI responds)
  const [visibleRiskRows, setVisibleRiskRows] = useState<RiskRow[]>(
    chat.id === "c-synthese" ? riskRows.slice(0, 3) : [],
  );
  useEffect(() => {
    if (chat.id !== "c-synthese") return;
    if (streaming) {
      // reveal rows one-by-one while streaming
      let i = visibleRiskRows.length;
      if (i >= riskRows.length) return;
      const interval = setInterval(() => {
        if (i < riskRows.length) {
          i++;
          setVisibleRiskRows(riskRows.slice(0, i));
        } else {
          clearInterval(interval);
        }
      }, 320);
      return () => clearInterval(interval);
    }
  }, [streaming, chat.id, riskRows, visibleRiskRows.length]);

  const liveArtifact = artifacts.find((a) => a.live);
  const showRPanel = layout !== "wide";
  const showArtView = layout === "canvas" && liveArtifact;

  return (
    <div
      className="chat-main"
      style={{ "--read-w": `${readW}px` } as React.CSSProperties}
    >
      {/* CONVERSATION COLUMN */}
      <div className="chat-col">
        {/* HEADER */}
        <div className="chat-head">
          <Link href={`/w/${project.id}`} className="back" aria-label="Retour">
            <ArrowLeftIcon size={16} />
          </Link>
          <div
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-white"
            style={{ background: project.color }}
          >
            <Icon name={project.emoji} size={15} style={{ color: "#fff" }} />
          </div>
          <div>
            <div className="ch-title">{chat.title}</div>
            <div className="ch-sub">
              <span>{project.name}</span>
              {chat.live && (
                <>
                  <span aria-hidden>·</span>
                  <LivePill>L&apos;IA répond</LivePill>
                </>
              )}
            </div>
          </div>
          <div className="ch-right">
            <AvatarStack ids={chat.participants} size={26} />
            {layout !== "canvas" && liveArtifact && (
              <Link
                href={`/w/${project.id}/t/${chat.id}?layout=canvas`}
                className="btn btn-ghost btn-sm"
                style={{ gap: 6 }}
              >
                <LayoutPanelLeftIcon size={14} />
                Voir l&apos;artefact
              </Link>
            )}
          </div>
        </div>

        {/* COPRESENCE — someone else is in this conversation */}
        {chat.liveUser && (
          <div className="copresence">
            <Avatar id={chat.liveUser} size={22} />
            <span>
              <span className="who">{members.find((m) => m?.id === chat.liveUser)?.name ?? chat.liveUser}</span>
              {chat.liveState === "user-typing"
                ? " est en train d’écrire dans cette conversation"
                : " est dans cette conversation"}
            </span>
            <button
              className={`follow${following ? " on" : ""}`}
              onClick={() => setFollowing((v) => !v)}
              type="button"
            >
              {following ? <XIcon size={12} /> : <ChevronRightIcon size={12} />}
              {following ? "Arrêter de suivre" : "Suivre la vue"}
            </button>
          </div>
        )}

        {/* THREAD */}
        <div className="thread" ref={threadRef}>
          <div className="thread-inner">
            {messages.length === 0 && !streaming && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                  padding: "60px 0",
                  color: "var(--color-text-muted)",
                  textAlign: "center",
                }}
              >
                <Icon name="message-square" size={32} style={{ opacity: 0.3 }} />
                <p style={{ fontSize: 14, maxWidth: 320 }}>
                  Commencez la conversation. Votre équipe verra vos messages en temps réel.
                </p>
              </div>
            )}

            {messages.map((m) => {
              const isAI = m.role === "assistant";
              const member = isAI ? null : members.find((u) => u?.id === m.author) ?? null;
              return (
                <div
                  key={m.id}
                  className={`msg${isAI ? " assistant" : ""}${m.streaming ? " streaming" : ""}${m.isInterrupted ? " interrupted" : ""}`}
                >
                  {isAI ? (
                    <div className="m-avatar" aria-hidden>
                      <Icon name="sparkles" size={16} style={{ color: "#fff" }} />
                    </div>
                  ) : (
                    <Avatar id={m.author as string} size={34} square />
                  )}
                  <div className="m-body">
                    <div className="m-head">
                      <span className="m-name">{isAI ? "Synelia IA" : (member?.name ?? m.name)}</span>
                      {m.isSteer && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            color: "var(--color-accent)",
                            border: "1px solid rgba(192,41,122,.35)",
                            borderRadius: 4,
                            padding: "1px 6px",
                          }}
                        >
                          Orientation
                        </span>
                      )}
                      {m.isInterrupted && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            color: "var(--color-text-muted)",
                            border: "1px solid var(--color-border)",
                            borderRadius: 4,
                            padding: "1px 6px",
                          }}
                        >
                          Interrompu
                        </span>
                      )}
                      <span className="m-at">{m.at}</span>
                    </div>
                    <div className="m-text">
                      {m.streaming ? (
                        <>
                          {renderMsgText(m.text)}
                          <span
                            style={{
                              display: "inline-block",
                              width: 2,
                              height: "0.9em",
                              background: "var(--color-accent)",
                              marginLeft: 2,
                              verticalAlign: "text-bottom",
                              animation: "blink 1s step-end infinite",
                            }}
                          />
                        </>
                      ) : (
                        renderMsgText(m.text)
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* THINKING INDICATOR */}
            {streaming && messages.every((m) => !m.streaming) && (
              <div className="msg assistant">
                <div className="m-avatar" aria-hidden>
                  <Icon name="sparkles" size={16} style={{ color: "#fff" }} />
                </div>
                <div className="m-body">
                  <div className="thinking">
                    <span>Synelia IA réfléchit</span>
                    <span className="dots">
                      <i /><i /><i />
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* GHOST TYPING — for c-entretiens (user-typing) */}
            {ghostTyper && chat.liveState === "user-typing" && (
              <GhostTyping user={ghostTyper} />
            )}
          </div>
        </div>

        {/* COMPOSER */}
        <div className="composer-wrap">
          <div className="composer-inner">
            {streaming && (
              <div className="steer-hint">
                <Icon name="zap" size={13} />
                Envoyez un message pour orienter la réponse de l&apos;IA
              </div>
            )}
            <div className="composer">
              <textarea
                ref={textareaRef}
                placeholder="Écrivez votre message…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
              />
              <div className="composer-bar">
                <button className="c-tool" type="button" title="Bibliothèque de prompts">
                  <LibraryIcon size={16} />
                </button>
                <span className="c-typers" />
                <button
                  className={`composer-send${streaming ? " stop" : ""}${!input.trim() && !streaming ? " disabled" : ""}`}
                  disabled={!input.trim() && !streaming}
                  onClick={streaming ? stop : handleSend}
                  type="button"
                  aria-label={streaming ? "Arrêter" : "Envoyer"}
                >
                  {streaming ? <SquareIcon size={15} /> : <SendIcon size={15} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — hidden in wide layout */}
      {showRPanel && !showArtView && (
        <div className="rpanel chat-aside">
          <div className="rp-tabs">
            <button
              className={`rp-tab${rpTab === "artefacts" ? " active" : ""}`}
              onClick={() => setRpTab("artefacts")}
              type="button"
            >
              <BookOpenIcon size={13} />
              Artefacts
              <span className="n">{artifacts.length}</span>
            </button>
            <button
              className={`rp-tab${rpTab === "membres" ? " active" : ""}`}
              onClick={() => setRpTab("membres")}
              type="button"
            >
              <UsersIcon size={13} />
              Membres
              <span className="n">{chat.participants.length}</span>
            </button>
          </div>
          <div className="rp-scroll">
            {rpTab === "artefacts" && (
              <>
                <div className="rp-section-t">Artefacts du projet</div>
                {artifacts.length === 0 ? (
                  <p style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                    Aucun artefact généré pour le moment.
                  </p>
                ) : (
                  artifacts.map((a) => (
                    <div key={a.id} className={`art-card${a.live ? " live" : ""}`}>
                      <div className="ac-top">
                        <div className="ac-ic">
                          <Icon name={a.icon} size={18} />
                        </div>
                        <div>
                          <div className="ac-name">{a.title}</div>
                          <div className="ac-meta">{a.kind} · {a.when}</div>
                        </div>
                        {a.live && <LivePill style={{ marginLeft: "auto" }}>En cours</LivePill>}
                      </div>
                      <div className="ac-foot">
                        <Avatar id={a.creator} size={18} />
                        <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {a.title}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
            {rpTab === "membres" && (
              <>
                <div className="rp-section-t">Dans cette conversation</div>
                {chat.participants.map((uid) => {
                  const m = members.find((u) => u?.id === uid);
                  if (!m) return null;
                  return (
                    <div key={uid} className="part-row">
                      <Avatar id={uid} size={32} />
                      <div>
                        <div className="p-name">{m.name}</div>
                        <div className="p-title">{m.title}</div>
                      </div>
                      {uid === chat.liveUser && (
                        <span className="p-here" aria-label="En direct">
                          <LivePill />
                        </span>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}

      {/* ARTIFACT VIEW — canvas layout */}
      {showArtView && liveArtifact && (
        <div className="artview chat-aside">
          <div className="av-head">
            <div className="av-ic">
              <Icon name={liveArtifact.icon} size={18} />
            </div>
            <div>
              <h3>{liveArtifact.title}</h3>
              <div className="sub">{liveArtifact.kind} · {liveArtifact.when}</div>
            </div>
            {liveArtifact.live && <LivePill style={{ marginLeft: "auto" }}>En cours</LivePill>}
            <div className="acts" style={{ marginLeft: liveArtifact.live ? 8 : "auto" }}>
              <Link
                href={`/w/${project.id}/t/${chat.id}?layout=centered`}
                className="ab"
                aria-label="Fermer l'artefact"
              >
                <XIcon size={15} />
              </Link>
            </div>
          </div>
          <div className="av-doc art-body">
            <div className="doc-kick">Matrice de risques</div>
            <h2 className="doc-t">{liveArtifact.title}</h2>
            <div className="doc-rule" />
            <table className="risk-table">
              <thead>
                <tr>
                  <th>Constat</th>
                  <th>Famille</th>
                  <th>Cotation</th>
                  <th>Niveau</th>
                  <th>Propriétaire</th>
                </tr>
              </thead>
              <tbody>
                {visibleRiskRows.map((row, i) => (
                  <tr key={i} className={i === visibleRiskRows.length - 1 && streaming ? "streaming-row" : ""}>
                    <td>{row.c}</td>
                    <td>{row.fam}</td>
                    <td><CoteBadge lvl={row.lvl} /></td>
                    <td style={{ fontWeight: 600 }}>{row.cote}</td>
                    <td>{row.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function GhostTyping({ user }: { user: TeamMember }) {
  const [text, setText] = useState("");
  const draftRef = useRef(
    "Prépare 15 questions pour les responsables d'application — je vais relire et annoter",
  );
  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      if (i <= draftRef.current.length) {
        setText(draftRef.current.slice(0, i));
        i++;
      }
    }, 55);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="ghost-typing">
      <Avatar id={user.id} size={34} square />
      <div className="ghost-bubble">
        <div className="label">{user.name} écrit…</div>
        {text}
        <span className="caret" />
      </div>
    </div>
  );
}
