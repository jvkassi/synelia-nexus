import Link from "next/link";
import {
  PlusIcon,
  SparklesIcon,
  MessageSquareIcon,
  UsersIcon,
  FileTextIcon,
  ArrowRightIcon,
} from "lucide-react";
import { SyneliaRule } from "@/components/synelia-rule";
import { colors } from "@/lib/design-tokens";

/**
 * Synelia Cowork — Dashboard (Home).
 *
 * Reference: zip/src/app.jsx "home" view + DESIGN.md "Dashboard hero".
 *  - Greeting "Bonjour, {firstName}." (H1 violet) + subline about active projects
 *  - Right: "Inviter" ghost + "Nouveau projet" primary
 *  - 56×3 magenta rule
 *  - 2-col grid: project cards left (8 col) + recent activity right (4 col)
 *  - Project card: colored tile, name (H3 violet), description (muted), stats row
 *    (chats, files, avatar stack)
 *  - Empty state when no projects — for now we mock 4 active projects.
 *
 * Mock data lives here. The real query (getWorkspacesForUser) lands with
 * the Workspace/Thread schema in Phase 1B/2.
 */

const projectCards = [
  {
    id: "audit-coris-bank",
    name: "Audit Coris Bank",
    description:
      "Cartographie des risques SI et plan de remédiation. En cours depuis 14 jours.",
    color: colors.primary,
    icon: "shield-check" as const,
    chats: 8,
    artifacts: 12,
    members: ["AK", "KH", "FE", "YN", "MT"],
    live: true,
  },
  {
    id: "migration-cloud-orange",
    name: "Migration Cloud Orange CI",
    description:
      "Transfert des workloads critiques vers le cloud souverain. Phase 2 en cours.",
    color: colors.info,
    icon: "cloud" as const,
    chats: 4,
    artifacts: 6,
    members: ["YN", "FE"],
  },
  {
    id: "conformite-pci-dss",
    name: "Conformité PCI-DSS",
    description:
      "Audit annuel. Documents de preuves et matrice de risques à finaliser.",
    color: colors.warning,
    icon: "lock" as const,
    chats: 3,
    artifacts: 9,
    members: ["KH", "AK", "MT"],
  },
  {
    id: "academie-synelia",
    name: "Académie Synelia 2026",
    description:
      "Programme de formation continue. Tronc commun IA + 3 parcours métier.",
    color: colors.success,
    icon: "graduation-cap" as const,
    chats: 6,
    artifacts: 4,
    members: ["MT", "FE", "YN", "AK", "KH", "AO"],
  },
];

const activity = [
  {
    id: "a1",
    who: "Khady",
    action: "a partagé",
    what: "Matrice de risques v3",
    where: "Audit Coris Bank",
    when: "il y a 5 min",
    avatarColor: colors.accent,
  },
  {
    id: "a2",
    who: "Olive IA",
    action: "a généré un Diagramme",
    what: "Architecture cible Cloud",
    where: "Migration Cloud Orange CI",
    when: "il y a 12 min",
    avatarColor: colors.primary,
    isAI: true,
  },
  {
    id: "a3",
    who: "Yann",
    action: "a commenté",
    what: "Plan de remédiation priorisé",
    where: "Conformité PCI-DSS",
    when: "il y a 32 min",
    avatarColor: colors.info,
  },
  {
    id: "a4",
    who: "Fanta",
    action: "a démarré",
    what: "Note de synthèse COPIL",
    where: "Académie Synelia 2026",
    when: "il y a 1 h",
    avatarColor: colors.success,
  },
  {
    id: "a5",
    who: "Awa",
    action: "a partagé un lien public",
    what: "Document PCI-DSS — synthèse",
    where: "Conformité PCI-DSS",
    when: "il y a 2 h",
    avatarColor: colors.primary,
  },
];

