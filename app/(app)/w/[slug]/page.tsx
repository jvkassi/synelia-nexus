import Link from "next/link";
import {
  MessageSquareIcon,
  FileTextIcon,
  BookOpenIcon,
  RepeatIcon,
  UsersIcon,
  GlobeIcon,
  LockIcon,
  PlusIcon,
  Share2Icon,
  SparklesIcon,
} from "lucide-react";
import { SyneliaRule } from "@/components/synelia-rule";
import { colors, dimensions } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

/**
 * Synelia Cowork — Project view with 5 tabs.
 *
 * Reference: zip/src/app.jsx "project" view + DESIGN.md "Project view
 * header" + "The 5 things to fix in priority" #3.
 *
 *   - Project header: big icon tile (56px, colored) + H1 name + description
 *   - Right side: visibility badge (Privé / Public) as a clickable button
 *     opening a modal, avatar stack, "Inviter" ghost, "Nouvelle conversation"
 *     primary violet
 *   - 5 horizontal tabs: Conversations · Artefacts · Connaissances ·
 *     Routines · Équipe, each with a count
 *
 * Mock data for now. Real query (getProject + getConversations +
 * getArtifacts + getKnowledge + getRoutines + getMembers) lands with
 * the Workspace/Thread schema in Phase 1B/2.
 */

type ProjectViewProps = {
  params: { slug: string };
};

const TABS = [
  { key: "conversations", label: "Conversations", Icon: MessageSquareIcon },
  { key: "artifacts", label: "Artefacts", Icon: FileTextIcon },
  { key: "connaissances", label: "Connaissances", Icon: BookOpenIcon },
  { key: "routines", label: "Routines", Icon: RepeatIcon },
  { key: "team", label: "Équipe", Icon: UsersIcon },
] as const;

const projectBySlug: Record<
  string,
  {
    name: string;
    description: string;
    visibility: "private" | "public";
    color: string;
    icon: "shield-check" | "cloud" | "lock" | "graduation-cap";
    members: { initials: string; color: string; name: string }[];
  }
> = {
  "audit-coris-bank": {
    name: "Audit Coris Bank",
    description:
      "Cartographie des risques SI, plan de remédiation et documents de preuve pour l'audit annuel.",
    visibility: "private",
    color: colors.primary,
    icon: "shield-check",
    members: [
      { initials: "AK", color: colors.primary, name: "Awa K." },
      { initials: "KH", color: colors.accent, name: "Khady H." },
      { initials: "FE", color: "#E85B9C", name: "Fanta E." },
      { initials: "YN", color: colors.info, name: "Yann N." },
      { initials: "MT", color: colors.success, name: "Mariam T." },
    ],
  },
  "migration-cloud-orange": {
    name: "Migration Cloud Orange CI",
    description: "Transfert des workloads critiques vers le cloud souverain.",
    visibility: "public",
    color: colors.info,
    icon: "cloud",
    members: [
      { initials: "YN", color: colors.info, name: "Yann N." },
      { initials: "FE", color: "#E85B9C", name: "Fanta E." },
    ],
  },
  "conformite-pci-dss": {
    name: "Conformité PCI-DSS",
    description: "Audit annuel — preuves et matrice de risques à finaliser.",
    visibility: "private",
    color: colors.warning,
    icon: "lock",
    members: [
      { initials: "KH", color: colors.accent, name: "Khady H." },
      { initials: "AK", color: colors.primary, name: "Awa K." },
      { initials: "MT", color: colors.success, name: "Mariam T." },
    ],
  },
  "academie-synelia": {
    name: "Académie Synelia 2026",
    description: "Programme de formation continue. Tronc commun IA + 3 parcours métier.",
    visibility: "private",
    color: colors.success,
    icon: "graduation-cap",
    members: [
      { initials: "MT", color: colors.success, name: "Mariam T." },
      { initials: "FE", color: "#E85B9C", name: "Fanta E." },
      { initials: "YN", color: colors.info, name: "Yann N." },
      { initials: "AK", color: colors.primary, name: "Awa K." },
      { initials: "KH", color: colors.accent, name: "Khady H." },
      { initials: "AO", color: colors.warning, name: "Aïcha O." },
    ],
  },
};

const tabCounts: Record<string, Record<string, number>> = {
  "audit-coris-bank": { conversations: 8, artifacts: 12, connaissances: 24, routines: 3, team: 5 },
  "migration-cloud-orange": { conversations: 4, artifacts: 6, connaissances: 11, routines: 1, team: 2 },
  "conformite-pci-dss": { conversations: 3, artifacts: 9, connaissances: 18, routines: 2, team: 3 },
  "academie-synelia": { conversations: 6, artifacts: 4, connaissances: 32, routines: 4, team: 6 },
};

