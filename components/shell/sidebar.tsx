import Link from "next/link";
import {
  LayoutGridIcon,
  LibraryIcon,
  MessageSquareIcon,
  RepeatIcon,
  PlusIcon,
  SettingsIcon,
  ChevronDownIcon,
} from "lucide-react";
import { SyneliaRule } from "@/components/synelia-rule";
import { colors } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

/**
 * Synelia Cowork — sidebar.
 *
 * Reference: zip/src/sidebar.jsx + DESIGN.md section "Sidebar (fixed left,
 * --color-primary-dark background, 264 px)".
 *
 *   - Wordmark top: SYNELIA • COWORK
 *   - Department card: violet chip + "Direction Data & IA · 6 membres"
 *   - White "Nouveau projet" button, full width
 *   - Nav: Accueil / Activité de l'équipe (count) / Bibliothèque de
 *     prompts / Artefacts / Routines
 *   - "PROJETS PARTAGÉS" section, list of project rows (icon + name +
 *     pulsing green dot if live)
 *   - Footer: current user pill + settings gear
 *
 * Width: 264 px on desktop, hidden on mobile (drawer comes Phase 5).
 */

type ProjectRow = {
  id: string;
  slug: string;
  name: string;
  iconKey: "shield-check" | "cloud" | "lock" | "graduation-cap";
  iconBg: string;
  live?: boolean;
};

type SidebarProps = {
  currentUser: { name: string; email: string; avatarColor: string };
  projects: ProjectRow[];
  activeProjectSlug?: string;
  activityCount: number;
};

const navItems = [
  { href: "/", label: "Accueil", Icon: LayoutGridIcon, exact: true },
  { href: "/activite", label: "Activité de l'équipe", Icon: MessageSquareIcon, badgeKey: "activity" as const },
  { href: "/library", label: "Bibliothèque de prompts", Icon: LibraryIcon },
  { href: "/artifacts", label: "Artefacts", Icon: MessageSquareIcon },
  { href: "/routines", label: "Routines", Icon: RepeatIcon },
];

const ICON_BG: Record<ProjectRow["iconKey"], string> = {
  "shield-check": colors.primary,
  cloud: colors.info,
  lock: colors.warning,
  "graduation-cap": colors.success,
};