const suggestions = [
  "Consolide les constats en matrice de risques",
  "Génère un plan de remédiation priorisé",
  "Rédige une note de synthèse pour le COPIL",
  "Analyse les écarts PCI-DSS du référentiel",
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-[1280px] px-10 py-10">
      {/* HERO */}
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-[40px] font-bold leading-tight text-[var(--primary)]">
            Bonjour, Awa.
          </h1>
          <p className="mt-2 font-body text-[15px] text-[var(--text-muted)]">
            Votre &eacute;quipe travaille sur{" "}
            <span className="font-bold text-[var(--foreground)]">3 projets</span>{" "}
            en ce moment.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="synelia-btn synelia-btn-ghost h-10 px-4 text-[13px]">
            <UsersIcon className="size-4" />
            Inviter
          </button>
          <button className="synelia-btn synelia-btn-primary h-10 px-4 text-[13px]">
            <PlusIcon className="size-4" />
            Nouveau projet
          </button>
        </div>
      </header>
      <SyneliaRule />

      {/* SUGGESTIONS */}
      <section className="mt-8 flex flex-col gap-3">
        <span className="synelia-eyebrow">suggestions de l&rsquo;instant</span>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              className="rounded-full border border-[var(--border)] bg-white px-4 py-2 font-body text-[12px] text-[var(--text-sub)] transition-colors hover:border-[var(--primary-mid)] hover:text-[var(--primary)]"
              key={s}
            >
              <SparklesIcon
                aria-hidden
                className="mr-1.5 inline size-3.5"
                style={{ color: "var(--accent)" }}
              />
              {s}
            </button>
          ))}
        </div>
      </section>

      {/* MAIN GRID */}
      <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Project cards — 8 col */}
        <div className="lg:col-span-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-[18px] font-bold text-[var(--primary)]">
              Vos projets actifs
            </h2>
            <Link
              className="font-body text-[12px] font-semibold text-[var(--primary)] hover:underline"
              href="/w"
            >
              Tout afficher &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {projectCards.map((p) => (
              <Link
                className="group relative flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-white p-5 transition-all hover:border-[var(--primary-mid)] hover:shadow-[var(--shadow-md)]"
                href={`/w/${p.id}`}
                key={p.id}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="flex size-12 shrink-0 items-center justify-center rounded-md text-white"
                    style={{ background: p.color }}
                  >
                    <ProjectCardIcon icon={p.icon} />
                  </span>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-display text-[16px] font-bold text-[var(--primary)] group-hover:text-[var(--primary-mid)]">
                        {p.name}
                      </h3>
                      {p.live && <span className="synelia-live-pill">En direct</span>}
                    </div>
                    <p className="mt-1 line-clamp-2 font-body text-[12px] text-[var(--text-muted)]">
                      {p.description}
                    </p>
                  </div>
                </div>
                <div className="mt-auto flex items-center gap-4 border-t border-[var(--border)] pt-3 font-body text-[11px] text-[var(--text-muted)]">
                  <span className="flex items-center gap-1.5">
                    <MessageSquareIcon className="size-3.5" /> {p.chats} conversations
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FileTextIcon className="size-3.5" /> {p.artifacts} artefacts
                  </span>
                  <span className="ml-auto synelia-avatar-stack">
                    {p.members.map((m, i) => (
                      <span
                        className="synelia-avatar size-6 text-[9px]"
                        key={i}
                        style={{ background: colors.accent, color: "var(--white)" }}
                      >
                        {m}
                      </span>
                    ))}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Activity — 4 col */}
        <div className="lg:col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-[18px] font-bold text-[var(--primary)]">
              Activit&eacute; r&eacute;cente
            </h2>
            <Link
              className="font-body text-[12px] font-semibold text-[var(--primary)] hover:underline"
              href="/activite"
            >
              Tout voir &rarr;
            </Link>
          </div>
          <ul className="flex flex-col divide-y divide-[var(--border-soft)] rounded-lg border border-[var(--border)] bg-white">
            {activity.map((a) => (
              <li className="flex items-start gap-3 px-4 py-3" key={a.id}>
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-full font-display text-[10px] font-bold"
                  style={{
                    background: a.avatarColor,
                    color: "var(--white)",
                    boxShadow: a.isAI ? "0 0 0 2px var(--accent)" : undefined,
                  }}
                >
                  {a.isAI ? "✦" : a.who.slice(0, 1)}
                </span>
                <div className="flex-1 overflow-hidden">
                  <p className="font-body text-[12px] leading-snug text-[var(--foreground)]">
                    <span className="font-bold">{a.who}</span>{" "}
                    <span className="text-[var(--text-muted)]">{a.action}</span>{" "}
                    <span className="font-semibold">{a.what}</span>
                  </p>
                  <p className="mt-0.5 font-body text-[11px] text-[var(--text-muted)]">
                    {a.where} &middot; {a.when}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function ProjectCardIcon({ icon }: { icon: "shield-check" | "cloud" | "lock" | "graduation-cap" }) {
  const common = {
    "aria-hidden": true,
    className: "size-5",
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
