export const dynamic = "force-dynamic";

import {
  FileTextIcon,
  MessageSquareIcon,
  PlusIcon,
  RepeatIcon,
  SparklesIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { auth } from "@/app/(auth)/auth";
import { SyneliaRule } from "@/components/synelia-rule";
import { AvatarStack } from "@/components/synelia/avatar";
import { Icon } from "@/components/synelia/icon";
import {
  allChats,
  getMember,
  getProjectChats,
  PROJECTS,
  projectNameOf,
  ROUTINES,
} from "@/lib/synelia/data";

/**
 * Synelia Cowork — Dashboard (Home).
 * Greeting from the signed-in user; project cards, recent conversations and
 * active routines from the workspace data.
 */
export default async function HomePage() {
  const session = await auth();
  const fullName = session?.user?.name ?? session?.user?.email?.split("@")[0] ?? "";
  const firstName = fullName.split(" ")[0] || "vous";

  const recentChats = allChats()
    .filter((c) => c.live)
    .concat(allChats().filter((c) => !c.live))
    .slice(0, 5);

  const activeRoutines = ROUTINES.filter((r) => r.status === "active").slice(0, 4);
  const liveCount = allChats().filter((c) => c.live).length;

  return (
    <div className="mx-auto max-w-[1280px] px-10 py-10">
      {/* HERO */}
      <header className="flex items-end justify-between">
        <div>
          <span className="synelia-eyebrow">{new Date().getHours() < 18 ? "Bonjour" : "Bonsoir"}</span>
          <h1 className="mt-2 font-display text-[40px] font-bold leading-tight text-[var(--primary)]">
            Bonjour, {firstName}.
          </h1>
          <p className="mt-2 font-body text-[15px] text-[var(--text-muted)]">
            Votre équipe partage{" "}
            <span className="font-bold text-[var(--foreground)]">
              {PROJECTS.length} projets
            </span>
            {liveCount > 0 && (
              <>
                {" · "}
                <span className="font-bold text-[var(--accent)]">
                  {liveCount} conversation{liveCount > 1 ? "s" : ""} en direct
                </span>
              </>
            )}
            .
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="synelia-btn synelia-btn-ghost h-10 px-4 text-[13px]"
            type="button"
          >
            <UsersIcon className="size-4" />
            Inviter
          </button>
          <Link
            className="synelia-btn synelia-btn-primary h-10 px-4 text-[13px]"
            href="/new-project"
          >
            <PlusIcon className="size-4" />
            Nouveau projet
          </Link>
        </div>
      </header>
      <SyneliaRule />

      {/* MAIN GRID */}
      <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Project cards — 8 col */}
        <div className="lg:col-span-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-[18px] font-bold text-[var(--primary)]">
              Projets partagés
            </h2>
            <Link
              className="font-body text-[12px] font-semibold text-[var(--primary)] hover:underline"
              href="/w"
            >
              Tout afficher &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {PROJECTS.map((p) => {
              const live = getProjectChats(p.id).some((c) => c.live);
              return (
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
                      <Icon className="size-5" name={p.emoji} />
                    </span>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate font-display text-[16px] font-bold text-[var(--primary)] group-hover:text-[var(--primary-mid)]">
                          {p.name}
                        </h3>
                        {live && <span className="synelia-live-pill">En direct</span>}
                      </div>
                      <p className="mt-1 line-clamp-2 font-body text-[12px] text-[var(--text-muted)]">
                        {p.desc}
                      </p>
                    </div>
                  </div>
                  <div className="mt-auto flex items-center gap-4 border-t border-[var(--border)] pt-3 font-body text-[11px] text-[var(--text-muted)]">
                    <span className="flex items-center gap-1.5">
                      <MessageSquareIcon className="size-3.5" /> {p.chats}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FileTextIcon className="size-3.5" /> {p.artifacts}
                    </span>
                    <span className="ml-auto">
                      <AvatarStack ids={p.members} max={4} size={24} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right column — recent conversations + routines */}
        <div className="flex flex-col gap-8 lg:col-span-4">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-[18px] font-bold text-[var(--primary)]">
                Conversations récentes
              </h2>
            </div>
            <ul className="flex flex-col divide-y divide-[var(--border-soft)] rounded-lg border border-[var(--border)] bg-white">
              {recentChats.map((c) => {
                const who = getMember(c.lastBy);
                return (
                  <li className="flex items-start gap-3 px-4 py-3" key={c.id}>
                    <span
                      className="flex size-8 shrink-0 items-center justify-center rounded-md"
                      style={{ background: "var(--secondary)", color: "var(--primary)" }}
                    >
                      {c.live ? (
                        <SparklesIcon className="size-4" />
                      ) : (
                        <MessageSquareIcon className="size-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-display text-[13px] font-semibold text-[var(--foreground)]">
                          {c.title}
                        </span>
                        {c.liveState === "ai-typing" && (
                          <span className="synelia-live-pill">L&rsquo;IA répond</span>
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-1 font-body text-[11px] text-[var(--text-muted)]">
                        {projectNameOf(c.project)}
                        {c.liveState === "user-typing" && who
                          ? ` · ${who.name.split(" ")[0]} écrit…`
                          : ` · ${c.updated}`}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-[18px] font-bold text-[var(--primary)]">
                Routines actives
              </h2>
              <Link
                className="font-body text-[12px] font-semibold text-[var(--primary)] hover:underline"
                href="/routines"
              >
                Tout voir &rarr;
              </Link>
            </div>
            <ul className="flex flex-col divide-y divide-[var(--border-soft)] rounded-lg border border-[var(--border)] bg-white">
              {activeRoutines.map((r) => (
                <li className="flex items-center gap-3 px-4 py-3" key={r.id}>
                  <span
                    className="flex size-8 shrink-0 items-center justify-center rounded-md"
                    style={{ background: "var(--secondary)", color: "var(--primary)" }}
                  >
                    <Icon className="size-4" name={r.icon} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      className="block truncate font-display text-[13px] font-semibold text-[var(--foreground)] hover:text-[var(--primary)]"
                      href={`/routines?id=${r.id}`}
                    >
                      {r.title}
                    </Link>
                    <p className="mt-0.5 truncate font-body text-[11px] text-[var(--text-muted)]">
                      {r.cadence}
                    </p>
                  </div>
                  <RepeatIcon className="size-3.5 shrink-0 text-[var(--text-muted)]" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
