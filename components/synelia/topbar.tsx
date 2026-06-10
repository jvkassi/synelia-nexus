"use client";

import { Bell, ChevronRight, Search, UserPlus } from "lucide-react";
import Link from "next/link";
import { useWorkspace } from "@/lib/workspace-context";

/* Synelia Cowork — barre supérieure : fil d'ariane, recherche, actions */

const STROKE = 1.75;

export type Crumb = { label: string; href?: string };

export function Topbar({
  crumbs = [],
  onInvite,
}: {
  crumbs?: Crumb[];
  onInvite?: () => void;
}) {
  const { workspace } = useWorkspace();

  return (
    <header className="flex h-14 flex-none items-center gap-4 border-border border-b bg-card px-5">
      <nav className="flex min-w-0 items-center gap-1.5 text-[13px]">
        <Link
          className="font-medium text-muted-foreground transition-colors hover:text-foreground"
          href={`/w/${workspace.slug}`}
          style={{ fontFamily: "var(--font-display)" }}
        >
          {workspace.name}
        </Link>
        {crumbs.map((crumb) => (
          <span className="flex min-w-0 items-center gap-1.5" key={crumb.label}>
            <ChevronRight
              className="flex-none text-muted-foreground/60"
              size={14}
              strokeWidth={STROKE}
            />
            {crumb.href ? (
              <Link
                className="truncate text-muted-foreground transition-colors hover:text-foreground"
                href={crumb.href}
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="truncate font-medium text-foreground">
                {crumb.label}
              </span>
            )}
          </span>
        ))}
      </nav>

      <div className="mx-auto hidden w-full max-w-md items-center gap-2 rounded-full border border-border bg-secondary px-3.5 py-1.5 text-muted-foreground transition-colors focus-within:border-primary-mid md:flex">
        <Search size={15} strokeWidth={STROKE} />
        <input
          className="min-w-0 flex-1 border-none bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
          placeholder="Rechercher dans l'espace…"
        />
        <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-[10.5px] text-muted-foreground">
          ⌘K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          className="flex items-center gap-2 rounded-sm border border-border px-3 py-1.5 font-semibold text-[12.5px] text-primary transition-colors hover:border-primary-mid hover:bg-accent"
          onClick={onInvite}
          style={{ fontFamily: "var(--font-display)" }}
          type="button"
        >
          <UserPlus size={15} strokeWidth={STROKE} />
          Inviter
        </button>
        <button
          className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title="Notifications"
          type="button"
        >
          <Bell size={17} strokeWidth={STROKE} />
          <span className="absolute top-1.5 right-1.5 size-[7px] rounded-full bg-magenta ring-2 ring-card" />
        </button>
      </div>
    </header>
  );
}
