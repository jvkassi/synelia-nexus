export const dynamic = "force-dynamic";

import { Share2Icon } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/synelia/avatar";
import { Icon } from "@/components/synelia/icon";
import {
  ensureLoaded,
  ARTIFACTS,
  getMember,
  KIND_TEXT,
  KIND_VAR,
  PROJECTS,
  projectNameOf,
} from "@/lib/synelia/queries";
import type { ArtifactKind } from "@/lib/synelia/types";

const KINDS: { key: "all" | ArtifactKind; label: string; cls: string }[] = [
  { key: "all", label: "Tous", cls: "" },
  { key: "Document", label: "Document", cls: "k-doc" },
  { key: "Tableur", label: "Tableur", cls: "k-sheet" },
  { key: "Diagramme", label: "Diagramme", cls: "k-diag" },
];

const KIND_IC: Record<ArtifactKind, string> = {
  Document: "k-doc",
  Tableur: "k-sheet",
  Diagramme: "k-diag",
};

export default async function ArtifactsPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string; kind?: string }>;
}) {
  await ensureLoaded();
  const { project = "all", kind = "all" } = await searchParams;

  const allArtifacts = ARTIFACTS();
  const projects = PROJECTS();

  const filtered = allArtifacts.filter(
    (a) =>
      (project === "all" || a.project === project) &&
      (kind === "all" || a.kind === kind)
  );
  const sharedCount = allArtifacts.filter((a) => a.shared).length;

  const hrefWith = (next: { project?: string; kind?: string }) => {
    const sp = new URLSearchParams();
    const p = next.project ?? project;
    const k = next.kind ?? kind;
    if (p !== "all") sp.set("project", p);
    if (k !== "all") sp.set("kind", k);
    const qs = sp.toString();
    return qs ? `/artifacts?${qs}` : "/artifacts";
  };

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 36px 60px" }}>
      {/* HEADER */}
      <div style={{ marginBottom: 6 }}>
        <div className="dash-kicker">Tous les projets</div>
        <h1 style={{ margin: "6px 0 0" }}>Artefacts</h1>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)", marginTop: 8 }}>
          {allArtifacts.length} artefacts produits par votre équipe et l&rsquo;IA{" "}
          <span style={{ color: "var(--color-success)", fontWeight: 600 }}>
            · {sharedCount} partagés par lien
          </span>
        </p>
      </div>
      <div className="rule-mag" />

      {/* FILTERS */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
          Projet
        </span>
        {[{ id: "all", name: "Tous", color: undefined as string | undefined }, ...projects.map((p) => ({ id: p.id, name: p.name, color: p.color }))].map((p) => (
          <Link
            key={p.id}
            href={hrefWith({ project: p.id })}
            className={`lib-cat${project === p.id ? " on" : ""}`}
          >
            {p.color && project !== p.id && (
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, display: "inline-block" }} />
            )}
            {p.name}
          </Link>
        ))}
      </div>

      {/* KIND SEGMENTED */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
          Type
        </span>
        <div className="artg-kinds">
          {KINDS.map((k) => (
            <Link
              key={k.key}
              href={hrefWith({ kind: k.key })}
              className={`seg-btn${kind === k.key ? " on" : ""}`}
            >
              {k.label}
            </Link>
          ))}
        </div>
        <span className="artg-count" style={{ marginLeft: "auto" }}>
          {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* GRID */}
      {filtered.length === 0 ? (
        <div className="empty" style={{ border: "1.5px dashed var(--color-border)", borderRadius: "var(--radius-md)", padding: "60px 20px" }}>
          Aucun artefact ne correspond à ce filtre.
        </div>
      ) : (
        <div className="artg-grid">
          {filtered.map((a) => (
            <Link key={a.id} href={`/a/${a.id}`} className="artg-card">
              <div className="agc-top">
                <span className={`agc-ic ${KIND_IC[a.kind]}`}>
                  <Icon name={a.icon} size={20} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="agc-title">{a.title}</div>
                  <div className="agc-kind">
                    <span className={`kind-chip ${KIND_IC[a.kind]}`}>{a.kind}</span>
                    {a.live && <span className="pill-live pill" style={{ padding: "2px 9px", fontSize: "10.5px" }}><span className="d" />En cours</span>}
                  </div>
                </div>
              </div>
              <div className="agc-proj">
                <span className="ap-ic" style={{ background: projects.find((p) => p.id === a.project)?.color ?? "var(--color-primary)", width: 22, height: 22, borderRadius: 6 }}>
                  <Icon name={projects.find((p) => p.id === a.project)?.emoji ?? "folder"} size={12} style={{ color: "#fff" }} />
                </span>
                {projectNameOf(a.project)}
              </div>
              <div className="agc-foot">
                <span className="agc-by">
                  <Avatar id={a.creator} size={22} />
                  {getMember(a.creator)?.name.split(" ")[0] ?? a.creator}
                  <span className="dotsep">·</span>
                  {a.when}
                </span>
                {a.shared && (
                  <span className="agc-shared" style={{ marginLeft: "auto" }}>
                    <Share2Icon size={12} />
                    Partagé
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
