import Link from "next/link";
import {
  SearchIcon,
  FilterIcon,
  Share2Icon,
  SparklesIcon,
  FileTextIcon,
} from "lucide-react";
import { SyneliaRule } from "@/components/synelia-rule";
import { colors, dimensions } from "@/lib/design-tokens";

/**
 * Synelia Cowork — global artifacts gallery.
 *
 * Reference: zip/src/app.jsx "artifacts" view + DESIGN.md "Information
 * architecture" /artifacts.
 *
 *   - Filter by project (chips), by kind (segmented control), full-text
 *     search (top-right)
 *   - Grid of artifact cards (kind chip + title + live pill if streaming)
 *   - Project chip below title (only on global view, not in-project view)
 *   - Footer row: avatar + first name · relative time · share icon if shared
 *
 * Mock data for now. Real query (listArtifactsAcrossProjectsForUser) lands
 * with the Workspace schema in Phase 1B/2.
 */

const allArtifacts = [
  { id: "a1", title: "Matrice de risques v3", kind: "Tableur" as const, project: "Audit Coris Bank", projectColor: colors.primary, who: "Khady", when: "il y a 5 min", live: true },
  { id: "a2", title: "Architecture cible cloud", kind: "Diagramme" as const, project: "Migration Cloud Orange CI", projectColor: colors.info, who: "Olive IA", when: "il y a 12 min", live: true },
  { id: "a3", title: "Plan de remédiation priorisé", kind: "Document" as const, project: "Audit Coris Bank", projectColor: colors.primary, who: "Olive IA", when: "il y a 1 h", live: false },
  { id: "a4", title: "Note de synthèse COPIL", kind: "Document" as const, project: "Audit Coris Bank", projectColor: colors.primary, who: "Awa", when: "il y a 3 h", live: false },
  { id: "a5", title: "Analyse écarts PCI-DSS", kind: "Document" as const, project: "Conformité PCI-DSS", projectColor: colors.warning, who: "Yann", when: "hier", live: false, shared: true },
  { id: "a6", title: "Cartographie des actifs", kind: "Tableur" as const, project: "Audit Coris Bank", projectColor: colors.primary, who: "Fanta", when: "il y a 2 jours", live: false },
  { id: "a7", title: "Schéma réseau cible", kind: "Diagramme" as const, project: "Migration Cloud Orange CI", projectColor: colors.info, who: "Mariam", when: "il y a 3 jours", live: false },
  { id: "a8", title: "Politique de gestion des clés", kind: "Document" as const, project: "Conformité PCI-DSS", projectColor: colors.warning, who: "Khady", when: "il y a 4 jours", live: false, shared: true },
  { id: "a9", title: "Trame de module de formation", kind: "Document" as const, project: "Académie Synelia 2026", projectColor: colors.success, who: "Mariam", when: "il y a 5 jours", live: false },
  { id: "a10", title: "Plan de cours — Prompt engineering", kind: "Document" as const, project: "Académie Synelia 2026", projectColor: colors.success, who: "Fanta", when: "il y a 6 jours", live: false },
  { id: "a11", title: "Backlog migration J+30", kind: "Tableur" as const, project: "Migration Cloud Orange CI", projectColor: colors.info, who: "Yann", when: "il y a 1 sem", live: false },
  { id: "a12", title: "Architecture 3-tiers cible", kind: "Diagramme" as const, project: "Audit Coris Bank", projectColor: colors.primary, who: "Olive IA", when: "il y a 1 sem", live: false, shared: true },
];

const projects = [
  { slug: "all", label: "Tous les projets", color: colors.primaryMid },
  { slug: "audit-coris-bank", label: "Audit Coris Bank", color: colors.primary },
  { slug: "migration-cloud-orange", label: "Migration Cloud Orange CI", color: colors.info },
  { slug: "conformite-pci-dss", label: "Conformité PCI-DSS", color: colors.warning },
  { slug: "academie-synelia", label: "Académie Synelia 2026", color: colors.success },
];

const kinds: { key: "all" | "Document" | "Tableur" | "Diagramme"; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "Document", label: "Document" },
  { key: "Tableur", label: "Tableur" },
  { key: "Diagramme", label: "Diagramme" },
];

const kindColor: Record<"Document" | "Tableur" | "Diagramme", string> = {
  Document: "var(--kind-doc)",
  Tableur: "var(--kind-tableur)",
  Diagramme: "var(--kind-diagramme)",
};

