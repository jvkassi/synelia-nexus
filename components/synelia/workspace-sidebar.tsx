"use client";

import {
  BrainCircuit,
  ChevronsUpDown,
  Globe,
  LayoutDashboard,
  LayoutGrid,
  Library,
  LogOut,
  Plus,
  Repeat,
  Search,
  Settings,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useMemo, useState } from "react";
import { colorFor, SynAvatar } from "@/components/synelia/avatar";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/lib/workspace-context";

/* Synelia Cowork — barre latérale sombre (variante « Projets ») */

const STROKE = 1.75;

function SbBrand() {
  return (
    <div
      className="flex items-center gap-2.5 px-[18px] pt-4 pb-3.5"
      style={{ fontFamily: "var(--font-display)" }}
    >
      <span className="font-extrabold text-[18px] text-white tracking-[0.08em]">
        SYNELIA
      </span>
      <span className="mb-3 size-[7px] rounded-full bg-magenta" />
      <span className="ml-auto font-medium text-[11px] text-white/50 uppercase tracking-[0.14em]">
        Cowork
      </span>
    </div>
  );
}

function SbDept() {
  const { workspace, members } = useWorkspace();
  return (
    <Link
      className="mx-3 mb-2 flex items-center gap-2.5 rounded-lg border border-white/[0.08] bg-white/[0.06] px-3 py-2.5 transition-colors hover:bg-white/10"
      href={`/w/${workspace.slug}`}
    >
      <span className="grid size-[30px] flex-none place-items-center rounded-[7px] bg-magenta">
        <BrainCircuit className="text-white" size={17} strokeWidth={STROKE} />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className="block truncate font-semibold text-[13.5px] text-white leading-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {workspace.name}
        </span>
        <span className="block text-[11px] text-white/55">
          Groupe Synelia · {members.length} membres
        </span>
      </span>
      <ChevronsUpDown
        className="flex-none text-white/55"
        size={15}
        strokeWidth={STROKE}
      />
    </Link>
  );
}

function SbSection({
  children,
  onAdd,
}: {
  children: React.ReactNode;
  onAdd?: () => void;
}) {
  return (
    <div
      className="my-1 flex items-center px-3 py-1 text-[10.5px] text-white/[0.42] uppercase tracking-[0.12em]"
      style={{ fontFamily: "var(--font-display)" }}
    >
      {children}
      {onAdd && (
        <button
          className="ml-auto rounded p-0.5 text-white/50 hover:bg-white/10 hover:text-white"
          onClick={onAdd}
          title="Nouveau projet"
          type="button"
        >
          <Plus size={14} strokeWidth={STROKE} />
        </button>
      )}
    </div>
  );
}

