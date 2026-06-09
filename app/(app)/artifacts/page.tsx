import { Share2Icon } from "lucide-react";
import Link from "next/link";
import { SyneliaRule } from "@/components/synelia-rule";
import { Avatar } from "@/components/synelia/avatar";
import { Icon } from "@/components/synelia/icon";
import {
  ARTIFACTS,
  type ArtifactKind,
  getMember,
  KIND_TEXT,
  KIND_VAR,
  PROJECTS,
  projectNameOf,
} from "@/lib/synelia/data";

const KINDS: { key: "all" | ArtifactKind; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "Document", label: "Document" },
  { key: "Tableur", label: "Tableur" },
  { key: "Diagramme", label: "Diagramme" },
];

export default async function ArtifactsPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string; kind?: string }>;
}) {
  const { project = "all", kind = "all" } = await searchParams;

  const filtered = ARTIFACTS.filter(
    (a) =>
      (project === "all" || a.project === project) &&
      (kind === "all" || a.kind === kind)
  );
  const sharedCount = ARTIFACTS.filter((a) => a.shared).length;

  const hrefWith = (next: { project?: string; kind?: string }) => {
    const sp = new URLSearchParams();
    const p = next.project ?? project;
    const k = next.kind ?? kind;
    if (p !== "all") {
      sp.set("project", p);
    }
    if (k !== "all") {
      sp.set("kind", k);
    }
    const qs = sp.toString();
    return qs ? `/artifacts?${qs}` : "/artifacts";
  };

  return (
    <div className="mx-auto max-w-[1280px] px-10 py-10">
      <header className="flex items-end justify-between">
        <div>
          <span className="synelia-eyebrow">Tous les projets</span>
          <h1 className="mt-2 font-display text-[32px] font-bold leading-tight text-[var(--primary)]">
            Artefacts
          </h1>
          <p className="mt-1 font-body text-[14px] text-[var(--text-muted)]">
            {ARTIFACTS.length} artefacts produits par votre équipe et l&rsquo;IA ·{" "}
            <span className="font-semibold text-[var(--success)]">
              {sharedCount} partagés par lien
            </span>
          </p>
        </div>
      </header>
      <SyneliaRule />

      {/* PROJECT FILTER CHIPS */}
      <section className="mt-6 flex flex-wrap items-center gap-2">
        <span className="font-body text-[11px] font-bold tracking-[0.12em] text-[var(--text-muted)]">
          PROJET
        </span>
        <FilterChip active={project === "all"} href={hrefWith({ project: "all" })} label="Tous les projets" />
        {PROJECTS.map((p) => (
          <FilterChip
            active={project === p.id}
            color={p.color}
            href={hrefWith({ project: p.id })}
            key={p.id}
            label={p.name}
          />
        ))}
      </section>

      {/* KIND SEGMENTED CONTROL */}
      <section className="mt-3 flex items-center gap-2">
        <span className="font-body text-[11px] font-bold tracking-[0.12em] text-[var(--text-muted)]">
          TYPE
        </span>
        <div className="flex items-center gap-1 rounded-md border border-[var(--border)] bg-white p-0.5">
          {KINDS.map((k) => {
            const isActive = kind === k.key;
            return (
              <Link
                className="rounded-sm px-3 py-1 font-body text-[12px] font-semibold transition-colors"
                href={hrefWith({ kind: k.key })}
                key={k.key}
                style={
                  isActive
                    ? { background: "var(--primary)", color: "var(--white)" }
                    : { color: "var(--text-sub)" }
                }
              >
                {k.label}
              </Link>
            );
          })}
        </div>
        <span className="ml-auto font-body text-[12px] text-[var(--text-muted)]">
          {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
        </span>
      </section>

      {/* ARTIFACT GRID */}
      {filtered.length === 0 ? (
        <div className="mt-8 flex items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-white px-6 py-16">
          <p className="font-body text-[13px] text-[var(--text-muted)]">
            Aucun artefact ne correspond à ce filtre.
          </p>
        </div>
      ) : (
        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((a) => (
            <Link
              className="group flex min-h-[160px] flex-col gap-2 rounded-lg border border-[var(--border)] bg-white p-4 transition-all hover:border-[var(--primary-mid)] hover:shadow-[var(--shadow-md)]"
              href={`/a/${a.id}`}
              key={a.id}
            >
              <div className="flex items-start justify-between">
                <span
                  className="synelia-kind-chip"
                  style={{ background: KIND_VAR[a.kind], color: KIND_TEXT[a.kind] }}
                >
                  {a.kind}
                </span>
                {a.live && <span className="synelia-live-pill">En cours</span>}
              </div>
              <h3 className="line-clamp-2 font-display text-[14px] font-semibold text-[var(--primary)] group-hover:text-[var(--primary-mid)]">
                {a.title}
              </h3>
              <div
                className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full px-2 py-0.5 font-body text-[10px] font-semibold"
                style={{ background: "var(--secondary)", color: "var(--text-sub)" }}
              >
                <Icon className="size-3" name={a.icon} />
                {projectNameOf(a.project)}
              </div>
              <div className="mt-auto flex items-center gap-2 font-body text-[10px] text-[var(--text-muted)]">
                <Avatar id={a.creator} size={20} />
                <span className="font-semibold text-[var(--text-sub)]">
                  {getMember(a.creator)?.name.split(" ")[0] ?? a.creator}
                </span>
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
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}

function FilterChip({
  href,
  label,
  active,
  color,
}: {
  href: string;
  label: string;
  active: boolean;
  color?: string;
}) {
  return (
    <Link
      className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white px-3 py-1.5 font-body text-[12px] font-semibold text-[var(--text-sub)] transition-colors hover:border-[var(--primary-mid)] hover:text-[var(--primary)]"
      href={href}
      style={
        active
          ? { background: "var(--primary)", borderColor: "var(--primary)", color: "var(--white)" }
          : undefined
      }
    >
      {color && (
        <span aria-hidden className="size-2 rounded-full" style={{ background: color }} />
      )}
      {label}
    </Link>
  );
}
