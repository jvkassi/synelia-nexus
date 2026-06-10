/* Synelia Cowork — primitives partagées (Icon, Avatar, présence) */

const { useState, useEffect, useRef, useCallback, useMemo } = React;

// ---- Icon : utilise Lucide UMD de façon sûre avec React (createElement impératif) ----
function Icon({ name, size = 20, color, strokeWidth = 1.75, className = "", style = {} }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.lucide) return;
    const pascal = name.split(/[-_]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join("");
    const node = window.lucide[pascal] || window.lucide.icons?.[pascal];
    el.innerHTML = "";
    try {
      if (node && window.lucide.createElement) {
        const svg = window.lucide.createElement(node);
        svg.setAttribute("width", size);
        svg.setAttribute("height", size);
        svg.setAttribute("stroke-width", strokeWidth);
        el.appendChild(svg);
      } else {
        // fallback : laisser Lucide scanner ce noeud
        const i = document.createElement("i");
        i.setAttribute("data-lucide", name);
        el.appendChild(i);
        window.lucide.createIcons && window.lucide.createIcons();
      }
    } catch (e) { /* noop */ }
  }, [name, size, strokeWidth]);
  return <span ref={ref} className={"ic " + className} style={{ width: size, height: size, color, ...style }} aria-hidden="true"></span>;
}

// ---- Avatar ----
function Avatar({ user, size = 30, showOnline = false, square = false, ring }) {
  const u = typeof user === "string" ? SYN.TEAM[user] : user;
  if (!u) return null;
  const fs = Math.round(size * 0.4);
  return (
    <span className={"av" + (square ? " sq" : "")} style={{ width: size, height: size, background: u.color, fontSize: fs, boxShadow: ring ? `0 0 0 2px ${ring}` : undefined }} title={u.name}>
      {u.initials}
    </span>
  );
}

// ---- Pile d'avatars ----
function AvatarStack({ ids, size = 26, max = 4, dark = false }) {
  const shown = ids.slice(0, max);
  const extra = ids.length - shown.length;
  return (
    <span className="pr-stack" style={{ display: "inline-flex" }}>
      {shown.map(id => (
        <span key={id} className="av" style={{ width: size, height: size, marginLeft: -size * 0.28, fontSize: size * 0.4, background: SYN.TEAM[id].color, boxShadow: `0 0 0 2px ${dark ? "var(--color-primary-dark)" : "#fff"}` }} title={SYN.TEAM[id].name}>
          {SYN.TEAM[id].initials}
        </span>
      ))}
      {extra > 0 && <span className="pr-more">+{extra}</span>}
    </span>
  );
}

// ---- Badge live ----
function LivePill({ children = "En direct" }) {
  return <span className="pill pill-live"><span className="d"></span>{children}</span>;
}

window.Icon = Icon;
window.Avatar = Avatar;
window.AvatarStack = AvatarStack;
window.LivePill = LivePill;
