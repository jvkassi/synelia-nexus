"use client";

import {
  LayoutGridIcon,
  LibraryIcon,
  PlusIcon,
  RepeatIcon,
  SettingsIcon,
  LayoutGrid,
  BoxIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/synelia/icon";
import { DEPARTMENT } from "@/lib/synelia/data";

export type SidebarProject = {
  id: string;
  name: string;
  icon: string;
  color: string;
  live?: boolean;
};

export type SidebarProps = {
  currentUser: { name: string; email: string };
  projects: SidebarProject[];
  activeProjectId?: string;
  routinesCount?: number;
  onNewProject?: () => void;
};

const NAV_ITEMS = [
  { href: "/", label: "Accueil", icon: "layout-grid" as const },
  { href: "/library", label: "Bibliothèque de prompts", icon: "library" as const },
  { href: "/artifacts", label: "Artefacts", icon: "folder-kanban" as const },
  { href: "/routines", label: "Routines", icon: "repeat" as const },
];

export function Sidebar({
  currentUser,
  projects,
  activeProjectId,
  routinesCount,
  onNewProject,
}: SidebarProps) {
  const pathname = usePathname();
  const initials = currentUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="sidebar">
      {/* Wordmark */}
      <div className="sb-brand">
        <span className="wm">SYNELIA</span>
        <span className="dot" aria-hidden />
        <span className="sub">COWORK</span>
      </div>

      {/* Department card */}
      <div className="sb-dept">
        <div className="d-ic">
          <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", letterSpacing: "0.04em" }}>
            {DEPARTMENT.initials.slice(0, 2)}
          </span>
        </div>
        <div>
          <div className="d-name">{DEPARTMENT.name}</div>
          <div className="d-meta">{DEPARTMENT.memberCount} membres</div>
        </div>
      </div>

      {/* Scrollable area */}
      <div className="sb-scroll">
        {/* New project button */}
        <button className="sb-newbtn" type="button" onClick={onNewProject}>
          <PlusIcon size={15} strokeWidth={2.5} />
          Nouveau projet
        </button>

        {/* Primary nav */}
        <nav className="sb-nav">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sb-link${isActive ? " active" : ""}`}
              >
                <span className="ic">
                  <Icon name={item.icon} size={15} strokeWidth={2} />
                </span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.href === "/routines" && routinesCount != null && routinesCount > 0 && (
                  <span className="badge-n">{routinesCount}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Shared projects */}
        <div className="sb-section">
          Projets partagés
          <button className="add" aria-label="Ajouter un projet" type="button" onClick={onNewProject}>
            <PlusIcon size={13} />
          </button>
        </div>

        {projects.map((p) => {
          const isActive = p.id === activeProjectId;
          return (
            <Link
              key={p.id}
              href={`/w/${p.id}`}
              className={`sb-proj${isActive ? " active" : ""}`}
            >
              <span className="p-ic" style={{ background: p.color }}>
                <Icon name={p.icon} size={13} strokeWidth={2.2} style={{ color: "#fff" }} />
              </span>
              <span className="p-name">{p.name}</span>
              {p.live && <span className="p-live" aria-label="En direct" />}
            </Link>
          );
        })}
      </div>

      {/* User footer */}
      <div className="sb-me">
        <span
          className="av"
          style={{ width: 32, height: 32, background: "var(--color-accent)", fontSize: 12 }}
        >
          {initials}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="nm" style={{ color: "#fff" }}>{currentUser.name}</div>
          <div className="rl">{currentUser.email}</div>
        </div>
        <Link href="/admin" className="gear" aria-label="Administration" title="Administration">
          <SettingsIcon size={15} />
        </Link>
      </div>
    </aside>
  );
}
