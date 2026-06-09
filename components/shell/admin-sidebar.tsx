"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboardIcon, UsersIcon, FolderIcon, BarChart2Icon, ShieldIcon,
  ArrowLeftIcon,
} from "lucide-react";

const NAV = [
  { tab: "overview",    label: "Vue d'ensemble",  icon: <LayoutDashboardIcon size={16} /> },
  { tab: "members",     label: "Membres",          icon: <UsersIcon size={16} /> },
  { tab: "projects",    label: "Projets",          icon: <FolderIcon size={16} /> },
  { tab: "usage",       label: "Usage IA",         icon: <BarChart2Icon size={16} /> },
  { tab: "governance",  label: "Gouvernance",      icon: <ShieldIcon size={16} /> },
];

export function AdminSidebar({ currentUser }: { currentUser: { name: string; email: string } }) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") ?? "overview";

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sb-brand">
        <span className="wm">SYNELIA</span>
        <span className="dot" aria-hidden />
        <span className="sub">COWORK</span>
        <span className="sb-admin-badge">ADMIN</span>
      </div>

      <div className="sb-scroll">
        {/* Back to app */}
        <Link href="/" className="sb-back">
          <ArrowLeftIcon size={14} />
          Retour à l&apos;app
        </Link>

        {/* Admin nav */}
        <nav className="sb-nav">
          {NAV.map(({ tab, label, icon }) => {
            const active = currentTab === tab;
            return (
              <Link key={tab} href={`/admin?tab=${tab}`} className={`sb-link${active ? " active" : ""}`}>
                <span className="ic">{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Current user */}
      <div className="sb-foot">
        <div className="sb-me">
          <span
            className="av"
            style={{ width: 30, height: 30, background: "#4B2882", fontSize: 12 }}
          >
            {currentUser.name.slice(0, 2).toUpperCase()}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentUser.name}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentUser.email}</div>
          </div>
          <span className="role-chip">Admin</span>
        </div>
      </div>
    </aside>
  );
}