const conversations = [
  { id: "c1", title: "Matrice de risques v3", who: "Khady", when: "il y a 5 min", lastMessage: "J'ai partagé la dernière version, dis-moi ce que tu en penses.", live: true, aiStreaming: true },
  { id: "c2", title: "Plan de remédiation priorisé", who: "Olive IA", when: "il y a 1 h", lastMessage: "Voici les 12 actions classées par criticité et effort.", live: false, aiStreaming: false },
  { id: "c3", title: "Note de synthèse COPIL", who: "Awa", when: "il y a 3 h", lastMessage: "On la présente lundi — relu stp.", live: false, aiStreaming: false },
  { id: "c4", title: "Analyse écarts PCI-DSS", who: "Yann", when: "hier", lastMessage: "Il manque la section 6.5 sur la gestion des vulnérabilités.", live: false, aiStreaming: false },
  { id: "c5", title: "Cartographie des actifs", who: "Fanta", when: "il y a 2 jours", lastMessage: "128 actifs identifiés, classification faite.", live: false, aiStreaming: false },
];

const artifacts = [
  { id: "a1", title: "Matrice de risques v3", kind: "Tableur" as const, who: "Khady", when: "il y a 5 min", live: true },
  { id: "a2", title: "Architecture cible cloud", kind: "Diagramme" as const, who: "Olive IA", when: "il y a 12 min", live: true },
  { id: "a3", title: "Plan de remédiation priorisé", kind: "Document" as const, who: "Olive IA", when: "il y a 1 h", live: false },
  { id: "a4", title: "Note de synthèse COPIL", kind: "Document" as const, who: "Awa", when: "il y a 3 h", live: false },
  { id: "a5", title: "Analyse écarts PCI-DSS", kind: "Document" as const, who: "Yann", when: "hier", live: false, shared: true },
  { id: "a6", title: "Cartographie des actifs", kind: "Tableur" as const, who: "Fanta", when: "il y a 2 jours", live: false },
  { id: "a7", title: "Schéma réseau cible", kind: "Diagramme" as const, who: "Mariam", when: "il y a 3 jours", live: false },
  { id: "a8", title: "Politique de gestion des clés", kind: "Document" as const, who: "Khady", when: "il y a 4 jours", live: false, shared: true },
];

const kindColor: Record<"Document" | "Tableur" | "Diagramme", string> = {
  Document: "var(--kind-doc)",
  Tableur: "var(--kind-tableur)",
  Diagramme: "var(--kind-diagramme)",
};

const kindText: Record<"Document" | "Tableur" | "Diagramme", string> = {
  Document: "var(--white)",
  Tableur: "var(--primary-dark)",
  Diagramme: "var(--primary-dark)",
};

