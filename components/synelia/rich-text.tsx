import { Fragment } from "react";

/**
 * Synelia — minimal renderer for the lightweight markdown used throughout
 * the workspace data (routine outputs, thread messages, the live AI reply).
 * Supports: paragraphs (blank-line separated), `**bold**`, numbered lists
 * (`1.`) and bullet lists (`- `). Not a full markdown engine — just enough
 * for the canned content.
 */
function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong className="font-semibold text-[var(--foreground)]" key={`${keyPrefix}-${i}`}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <Fragment key={`${keyPrefix}-${i}`}>{part}</Fragment>;
  });
}

export function RichText({ text, className }: { text: string; className?: string }) {
  const blocks = text.trim().split(/\n\n+/);

  return (
    <div
      className={`flex flex-col gap-3 font-body text-[14px] leading-relaxed text-[var(--text-sub)] ${className ?? ""}`}
    >
      {blocks.map((block, bi) => {
        const lines = block.split("\n");
        const isOrdered = lines.every((l) => /^\d+\.\s/.test(l.trim()));
        const isBullet = lines.every((l) => /^[-•]\s/.test(l.trim()));

        if (isOrdered) {
          return (
            <ol className="ml-5 flex list-decimal flex-col gap-1.5" key={bi}>
              {lines.map((l, li) => (
                <li key={li}>{renderInline(l.replace(/^\d+\.\s/, ""), `${bi}-${li}`)}</li>
              ))}
            </ol>
          );
        }
        if (isBullet) {
          return (
            <ul className="ml-5 flex list-disc flex-col gap-1.5" key={bi}>
              {lines.map((l, li) => (
                <li key={li}>{renderInline(l.replace(/^[-•]\s/, ""), `${bi}-${li}`)}</li>
              ))}
            </ul>
          );
        }
        return <p key={bi}>{renderInline(block, `${bi}`)}</p>;
      })}
    </div>
  );
}
