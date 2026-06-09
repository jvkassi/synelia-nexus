export const dynamic = "force-dynamic";

import { PlusIcon } from "lucide-react";
import { Avatar } from "@/components/synelia/avatar";
import { Icon } from "@/components/synelia/icon";
import { LibraryClient } from "./library-client";
import {
  ensureLoaded,
  PROJECTS,
} from "@/lib/synelia/queries";
import { SYN } from "@/lib/synelia/data";

/**
 * Synelia Cowork — Bibliothèque de prompts.
 * Server component — renders prompt cards with cowork CSS `pcard`/`pc-*` classes.
 * Client search/filter wrapper is `LibraryClient`.
 */
export default async function LibraryPage() {
  await ensureLoaded();

  // Use mock prompts + categories (live DB queries return same shape)
  const prompts = SYN.PROMPTS;
  const cats = SYN.PROMPT_CATS;

  return (
    <div className="lib">
      <div className="dash-kicker">Votre équipe</div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24 }}>
        <div>
          <h1 style={{ margin: "6px 0 0" }}>Bibliothèque de prompts</h1>
          <p style={{ fontSize: 14, color: "var(--color-text-muted)", marginTop: 8 }}>
            {prompts.length} prompts disponibles pour votre équipe
          </p>
        </div>
        <button className="btn btn-primary" type="button">
          <PlusIcon size={14} />
          Nouveau prompt
        </button>
      </div>
      <div className="rule-mag" />

      <LibraryClient prompts={prompts} cats={cats} />
    </div>
  );
}
