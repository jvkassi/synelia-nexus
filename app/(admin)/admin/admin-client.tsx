"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  UsersIcon, FolderIcon, MessageSquareIcon, BrainIcon, FileTextIcon,
  TrendingUpIcon, PlayIcon, PauseIcon, GlobeIcon, LockIcon,
  ShieldIcon, RefreshCwIcon, BellIcon, DatabaseIcon, KeyIcon,
  InfoIcon, MailIcon, PenIcon, TrashIcon,
} from "lucide-react";
import type { Project, TeamMember, Routine, Artifact } from "@/lib/synelia/types";

type Tab = "overview" | "members" | "projects" | "usage" | "governance";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview",    label: "Vue d'ensemble" },
  { id: "members",     label: "Membres" },
  { id: "projects",    label: "Projets" },
  { id: "usage",       label: "Usage IA" },
  { id: "governance",  label: "Gouvernance" },
];

export function AdminOverviewClient({
  projects,
  team,
  routines,
  artifacts,
}: {
  projects: Project[];
  team: TeamMember[];
  routines: Routine[];
  artifacts: Artifact[];
}) {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab | null) ?? "overview";
  const [tab, setTab] = useState<Tab>(initialTab);

  useEffect(() => {
    const t = (searchParams.get("tab") as Tab | null) ?? "overview";
    setTab(t);
  }, [searchParams]);

  return (
    <div className="adm-wrap">
      <div className="adm-kicker">Administration</div>
      <div className="adm-head">
        <div>
          <h1>Console d&apos;administration</h1>
          <p className="sub">Gérez les membres, projets, et politiques d&apos;usage de l&apos;IA.</p>
        </div>
        <div className="adm-head-actions">
          <button className="btn btn-ghost btn-sm" type="button">
            <MailIcon size={14} /> Inviter
          </button>
          <button className="btn btn-primary btn-sm" type="button">
            <FolderIcon size={14} /> Nouveau projet
          </button>
        </div>
      </div>
      <div className="adm-rule" />

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 2, borderBottom: "1px solid var(--color-border-soft)", marginBottom: 28 }}>
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            style={{
              padding: "10px 16px",
              fontSize: 13.5,
              fontWeight: tab === id ? 600 : 500,
              fontFamily: "var(--font-display)",
              color: tab === id ? "var(--color-primary)" : "var(--color-text-muted)",
              borderBottom: tab === id ? "2px solid var(--color-primary)" : "2px solid transparent",
              marginBottom: -1,
              transition: "color .12s",
              borderRadius: 0,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "overview"   && <OverviewTab projects={projects} team={team} routines={routines} artifacts={artifacts} />}
      {tab === "members"    && <MembersTab team={team} />}
      {tab === "projects"   && <ProjectsTab projects={projects} />}
      {tab === "usage"      && <UsageTab projects={projects} team={team} />}
      {tab === "governance" && <GovernanceTab />}
    </div>
  );
}

/* ─────────────────────────────────── OVERVIEW ─────────────────────────────── */