export function WorkspaceSidebar({
  userName,
  userRole,
  onNewProject,
}: {
  userName: string;
  userRole: string;
  onNewProject?: () => void;
}) {
  const { workspace, projects, recentChats, currentUserId } = useWorkspace();
  const pathname = usePathname();
  const [q, setQ] = useState("");
  const base = `/w/${workspace.slug}`;

  const nav = [
    { href: base, label: "Accueil", icon: LayoutDashboard, exact: true },
    {
      href: `${base}/library`,
      label: "Bibliothèque de prompts",
      icon: Library,
    },
    { href: `${base}/artifacts`, label: "Artefacts", icon: LayoutGrid },
    { href: `${base}/routines`, label: "Routines", icon: Repeat },
  ];

  const ql = q.trim().toLowerCase();
  const fProjects = useMemo(
    () =>
      ql ? projects.filter((p) => p.name.toLowerCase().includes(ql)) : projects,
    [projects, ql]
  );
  const fRecents = useMemo(
    () =>
      ql
        ? recentChats.filter((c) => c.title.toLowerCase().includes(ql))
        : recentChats,
    [recentChats, ql]
  );

  return (
    <aside className="flex h-dvh w-[264px] flex-none flex-col bg-primary-dark text-white">
      <SbBrand />
      <SbDept />

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pt-1.5 pb-3">
        <button
          className="mb-3.5 flex w-full items-center gap-2.5 rounded-sm bg-white px-3 py-2.5 font-semibold text-[13.5px] text-primary-dark shadow-sm transition-shadow hover:shadow-md active:translate-y-px"
          onClick={onNewProject}
          style={{ fontFamily: "var(--font-display)" }}
          type="button"
        >
          <Plus size={17} strokeWidth={STROKE} /> Nouveau projet
        </button>

        <div className="mb-3.5 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-[7px] text-white/55 transition-colors focus-within:border-white/30">
          <Search size={15} strokeWidth={STROKE} />
          <input
            className="min-w-0 flex-1 border-none bg-transparent text-[13px] text-white outline-none placeholder:text-white/50"
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher…"
            value={q}
          />
          {q && (
            <button
              className="inline-flex rounded p-px text-white/50 hover:text-white"
              onClick={() => setQ("")}
              type="button"
            >
              <X size={14} strokeWidth={STROKE} />
            </button>
          )}
        </div>

        <nav className="mb-4 flex flex-col gap-0.5">
          {nav.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                className={cn(
                  "flex w-full items-center gap-[11px] rounded-sm px-3 py-2 text-[13.5px] text-white/[0.78] transition-colors hover:bg-white/[0.07] hover:text-white",
                  active && "bg-white/[0.12] font-semibold text-white"
                )}
                href={item.href}
                key={item.href}
              >
                <item.icon size={17} strokeWidth={STROKE} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <SbSection onAdd={onNewProject}>Projets partagés</SbSection>
        <div className="mb-3.5 flex flex-col gap-0.5">
          {fProjects.map((p) => {
            const href = `${base}/projects/${p.id}`;
            const active = pathname.startsWith(href);
            return (
              <Link
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-white/[0.82] transition-colors hover:bg-white/[0.07]",
                  active && "bg-white/[0.12] text-white"
                )}
                href={href}
                key={p.id}
              >
                <span
                  className="grid size-[26px] flex-none place-items-center rounded-md"
                  style={{ background: p.color ?? colorFor(p.id) }}
                >
                  <LayoutGrid
                    className="text-white"
                    size={15}
                    strokeWidth={STROKE}
                  />
                </span>
                <span className="min-w-0 flex-1 truncate font-medium text-[13px] leading-tight">
                  {p.name}
                </span>
                {p.visibility === "public_to_workspace" && (
                  <Globe
                    className="flex-none text-white/55"
                    size={13}
                    strokeWidth={STROKE}
                  />
                )}
              </Link>
            );
          })}
          {fProjects.length === 0 && (
            <div className="px-3 py-1.5 text-[12px] text-white/45">
              Aucun projet.
            </div>
          )}
        </div>

        {fRecents.length > 0 && (
          <>
            <SbSection>Conversations récentes</SbSection>
            <div className="flex flex-col gap-0.5">
              {fRecents.slice(0, 5).map((c) => {
                const href = `${base}/projects/${c.projectId}/chat/${c.id}`;
                const active = pathname === href;
                return (
                  <Link
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-sm px-3 py-[7px] text-white/[0.78] transition-colors hover:bg-white/[0.07] hover:text-white",
                      active && "bg-white/[0.12] text-white"
                    )}
                    href={href}
                    key={c.id}
                    title={c.title}
                  >
                    <span
                      className="size-[7px] flex-none rounded-full"
                      style={{
                        background: c.projectColor ?? "rgba(255,255,255,.4)",
                      }}
                    />
                    <span className="min-w-0 flex-1 truncate text-[13px]">
                      {c.title}
                    </span>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-[9px] border-white/10 border-t px-3 py-2.5">
        <SynAvatar size={34} user={{ id: currentUserId, name: userName }} />
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold text-[12.5px]">{userName}</div>
          <div className="text-[11px] text-white/50">{userRole}</div>
        </div>
        <button
          className="rounded-md p-[5px] text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          title="Paramètres"
          type="button"
        >
          <Settings size={17} strokeWidth={STROKE} />
        </button>
        <button
          className="rounded-md p-[5px] text-white/60 transition-colors hover:bg-white/10 hover:text-magenta"
          onClick={() => signOut({ redirectTo: "/login" })}
          title="Se déconnecter"
          type="button"
        >
          <LogOut size={17} strokeWidth={STROKE} />
        </button>
      </div>
    </aside>
  );
}
