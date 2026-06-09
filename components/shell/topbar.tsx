"use client";

import { BellIcon, MenuIcon, SearchIcon, UserPlusIcon } from "lucide-react";

export type TopbarProps = {
  breadcrumb?: string;
  onInvite?: () => void;
  onNewProject?: () => void;
  onBurger?: () => void;
};

export function Topbar({ breadcrumb, onInvite, onBurger }: TopbarProps) {
  return (
    <div className="topbar">
      {/* Burger (mobile) */}
      <button
        className="tb-burger ic"
        type="button"
        aria-label="Menu"
        onClick={onBurger}
        style={{ color: "var(--color-text-sub)", padding: "7px", borderRadius: 8 }}
      >
        <MenuIcon size={20} />
      </button>

      {/* Breadcrumb */}
      <div className="tb-crumb">
        <span>Synelia</span>
        {breadcrumb && (
          <>
            <span style={{ color: "var(--color-border)" }}>/</span>
            <span className="cur">{breadcrumb}</span>
          </>
        )}
      </div>

      {/* Search bar */}
      <div className="tb-search">
        <SearchIcon size={14} style={{ flex: "none" }} />
        <input
          type="text"
          placeholder="Rechercher… ⌘K"
          aria-label="Rechercher"
        />
      </div>

      {/* Right actions */}
      <div className="tb-right">
        <button
          className="btn btn-ghost btn-sm"
          type="button"
          onClick={onInvite}
        >
          <UserPlusIcon size={14} />
          Inviter
        </button>

        <button
          className="tb-icon"
          type="button"
          aria-label="Notifications"
        >
          <BellIcon size={18} />
          <span className="dotn" aria-hidden />
        </button>
      </div>
    </div>
  );
}
