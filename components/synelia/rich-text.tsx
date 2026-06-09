import React from "react";

/**
 * Minimal markdown renderer for chat replies and routine run outputs.
 * Supports:
 *   - `**bold**`
 *   - numbered lists (lines starting with "1. ", "2. ", …)
 *   - unordered lists (lines starting with "- ")
 *   - paragraphs (blocks separated by blank lines)
 *
 * Two flavours:
 *   - `renderRich(text)` — chat.jsx version (bold + ordered lists + paragraphs)
 *   - `rtMd(text)`      — dashboard.jsx version (bold + ordered + unordered + paragraphs)
 */

function inline(s: string): React.ReactNode {
  const parts = s.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**")
      ? <strong key={i}>{p.slice(2, -2)}</strong>
      : <React.Fragment key={i}>{p}</React.Fragment>
  );
}

/** Chat-style: bold + ordered lists + paragraphs. */
export function renderRich(text: string): React.ReactNode {
  const blocks = text.split("\n\n");
  return blocks.map((blk, bi) => {
    const lines = blk.split("\n");
    const isOl = lines.every((l) => /^\d+\.\s/.test(l.trim())) && lines.length > 1;
    if (isOl) {
      return (
        <ol key={bi}>
          {lines.map((l, li) => <li key={li}>{inline(l.replace(/^\d+\.\s/, ""))}</li>)}
        </ol>
      );
    }
    return <p key={bi}>{inline(blk)}</p>;
  });
}

/** Routines-style: bold + ordered + unordered + paragraphs. */
export function rtMd(text: string): React.ReactNode {
  const blocks = text.split("\n\n");
  return blocks.map((blk, bi) => {
    const lines = blk.split("\n");
    const isOl = lines.every((l) => /^\d+\.\s/.test(l.trim())) && lines.length > 1;
    if (isOl) {
      return (
        <ol key={bi}>
          {lines.map((l, li) => <li key={li}>{inline(l.replace(/^\d+\.\s/, ""))}</li>)}
        </ol>
      );
    }
    const isUl = lines.every((l) => /^-\s/.test(l.trim())) && lines.length > 1;
    if (isUl) {
      return (
        <ul key={bi}>
          {lines.map((l, li) => <li key={li}>{inline(l.replace(/^-\s/, ""))}</li>)}
        </ul>
      );
    }
    return <p key={bi}>{inline(blk)}</p>;
  });
}
