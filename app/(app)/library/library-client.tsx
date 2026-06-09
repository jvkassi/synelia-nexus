"use client";

import { useState } from "react";
import { SearchIcon, XIcon, StarIcon, BadgeCheckIcon } from "lucide-react";
import { Avatar } from "@/components/synelia/avatar";
import { Icon } from "@/components/synelia/icon";
import { useModal } from "@/components/synelia/modal-context";
import type { Prompt, PromptCategory } from "@/lib/synelia/types";

export function LibraryClient({
  prompts,
  cats,
}: {
  prompts: Prompt[];
  cats: PromptCategory[];
}) {
  const { openModal } = useModal();
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("all");

  const filtered = prompts.filter((p) => {
    const matchCat = activeCat === "all" || p.cat === activeCat;
    const q = query.toLowerCase();
    const matchQ = !q || p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  const pinned = filtered.filter((p) => p.pinned);
  const rest = filtered.filter((p) => !p.pinned);

  return (
    <div className="lib-toolbar">
      {/* SEARCH */}
      <div className="lib-search">
        <SearchIcon size={15} style={{ flex: "none" }} />
        <input
          type="text"
          placeholder="Rechercher un prompt…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            className="clr"
            type="button"
            aria-label="Effacer"
            onClick={() => setQuery("")}
          >
            <XIcon size={13} />
          </button>
        )}
      </div>

      {/* CATEGORY CHIPS */}
      <div className="lib-cats">
        {cats.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`lib-cat${activeCat === c.id ? " on" : ""}`}
            onClick={() => setActiveCat(c.id)}
          >
            <Icon name={c.icon} size={13} />
            {c.label}
            <span className="n">{c.count ?? 0}</span>
          </button>
        ))}
      </div>

      {/* PINNED SECTION */}
      {pinned.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <div className="lib-secthead">
            <StarIcon size={13} />
            Épinglés
          </div>
          <div className="prompt-grid">
            {pinned.map((p) => (
              <PromptCard key={p.id} prompt={p} onUse={() => openModal("use-prompt", { id: p.id, title: p.title, body: p.body })} />
            ))}
          </div>
        </div>
      )}

      {/* ALL / REST */}
      {rest.length > 0 && (
        <div style={{ marginTop: pinned.length > 0 ? 32 : 28 }}>
          {pinned.length > 0 && (
            <div className="lib-secthead">
              <Icon name="library" size={13} />
              Tous les prompts
            </div>
          )}
          <div className="prompt-grid">
            {rest.map((p) => (
              <PromptCard key={p.id} prompt={p} onUse={() => openModal("use-prompt", { id: p.id, title: p.title, body: p.body })} />
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="empty" style={{ marginTop: 40 }}>
          Aucun prompt ne correspond à votre recherche.
        </div>
      )}
    </div>
  );
}

function PromptCard({ prompt: p, onUse }: { prompt: Prompt; onUse: () => void }) {
  return (
    <div className="prompt-card">
      <div className="pc-top">
        <span className="pc-ic">
          <Icon name={p.icon} size={18} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="pc-title">{p.title}</div>
          <div className="pc-cat">
            <Icon name="tag" size={11} />
            {p.cat}
          </div>
        </div>
        {p.official && (
          <span className="pc-badge">
            <BadgeCheckIcon size={11} />
            Officiel
          </span>
        )}
      </div>

      <p className="pc-desc">{p.desc}</p>
      <div className="pc-body">{p.body.slice(0, 160)}{p.body.length > 160 ? "…" : ""}</div>

      <div className="pc-foot">
        <span className="pc-author">
          <Avatar id={p.author} size={20} />
        </span>
        <span className="pc-uses">
          <Icon name="users" size={12} />
          {p.uses} utilisations
        </span>
        <button
          type="button"
          className="pc-act use"
          style={{ marginLeft: "auto" }}
          onClick={onUse}
        >
          Utiliser
        </button>
      </div>
    </div>
  );
}