export default async function ProjectViewPage({ params }: ProjectViewProps) {
  const { slug } = params;
  const project = projectBySlug[slug];
  const counts = tabCounts[slug] ?? { conversations: 0, artifacts: 0, connaissances: 0, routines: 0, team: 0 };

  if (!project) {
    return (
      <div className="mx-auto max-w-3xl px-10 py-20 text-center">
        <h1 className="font-display text-[24px] font-bold text-[var(--primary)]">
          Projet introuvable
        </h1>
        <p className="mt-2 font-body text-[14px] text-[var(--text-muted)]">
          Aucun projet ne correspond au slug{" "}
          <code className="rounded bg-[var(--secondary)] px-1.5 py-0.5 font-mono text-[12px]">{slug}</code>.
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

  return (
    <div className="mx-auto max-w-[1280px] px-10 py-10">
      {/* PROJECT HEADER */}
      <header className="flex items-start gap-5">
        <span
          className="flex size-14 shrink-0 items-center justify-center rounded-md text-white"
          style={{ background: project.color }}
        >
          <ProjectHeaderIcon icon={project.icon} />
        </span>
        <div className="flex-1">
          <h1 className="font-display text-[32px] font-bold leading-tight text-[var(--primary)]">
            {project.name}
          </h1>
          <p className="mt-1 font-body text-[14px] text-[var(--text-muted)]">
            {project.description}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            aria-label="Visibilité"
            className="synelia-visibility"
            type="button"
          >
            {project.visibility === "public" ? (
              <>
                <GlobeIcon className="size-3" /> Public
              </>
            ) : (
              <>
                <LockIcon className="size-3" /> Privé
              </>
            )}
          </button>
          <span className="synelia-avatar-stack">
            {project.members.slice(0, 4).map((m, i) => (
              <span
                className="synelia-avatar text-[10px]"
                key={i}
                style={{ background: m.color, color: "var(--white)" }}
              >
                {m.initials}
              </span>
            ))}
            {project.members.length > 4 && (
              <span
                className="synelia-avatar text-[10px]"
                style={{ background: "var(--primary-mid)", color: "var(--white)" }}
              >
                +{project.members.length - 4}
              </span>
            )}
          </span>
          <button className="synelia-btn synelia-btn-ghost h-9 px-3 text-[12px]">
            Inviter
          </button>
          <button className="synelia-btn synelia-btn-primary h-9 px-4 text-[12px]">
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
        {TABS.map((t) => (
          <Link
            className={cn(
              "flex items-center gap-2 border-b-2 px-4 py-3 font-body text-[13px] font-semibold",
              "border-transparent text-[var(--text-muted)] transition-colors hover:text-[var(--primary)]",
              t.key === "conversations" &&
                "border-[var(--accent)] text-[var(--primary)]"
            )}
            href={`/w/${slug}?tab=${t.key}`}
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
        ))}
      </nav>

      {/* CONVERSATIONS PANE (default tab) */}
      <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-[18px] font-bold text-[var(--primary)]">
              Conversations
            </h2>
            <span className="font-body text-[12px] text-[var(--text-muted)]">
              {conversations.length} actives
            </span>
          </div>
          <ul className="flex flex-col divide-y divide-[var(--border-soft)] rounded-lg border border-[var(--border)] bg-white">
            {conversations.map((c) => (
              <li
                className="flex cursor-pointer items-center gap-4 px-5 py-4 transition-colors hover:bg-[var(--background-alt)]"
                key={c.id}
              >
                <span
                  className="flex size-10 shrink-0 items-center justify-center rounded-md"
                  style={{
                    background: "var(--secondary)",
                    color: "var(--primary)",
                  }}
                >
                  <MessageSquareIcon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-display text-[14px] font-semibold text-[var(--foreground)]">
                      {c.title}
                    </span>
                    {c.aiStreaming && <span className="synelia-live-pill">L&rsquo;IA r&eacute;pond</span>}
                    {c.live && !c.aiStreaming && <span className="synelia-live-pill" style={{ background: "var(--success)", color: "var(--primary-dark)" }}>Live</span>}
                  </div>
                  <p className="mt-1 line-clamp-1 font-body text-[12px] text-[var(--text-muted)]">
                    <span className="font-semibold text-[var(--text-sub)]">{c.who}</span> &middot; {c.lastMessage}
                  </p>
                </div>
                <span className="shrink-0 font-body text-[11px] text-[var(--text-muted)]">
                  {c.when}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* ARTIFACTS PANE (preview, 4 col) */}
        <div className="lg:col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-[18px] font-bold text-[var(--primary)]">
              Artefacts r&eacute;cents
            </h2>
            <Link
              className="font-body text-[12px] font-semibold text-[var(--primary)] hover:underline"
              href={`/w/${slug}?tab=artifacts`}
            >
              Tout voir &rarr;
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {artifacts.slice(0, 4).map((a) => (
              <article
                className="flex flex-col gap-2 rounded-lg border border-[var(--border)] bg-white p-3"
                key={a.id}
                style={{
                  minHeight: dimensions.artifactCardHeight,
                  width: "100%",
                }}
              >
                <div className="flex items-start justify-between">
                  <span
                    className="synelia-kind-chip"
                    style={{
                      background: kindColor[a.kind],
                      color: kindText[a.kind],
                    }}
                  >
                    {a.kind}
                  </span>
                  {a.live && <span className="synelia-live-pill">En cours</span>}
                </div>
                <h3 className="font-display text-[14px] font-semibold text-[var(--primary)] line-clamp-2">
                  {a.title}
                </h3>
                <div className="mt-auto flex items-center gap-2 font-body text-[10px] text-[var(--text-muted)]">
                  <span>{a.who}</span>
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
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function ProjectHeaderIcon({ icon }: { icon: "shield-check" | "cloud" | "lock" | "graduation-cap" }) {
  const common = {
    "aria-hidden": true,
    className: "size-6",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    viewBox: "0 0 24 24",
  } as const;
  switch (icon) {
    case "shield-check":
      return (
        <svg {...common}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "cloud":
      return (
        <svg {...common}>
          <path d="M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.5-1.5A4 4 0 0 0 6 16" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect height="11" rx="2" width="18" x="3" y="11" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    case "graduation-cap":
      return (
        <svg {...common}>
          <path d="M22 10 12 5 2 10l10 5 10-5z" />
          <path d="M6 12v5c3 2 9 2 12 0v-5" />
        </svg>
      );
  }
}
