import {
  LayoutGridIcon,
  LibraryIcon,
  PlusIcon,
  RepeatIcon,
  SettingsIcon,
} from "lucide-react";
import Link from "next/link";
import { SyneliaRule } from "@/components/synelia-rule";
import { Icon } from "@/components/synelia/icon";
import { DEPARTMENT } from "@/lib/synelia/data";
import { cn } from "@/lib/utils";

/**
 * Synelia Cowork — sidebar.
 *
 * Reference: design `src/sidebar.jsx`.
 *   - Wordmark: SYNELIA • COWORK
 *   - Department selector card
 *   - White "Nouveau projet" button
 *   - Nav: Accueil / Bibliothèque de prompts / Artefacts / Routines
 *     (the "Activité de l'équipe" menu and online chrome were cut in design)
 *   - "PROJETS PARTAGÉS" section — shared project rows (+ live dot)
 *   - Footer: current user pill + settings gear
 */

type SidebarProject = {
  id: string;
  name: string;
  icon: string;
  color: string;
  live?: boolean;
};

type SidebarProps = {
  currentUser: { name: string; email: string };
  projects: SidebarProject[];
  activeProjectId?: string;
};

const navItems = [
  { href: "/", label: "Accueil", Icon: LayoutGridIcon },
  { href: "/library", label: "Bibliothèque de prompts", Icon: LibraryIcon },
  { href: "/artifacts", label: "Artefacts", Icon: LibraryIcon },
  { href: "/routines", label: "Routines", Icon: RepeatIcon },
];

export function Sidebar({ currentUser, projects, activeProjectId }: SidebarProps) {
  const initials = currentUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
        <div className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left">
          <span
            className="flex size-7 items-center justify-center rounded text-[10px] font-extrabold text-white"
            style={{ background: "var(--primary-mid)" }}
          >
            {DEPARTMENT.initials}
          </span>
          <span className="flex-1 font-body text-[12px] font-semibold">
            {DEPARTMENT.name}
          </span>
          <span className="font-body text-[11px] text-white/50">
            {DEPARTMENT.memberCount} membres
          </span>
        </div>
      </div>

      {/* "Nouveau projet" button */}
      <div className="px-4 pt-4">
        <Link
          className="synelia-btn synelia-btn-ghost h-9 w-full justify-center text-[12px] font-bold"
          href="/new-project"
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
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 font-body text-[13px] font-semibold",
              "text-white/80 transition-colors hover:bg-white/5 hover:text-white"
            )}
            href={item.href}
            key={item.href}
          >
            <item.Icon className="size-[15px]" />
            <span className="flex-1">{item.label}</span>
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
                aria-current={p.id === activeProjectId ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 font-body text-[13px]",
                  p.id === activeProjectId
                    ? "bg-white/10 text-white"
                    : "text-white/80 transition-colors hover:bg-white/5 hover:text-white"
                )}
                href={`/w/${p.id}`}
              >
                <span
                  className="flex size-7 shrink-0 items-center justify-center rounded text-white"
                  style={{ background: p.color }}
                >
                  <Icon className="size-3.5" name={p.icon} strokeWidth={2.4} />
                </span>
                <span className="flex-1 truncate">{p.name}</span>
                {p.live && (
                  <span aria-label="En direct" className="synelia-live-dot" />
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
          style={{ background: "var(--accent)", color: "var(--white)" }}
        >
          {initials}
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
          type="button"
        >
          <SettingsIcon className="size-4" />
        </button>
      </div>
    </aside>
  );
}
