"use client";

import { useState } from "react";
import {
  PlayIcon,
  PauseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  BrainIcon,
} from "lucide-react";
import { Icon } from "@/components/synelia/icon";
import type { Routine, Project } from "@/lib/synelia/types";

export function RoutinesClient({
  routines,
  projects,
  initialId,
}: {
  routines: Routine[];
  projects: Project[];
  initialId: string | null;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(
    initialId ?? (routines[0]?.id ?? null)
  );
  const [runIndex, setRunIndex] = useState(0);

  const selected = routines.find((r) => r.id === selectedId) ?? null;

  // Reset run index when switching routines
  function selectRoutine(id: string) {
    setSelectedId(id);
    setRunIndex(0);
  }

  const hasSelection = !!selected;

  return (
    <div className={`tasks-view${hasSelection ? " has-sel" : ""}`}>
      {/* MASTER LIST */}
      <div className="tasks-list">
        <div className="tasks-head">
          <h1>Routines</h1>
          <button className="btn btn-primary btn-sm" type="button">
            <PlusIcon size={14} />
            Nouvelle
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {routines.map((r) => {
            const lastRun = r.runs[r.runs.length - 1];
            return (
              <button
                key={r.id}
                type="button"
                className={`rt-card${selectedId === r.id ? " sel" : ""}`}
                onClick={() => selectRoutine(r.id)}
              >
                <div className="rt-card-top">
                  <div className="rt-card-title">
                    <span className="ic" style={{ color: "var(--color-primary)" }}>
                      <Icon name={r.icon} size={15} />
                    </span>
                    {r.title}
                  </div>
                  <span className={`rt-status${r.status === "paused" ? " paused" : ""}`}>
                    {r.status === "active" ? (
                      <><PlayIcon size={11} /> Active</>
                    ) : (
                      <><PauseIcon size={11} /> En pause</>
                    )}
                  </span>
                </div>
                {lastRun && (
                  <div className="rt-card-run">
                    <span className="rt-dot" aria-hidden />
                    <span className="rt-run-title">{lastRun.title}</span>
                    <span className="rt-ago">{r.ago}</span>
                  </div>
                )}
                {!lastRun && (
                  <div className="rt-card-run" style={{ color: "var(--color-text-muted)" }}>
                    <span style={{ fontSize: 12 }}>Aucune exécution</span>
                    <span className="rt-ago">{r.cadence}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* DETAIL PANEL */}
      <div className="task-detail">
        {!selected ? (
          <div className="td-empty">
            <Icon name="repeat" size={32} />
            <p>Sélectionnez une routine pour voir son détail.</p>
          </div>
        ) : (
          <RoutineDetail
            routine={selected}
            runIndex={runIndex}
            setRunIndex={setRunIndex}
          />
        )}
      </div>
    </div>
  );
}

function RoutineDetail({
  routine,
  runIndex,
  setRunIndex,
}: {
  routine: Routine;
  runIndex: number;
  setRunIndex: (i: number) => void;
}) {
  const runs = routine.runs;
  const currentRun = runs[runIndex] ?? null;
  const totalRuns = runs.length;

  return (
    <>
      {/* HEAD */}
      <div className="td-head">
        <h2>{routine.title}</h2>
        <div className="td-head-actions">
          <button
            className={`btn btn-ghost btn-sm${routine.status === "paused" ? "" : ""}`}
            type="button"
            title={routine.status === "active" ? "Mettre en pause" : "Activer"}
          >
            {routine.status === "active" ? (
              <><PauseIcon size={13} /> Pause</>
            ) : (
              <><PlayIcon size={13} /> Activer</>
            )}
          </button>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="td-controls">
        <span className={`rt-status lg${routine.status === "paused" ? " paused" : ""}`}>
          {routine.status === "active" ? (
            <><PlayIcon size={13} /> Active</>
          ) : (
            <><PauseIcon size={13} /> En pause</>
          )}
        </span>
        <button className="btn btn-ghost btn-sm td-cad" type="button" style={{ marginLeft: "auto" }}>
          <Icon name="repeat" size={13} />
          {routine.cadence}
        </button>
        <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
          Prochaine : <strong>{routine.next}</strong>
        </span>
      </div>

      {/* PROMPT */}
      <div className="td-prompt">{routine.prompt}</div>

      {/* RUN HISTORY */}
      <div className="td-run">
        <div className="td-run-head">
          <div>
            {currentRun ? (
              <>
                <div className="trh-title">{currentRun.title}</div>
                <div className="trh-meta">
                  {currentRun.date} · {currentRun.ranFor}
                </div>
              </>
            ) : (
              <div className="trh-title" style={{ color: "var(--color-text-muted)" }}>
                Aucune exécution enregistrée
              </div>
            )}
          </div>
          {totalRuns > 0 && (
            <div className="trh-nav">
              <button
                className="icon-btn"
                type="button"
                aria-label="Exécution précédente"
                disabled={runIndex >= totalRuns - 1}
                onClick={() => setRunIndex(Math.min(runIndex + 1, totalRuns - 1))}
              >
                <ChevronLeftIcon size={16} />
              </button>
              <span style={{ fontSize: 12, color: "var(--color-text-muted)", padding: "0 4px" }}>
                {runIndex + 1} / {totalRuns}
              </span>
              <button
                className="icon-btn"
                type="button"
                aria-label="Exécution suivante"
                disabled={runIndex <= 0}
                onClick={() => setRunIndex(Math.max(runIndex - 1, 0))}
              >
                <ChevronRightIcon size={16} />
              </button>
            </div>
          )}
        </div>

        {currentRun && (
          <>
            {currentRun.thought > 0 && (
              <div className="trb-thought">
                <BrainIcon size={13} />
                L&apos;IA a réfléchi {currentRun.thought} étapes
              </div>
            )}
            <div
              className="trb-md"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(currentRun.output) }}
            />
          </>
        )}
      </div>
    </>
  );
}

/** Minimal markdown-to-HTML for routine outputs (headings, bold, tables, lists). */
function markdownToHtml(md: string): string {
  return md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .split("\n\n")
    .map((block) => {
      if (block.startsWith("## ")) return `<h2 style="font-size:17px;margin:0 0 10px">${block.slice(3)}</h2>`;
      if (block.startsWith("# ")) return `<h1 style="font-size:20px;margin:0 0 12px">${block.slice(2)}</h1>`;
      // table
      if (block.includes("| ")) {
        const rows = block.split("\n").filter((l) => l.trim().startsWith("|"));
        let html = '<table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:14px">';
        rows.forEach((row, i) => {
          if (row.replace(/[\s|:-]/g, "").length === 0) return; // separator row
          const cells = row.split("|").slice(1, -1);
          const tag = i === 0 ? "th" : "td";
          const style = tag === "th" ? ' style="text-align:left;padding:6px 10px;background:var(--color-primary);color:#fff;font-size:11px"' : ' style="padding:6px 10px;border-bottom:1px solid var(--color-border-soft)"';
          html += `<tr>${cells.map((c) => `<${tag}${style}>${c.trim()}</${tag}>`).join("")}</tr>`;
        });
        html += "</table>";
        return html;
      }
      // unordered list
      if (block.split("\n").every((l) => l.trim().startsWith("- ") || l.trim() === "")) {
        const items = block.split("\n").filter((l) => l.trim().startsWith("- "));
        return `<ul>${items.map((l) => `<li>${inlineMd(l.slice(l.indexOf("- ") + 2))}</li>`).join("")}</ul>`;
      }
      // ordered list
      if (block.split("\n").some((l) => /^\d+\./.test(l.trim()))) {
        const items = block.split("\n").filter((l) => /^\d+\./.test(l.trim()));
        return `<ol>${items.map((l) => `<li>${inlineMd(l.replace(/^\d+\.\s*/, ""))}</li>`).join("")}</ol>`;
      }
      // blockquote
      if (block.startsWith("&gt;")) {
        return `<blockquote style="border-left:3px solid var(--color-accent);padding:6px 12px;margin:0 0 14px;color:var(--color-text-muted);font-size:13px">${inlineMd(block.slice(4).trim())}</blockquote>`;
      }
      return `<p>${inlineMd(block)}</p>`;
    })
    .join("");
}

function inlineMd(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, `<code style="font-size:12px;background:var(--color-bg-alt);padding:1px 5px;border-radius:3px">$1</code>`);
}