const kindText: Record<"Document" | "Tableur" | "Diagramme", string> = {
  Document: "var(--white)",
  Tableur: "var(--primary-dark)",
  Diagramme: "var(--primary-dark)",
};

export default function ArtifactsPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-10 py-10">
      <header className="flex items-end justify-between">
        <div>
          <span className="synelia-eyebrow">Tous les projets</span>
          <h1 className="mt-2 font-display text-[32px] font-bold leading-tight text-[var(--primary)]">
            Artefacts
          </h1>
          <p className="mt-1 font-body text-[14px] text-[var(--text-muted)]">
            Documents, tableurs et diagrammes produits par votre &eacute;quipe et l&rsquo;IA.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="synelia-input-wrapper max-w-[280px]">
            <SearchIcon className="synelia-input-icon size-[16px]" />
            <input
              className="synelia-input"
              placeholder="Rechercher dans les artefacts…"
              type="search"
            />
          </div>
          <button
            aria-label="Filtres avancés"
            className="flex size-10 items-center justify-center rounded-md border border-[var(--border)] bg-white text-[var(--text-muted)] transition-colors hover:text-[var(--primary)]"
            type="button"
          >
            <FilterIcon className="size-4" />
          </button>
        </div>
      </header>
      <SyneliaRule />

      {/* PROJECT FILTER CHIPS */}
      <section className="mt-6 flex flex-wrap items-center gap-2">
        <span className="font-body text-[11px] font-bold tracking-[0.12em] text-[var(--text-muted)]">
          PROJET
        </span>
        {projects.map((p) => (
          <button
            className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white px-3 py-1.5 font-body text-[12px] font-semibold text-[var(--text-sub)] transition-colors hover:border-[var(--primary-mid)] hover:text-[var(--primary)]"
            key={p.slug}
            style={
              p.slug === "all"
                ? {
                    background: "var(--primary)",
                    borderColor: "var(--primary)",
                    color: "var(--white)",
                  }
                : undefined
            }
            type="button"
          >
            {p.slug !== "all" && (
              <span
                aria-hidden
                className="size-2 rounded-full"
                style={{ background: p.color }}
              />
            )}
            {p.label}
          </button>
        ))}
      </section>

      {/* KIND SEGMENTED CONTROL */}
      <section className="mt-3 flex items-center gap-2">
        <span className="font-body text-[11px] font-bold tracking-[0.12em] text-[var(--text-muted)]">
          TYPE
        </span>
        <div className="flex items-center gap-1 rounded-md border border-[var(--border)] bg-white p-0.5">
          {kinds.map((k) => (
            <button
              className="rounded-sm px-3 py-1 font-body text-[12px] font-semibold transition-colors"
              key={k.key}
              style={
                k.key === "all"
                  ? { background: "var(--primary)", color: "var(--white)" }
                  : { color: "var(--text-sub)" }
              }
              type="button"
            >
              {k.label}
            </button>
          ))}
        </div>
        <span className="ml-auto font-body text-[12px] text-[var(--text-muted)]">
          {allArtifacts.length} artefacts
        </span>
      </section>

      {/* ARTIFACT GRID */}
      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {allArtifacts.map((a) => (
          <Link
            className="group flex flex-col gap-2 rounded-lg border border-[var(--border)] bg-white p-4 transition-all hover:border-[var(--primary-mid)] hover:shadow-[var(--shadow-md)]"
            href={`/a/${a.id}`}
            key={a.id}
            style={{ minHeight: dimensions.artifactCardHeight }}
          >
            <div className="flex items-start justify-between">
              <span
                className="synelia-kind-chip"
                style={{
                  background: kindColor[a.kind],
                  color: kindText[a.kind],
                }}
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
              <span
                aria-hidden
                className="size-1.5 rounded-full"
                style={{ background: a.projectColor }}
              />
              {a.project}
            </div>
            <div className="mt-auto flex items-center gap-2 font-body text-[10px] text-[var(--text-muted)]">
              <span
                className="flex size-5 items-center justify-center rounded-full font-display text-[9px] font-bold"
                style={{ background: colors.accent, color: "var(--white)" }}
              >
                {a.who.slice(0, 1)}
              </span>
              <span className="font-semibold text-[var(--text-sub)]">
                {a.who}
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
    </div>
  );
}