export function Sidebar({ currentUser, projects, activeProjectSlug, activityCount }: SidebarProps) {
  return (
    <aside
      className="flex h-dvh w-[264px] shrink-0 flex-col"
      style={{ background: "var(--sidebar)", color: "var(--sidebar-foreground)" }}
    >
      {/* Wordmark */}
      <div className="flex items-center gap-3 px-6 pt-6">
        <span className="font-display text-[14px] font-extrabold tracking-[0.25em]">
          SYNELIA
        </span>
        <span
          aria-hidden
          className="block h-1.5 w-1.5 rounded-full"
          style={{ background: "var(--accent)" }}
        />
        <span className="font-display text-[10px] font-semibold tracking-[0.3em] text-white/60">
          COWORK
        </span>
      </div>

      {/* Department card */}
      <div className="mx-4 mt-6">
        <button
          aria-label="Déployer le département"
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left transition-colors hover:bg-white/5"
        >
          <span
            className="flex size-7 items-center justify-center rounded text-[10px] font-extrabold text-white"
            style={{ background: "var(--primary-mid)" }}
          >
            DI
          </span>
          <span className="flex-1 font-body text-[12px] font-semibold">
            Direction Data &amp; IA
          </span>
          <span className="font-body text-[11px] text-white/50">6 membres</span>
          <ChevronDownIcon className="size-3.5 text-white/50" />
        </button>
      </div>

      {/* "Nouveau projet" button */}
      <div className="px-4 pt-4">
        <Link
          href="/new-project"
          className="synelia-btn synelia-btn-ghost h-9 w-full justify-center text-[12px] font-bold"
          style={{ background: "var(--background)" }}
        >
          <PlusIcon className="size-4" />
          Nouveau projet
        </Link>
      </div>

      <SyneliaRule className="mx-6 my-4" />

      {/* Primary nav */}
      <nav className="flex flex-col gap-0.5 px-3">
        {navItems.map((item) => (
          <Link
            aria-current={item.exact ? undefined : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 font-body text-[13px] font-semibold",
              "text-white/80 transition-colors hover:bg-white/5 hover:text-white"
            )}
            href={item.href}
            key={item.href}
          >
            <item.Icon className="size-[15px]" />
            <span className="flex-1">{item.label}</span>
            {item.badgeKey === "activity" && activityCount > 0 && (
              <span
                className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 font-mono text-[10px] font-bold"
                style={{ background: "var(--accent)", color: "var(--white)" }}
              >
                {activityCount}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <SyneliaRule className="mx-6 my-4" />

      {/* Projects section */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="px-6 pb-2 font-body text-[10px] font-bold tracking-[0.18em] text-white/50">
          PROJETS PARTAGÉS
        </div>
        <ul className="flex-1 overflow-y-auto px-3 pb-4">
          {projects.map((p) => (
            <li key={p.id}>
              <Link
                aria-current={p.slug === activeProjectSlug ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 font-body text-[13px]",
                  p.slug === activeProjectSlug
                    ? "bg-white/10 text-white"
                    : "text-white/80 transition-colors hover:bg-white/5 hover:text-white"
                )}
                href={`/w/${p.slug}`}
              >
                <span
                  className="flex size-7 shrink-0 items-center justify-center rounded text-white"
                  style={{ background: ICON_BG[p.iconKey] }}
                >
                  <ProjectGlyph iconKey={p.iconKey} />
                </span>
                <span className="flex-1 truncate">{p.name}</span>
                {p.live && (
                  <span
                    aria-label="En direct"
                    className="size-2 shrink-0 rounded-full"
                    style={{ background: "var(--success)" }}
                  />
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer — current user pill + settings */}
      <div className="flex items-center gap-3 border-t border-white/10 p-4">
        <span
          aria-hidden
          className="flex size-8 shrink-0 items-center justify-center rounded-full font-display text-[11px] font-bold"
          style={{ background: colors.accent, color: "var(--white)" }}
        >
          {currentUser.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </span>
        <div className="flex-1 overflow-hidden">
          <div className="truncate font-body text-[12px] font-semibold text-white">
            {currentUser.name}
          </div>
          <div className="truncate font-body text-[10px] text-white/50">
            {currentUser.email}
          </div>
        </div>
        <button
          aria-label="Paramètres"
          className="text-white/60 transition-colors hover:text-white"
        >
          <SettingsIcon className="size-4" />
        </button>
      </div>
    </aside>
  );
}

function ProjectGlyph({ iconKey }: { iconKey: ProjectRow["iconKey"] }) {
  // Tiny inline glyphs to avoid pulling the full lucide set into the sidebar.
  // Renders as a white-on-color square icon. ~14px.
  switch (iconKey) {
    case "shield-check":
      return (
        <svg
          aria-hidden
          className="size-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          viewBox="0 0 24 24"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "cloud":
      return (
        <svg
          aria-hidden
          className="size-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          viewBox="0 0 24 24"
        >
          <path d="M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.5-1.5A4 4 0 0 0 6 16" />
        </svg>
      );
    case "lock":
      return (
        <svg
          aria-hidden
          className="size-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          viewBox="0 0 24 24"
        >
          <rect height="11" rx="2" width="18" x="3" y="11" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    case "graduation-cap":
      return (
        <svg
          aria-hidden
          className="size-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          viewBox="0 0 24 24"
        >
          <path d="M22 10 12 5 2 10l10 5 10-5z" />
          <path d="M6 12v5c3 2 9 2 12 0v-5" />
        </svg>
      );
  }
}