function OverviewTab({ projects, team, routines, artifacts }: {
  projects: Project[]; team: TeamMember[]; routines: Routine[]; artifacts: Artifact[];
}) {
  const totalChats = projects.reduce((s, p) => s + p.chats, 0);
  const activeRoutines = routines.filter((r) => r.status === "active").length;

  return (
    <>
      {/* KPI cards */}
      <div className="adm-stats">
        <StatCard icon={<UsersIcon size={18} />} value={team.length} label="Membres actifs" delta="+1" trend="up" pct={60} />
        <StatCard icon={<FolderIcon size={18} />} value={projects.length} label="Projets ouverts" delta="stable" trend="flat" pct={80} />
        <StatCard icon={<MessageSquareIcon size={18} />} value={totalChats} label="Conversations" delta="+3" trend="up" pct={45} />
        <StatCard icon={<BrainIcon size={18} />} value="142 h" label="Consommation IA" delta="+12 h" trend="up" pct={70} />
        <StatCard icon={<FileTextIcon size={18} />} value={artifacts.length} label="Artefacts créés" delta="+2" trend="up" pct={55} />
      </div>

      <div className="adm-cols">
        {/* Left — audit feed */}
        <div className="adm-panel">
          <div className="pn-head">
            <BellIcon size={15} />
            <h3>Journal d&apos;activité récent</h3>
            <span className="pn-sub pn-right">7 derniers jours</span>
          </div>
          <div className="pn-body">
            <div className="audit-feed-compact">
              <AuditRow kind="auth" text={<>Nouvelle connexion de <b>Awa Koné</b> depuis <span className="tgt">Abidjan, CI</span></>} meta="aujourd'hui · 09:41" />
              <AuditRow kind="project" text={<><b>Ibrahim Coulibaly</b> a créé l&apos;artefact <span className="tgt">Architecture Cloud v2</span></>} meta="hier · 16:22" />
              <AuditRow kind="member" text={<><b>Mariam Touré</b> a rejoint le projet <span className="tgt">Open Digital Academy</span></>} meta="il y a 2 j" />
              <AuditRow kind="routine" text={<>Routine <span className="tgt">Veille cybersécurité</span> exécutée avec succès</>} meta="il y a 2 j · 08:04" />
              <AuditRow kind="governance" text={<><b>Awa Koné</b> a activé la politique <span className="tgt">Rétention des données</span></>} meta="il y a 4 j" />
              <AuditRow kind="data" text={<>Export du rapport <span className="tgt">Audit Coris Bank</span> en PDF</>} meta="il y a 5 j" />
            </div>
          </div>
        </div>

        {/* Right — member leaderboard */}
        <div className="adm-panel">
          <div className="pn-head">
            <TrendingUpIcon size={15} />
            <h3>Membres les plus actifs</h3>
            <span className="pn-sub pn-right">Ce mois</span>
          </div>
          <div className="pn-body">
            {[
              { rank: 1, name: "Awa Koné", title: "Lead Data & IA", v: "48 h", color: "#4B2882", initials: "AK" },
              { rank: 2, name: "Kofi Mensah", title: "Consultant Cybersécurité", v: "31 h", color: "#C0297A", initials: "KM" },
              { rank: 3, name: "Fatou Diabaté", title: "Data Scientist", v: "28 h", color: "#6B3FA0", initials: "FD" },
              { rank: 4, name: "Yao N'Guessan", title: "Architecte SI", v: "22 h", color: "#00AEEF", initials: "YN" },
              { rank: 5, name: "Mariam Touré", title: "Cheffe de projet", v: "18 h", color: "#00C48C", initials: "MT" },
            ].map((m) => (
              <div key={m.rank} className="lead-row">
                <span className="lr-rank">{m.rank}</span>
                <span className="av" style={{ width: 30, height: 30, background: m.color, fontSize: 11, flex: "none" }}>{m.initials}</span>
                <div>
                  <div className="lr-name">{m.name}</div>
                  <div className="lr-title">{m.title}</div>
                </div>
                <span className="lr-val">{m.v} <span>IA</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ icon, value, label, delta, trend, pct }: {
  icon: React.ReactNode; value: string | number; label: string;
  delta: string; trend: "up" | "down" | "flat"; pct: number;
}) {
  return (
    <div className="stat-card">
      <div className="s-ic">{icon}</div>
      <div className="s-val">{value}</div>
      <div className="s-lbl">{label}</div>
      <div className={`s-delta ${trend}`}>
        {trend === "up" && <TrendingUpIcon size={11} />}
        {delta}
      </div>
      <div className="s-meter"><i style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

function AuditRow({ kind, text, meta }: { kind: string; text: React.ReactNode; meta: string }) {
  const icons: Record<string, React.ReactNode> = {
    auth: <KeyIcon size={14} />,
    project: <FolderIcon size={14} />,
    member: <UsersIcon size={14} />,
    routine: <RefreshCwIcon size={14} />,
    governance: <ShieldIcon size={14} />,
    data: <DatabaseIcon size={14} />,
  };
  return (
    <div className="audit-row">
      <div className={`au-ic ${kind}`}>{icons[kind]}</div>
      <div>
        <div className="au-txt">{text}</div>
        <div className="au-meta">{meta}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────── MEMBERS ──────────────────────────────── */

function MembersTab({ team }: { team: TeamMember[] }) {
  const online = team.filter((m) => m.online).length;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <div className="seats">
          <div className="meter"><i style={{ width: `${Math.round((team.length / 10) * 100)}%` }} /></div>
          <span className="lbl"><b>{team.length}</b> / 10 sièges utilisés</span>
        </div>
        <span style={{ marginLeft: "auto", fontSize: 13, color: "var(--color-text-muted)" }}>
          {online} en ligne maintenant
        </span>
        <button className="btn btn-primary btn-sm" type="button">
          <MailIcon size={13} /> Inviter un membre
        </button>
      </div>

      <div className="adm-panel">
        <div className="pn-head">
          <UsersIcon size={15} />
          <h3>Équipe</h3>
          <span className="pn-sub">{team.length} membres</span>
        </div>
        <table className="adm-table">
          <thead>
            <tr>
              <th>Membre</th>
              <th>Statut</th>
              <th>Rôle</th>
              <th>Dernière activité</th>
              <th className="c-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {team.map((m) => (
              <tr key={m.id}>
                <td>
                  <div className="c-member">
                    <span className="av" style={{ width: 32, height: 32, background: m.color, fontSize: 12, flex: "none" }}>{m.initials}</span>
                    <div>
                      <div className="nm">{m.name} {m.you && <span style={{ fontSize: 10, color: "var(--color-text-muted)", fontWeight: 400 }}>(vous)</span>}</div>
                      <div className="ti">{m.title}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`st-badge ${m.online ? "actif" : "suspendu"}`}>
                    <span className="d" />
                    {m.online ? "Actif" : "Hors ligne"}
                  </span>
                </td>
                <td>
                  <select className={`role-sel${m.role === "Propriétaire" ? " owner" : ""}`} defaultValue={m.role} disabled={m.you}>
                    <option>Propriétaire</option>
                    <option>Membre</option>
                  </select>
                </td>
                <td style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>
                  {m.online ? "Maintenant" : (m.last ?? "Inconnu")}
                </td>
                <td>
                  <div className="row-actions">
                    <button className="row-act" type="button" title="Modifier" disabled={m.you}><PenIcon size={14} /></button>
                    <button className="row-act danger" type="button" title="Retirer" disabled={m.you}><TrashIcon size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ─────────────────────────────────── PROJECTS ─────────────────────────────── */

function ProjectsTab({ projects }: { projects: Project[] }) {
  return (
    <div className="adm-panel">
      <div className="pn-head">
        <FolderIcon size={15} />
        <h3>Projets</h3>
        <span className="pn-sub">{projects.length} projets actifs</span>
        <div className="pn-right">
          <button className="btn btn-primary btn-sm" type="button">
            <FolderIcon size={13} /> Nouveau
          </button>
        </div>
      </div>
      {projects.map((p) => (
        <div key={p.id} className="adm-proj-row">
          <div className="p-ic" style={{ background: p.color + "22", color: p.color }}>
            <FolderIcon size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="pr-name">
              {p.name}
              {p.public ? (
                <span className="viz-toggle public"><GlobeIcon size={11} /> Public</span>
              ) : (
                <span className="viz-toggle private"><LockIcon size={11} /> Privé</span>
              )}
            </div>
            <div className="pr-desc">{p.desc}</div>
          </div>
          <div className="pr-stat">
            <div className="v">{p.chats}</div>
            <div className="k">conversations</div>
          </div>
          <div className="pr-stat">
            <div className="v">{p.artifacts}</div>
            <div className="k">artefacts</div>
          </div>
          <div className="pr-stat">
            <div className="v">{p.members.length}</div>
            <div className="k">membres</div>
          </div>
          <div className="row-actions">
            <button className="row-act" type="button" title="Modifier"><PenIcon size={14} /></button>
            <button className="row-act danger" type="button" title="Archiver"><TrashIcon size={14} /></button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────── USAGE ───────────────────────────────── */

const USAGE_WEEKS = ["S19", "S20", "S21", "S22", "S23", "S24", "S25", "S26"];
const USAGE_DATA  = [28, 34, 19, 42, 31, 55, 38, 47]; // mock hours

function UsageTab({ projects, team }: { projects: Project[]; team: TeamMember[] }) {
  const maxVal = Math.max(...USAGE_DATA);
  const totalH = USAGE_DATA.reduce((s, v) => s + v, 0);

  return (
    <div className="adm-cols">
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div className="adm-panel">
          <div className="pn-head">
            <BrainIcon size={15} />
            <h3>Consommation IA — 8 semaines</h3>
            <div className="pn-right">
              <div className="adm-seg">
                {["7j", "30j", "90j"].map((p, i) => (
                  <button key={p} className={i === 1 ? "on" : ""} type="button">{p}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="pn-body">
            <div className="chart">
              {USAGE_DATA.map((v, i) => (
                <div key={i} className="bar" style={{ height: `${Math.round((v / maxVal) * 100)}%` }}>
                  <div className="tip">{v} h</div>
                </div>
              ))}
            </div>
            <div className="chart-axis">
              {USAGE_WEEKS.map((w) => <span key={w}>{w}</span>)}
            </div>
            <div className="chart-legend">
              <span className="lg"><span className="sw" style={{ background: "var(--color-primary)" }} /> Heures IA</span>
              <span style={{ marginLeft: "auto", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--color-text)" }}>
                {totalH} h <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-muted)" }}>total</span>
              </span>
            </div>
          </div>
        </div>

        <div className="adm-panel">
          <div className="pn-head">
            <FolderIcon size={15} />
            <h3>Répartition par projet</h3>
          </div>
          <div className="pn-body">
            {[
              { name: "Audit SI — Coris Bank",  color: "#4B2882", pct: 45, h: 64 },
              { name: "Migration Cloud — CNPS",  color: "#6B3FA0", pct: 28, h: 40 },
              { name: "Cybersécurité — ONECI",   color: "#C0297A", pct: 16, h: 23 },
              { name: "Open Digital Academy",    color: "#00C48C", pct: 11, h: 15 },
            ].map((r) => (
              <div key={r.name} className="hbar-row">
                <div className="hb-lbl">
                  <div className="p-ic" style={{ background: r.color + "22", color: r.color }}>
                    <FolderIcon size={12} />
                  </div>
                  <span className="nm">{r.name}</span>
                </div>
                <div className="hbar-track">
                  <i style={{ width: `${r.pct}%`, background: r.color }} />
                </div>
                <span className="hb-val">{r.h} h</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="adm-panel">
        <div className="pn-head">
          <UsersIcon size={15} />
          <h3>Top membres</h3>
          <span className="pn-sub">Heures IA ce mois</span>
        </div>
        <div className="pn-body">
          {[
            { rank: 1, name: "Awa Koné", initials: "AK", color: "#4B2882", v: 48, unit: "h" },
            { rank: 2, name: "Kofi Mensah", initials: "KM", color: "#C0297A", v: 31, unit: "h" },
            { rank: 3, name: "Fatou Diabaté", initials: "FD", color: "#6B3FA0", v: 28, unit: "h" },
            { rank: 4, name: "Yao N'Guessan", initials: "YN", color: "#00AEEF", v: 22, unit: "h" },
            { rank: 5, name: "Mariam Touré", initials: "MT", color: "#00C48C", v: 18, unit: "h" },
            { rank: 6, name: "Ibrahim Coulibaly", initials: "IC", color: "#FF6B35", v: 9, unit: "h" },
          ].map((m) => (
            <div key={m.rank} className="lead-row">
              <span className="lr-rank">{m.rank}</span>
              <span className="av" style={{ width: 30, height: 30, background: m.color, fontSize: 11, flex: "none" }}>{m.initials}</span>
              <div>
                <div className="lr-name">{m.name}</div>
              </div>
              <span className="lr-val">{m.v} <span>{m.unit}</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────── GOVERNANCE ───────────────────────────── */

const POLICIES = [
  { id: "mfa",      icon: <KeyIcon size={16} />,      name: "Authentification multi-facteurs",  desc: "Impose le MFA pour tous les membres à chaque connexion.", locked: false, on: true },
  { id: "ret",      icon: <DatabaseIcon size={16} />,  name: "Rétention des données 90 j",       desc: "Conserve l'historique des conversations et artefacts pendant 90 jours.", locked: false, on: true },
  { id: "export",   icon: <FileTextIcon size={16} />,  name: "Export PDF des artefacts",         desc: "Permet aux membres d'exporter les artefacts en PDF.", locked: false, on: true },
  { id: "pub",      icon: <GlobeIcon size={16} />,     name: "Projets publics autorisés",        desc: "Autorise la création de projets accessibles sans authentification.", locked: false, on: false },
  { id: "log",      icon: <BellIcon size={16} />,      name: "Alertes d'audit en temps réel",   desc: "Envoie des notifications pour les événements critiques (connexions suspectes, exports massifs).", locked: false, on: true },
  { id: "anon",     icon: <ShieldIcon size={16} />,    name: "Anonymisation des traces IA",      desc: "Masque les identifiants utilisateur dans les logs transmis au fournisseur IA.", locked: true, on: true },
];

function GovernanceTab() {
  const [states, setStates] = useState<Record<string, boolean>>(
    Object.fromEntries(POLICIES.map((p) => [p.id, p.on]))
  );

  return (
    <>
      <div className="adm-note" style={{ marginBottom: 24 }}>
        <span className="ic"><InfoIcon size={16} /></span>
        <p>
          Ces politiques s&apos;appliquent à l&apos;ensemble de l&apos;espace Synelia Cowork.
          Les politiques verrouillées sont imposées par le contrat d&apos;entreprise et ne peuvent pas être modifiées ici.
        </p>
      </div>

      <div className="adm-panel">
        <div className="pn-head">
          <ShieldIcon size={15} />
          <h3>Politiques d&apos;utilisation</h3>
          <span className="pn-sub">{POLICIES.filter((p) => states[p.id]).length} / {POLICIES.length} actives</span>
        </div>
        <div className="pn-body">
          {POLICIES.map((p) => (
            <div key={p.id} className="policy-row">
              <div className="pl-ic">{p.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="pl-name">
                  {p.name}
                  {p.locked && <span className="lock-chip"><LockIcon size={9} /> Verrouillé</span>}
                </div>
                <div className="pl-desc">{p.desc}</div>
              </div>
              <div className="pl-sw">
                <button
                  type="button"
                  aria-checked={states[p.id]}
                  role="switch"
                  className={`switch${states[p.id] ? " on" : ""}${p.locked ? " locked" : ""}`}
                  onClick={() => !p.locked && setStates((s) => ({ ...s, [p.id]: !s[p.id] }))}
                  disabled={p.locked}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
