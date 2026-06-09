import { getMember, type TeamMember as TeamMemberType, type UserId } from "@/lib/synelia/data";

export type AvatarUser = string | UserId | TeamMemberType;

/** Single round initials avatar — accepts a user id string OR a TeamMember object. */
export function Avatar({
  user, id, size = 30, showOnline = false, square = false, ring,
}: { user?: AvatarUser; id?: string; size?: number; showOnline?: boolean; square?: boolean; ring?: string }) {
  const resolved = user ?? id;
  if (!resolved) return null;
  const u = typeof resolved === "object" ? resolved : getMember(resolved);
  if (!u) return null;
  const fs = Math.round(size * 0.4);
  return (
    <span
      className={"av" + (square ? " sq" : "")}
      style={{
        width: size, height: size, background: u.color, fontSize: fs,
        boxShadow: ring ? `0 0 0 2px ${ring}` : undefined,
      }}
      title={u.name}
    >
      {u.initials}
      {showOnline && u.online && <span className="online-dot" />}
    </span>
  );
}

/** Overlapped stack of avatars + "+N" overflow chip. */
export function AvatarStack({
  ids, size = 26, max = 4, dark = false,
}: { ids: string[]; size?: number; max?: number; dark?: boolean }) {
  const shown = ids.slice(0, max);
  const extra = ids.length - shown.length;
  return (
    <span className="pr-stack" style={{ display: "inline-flex" }}>
      {shown.map((id) => (
        <Avatar key={id} user={id} size={size} ring={dark ? "var(--color-primary-dark)" : "#fff"} />
      ))}
      {extra > 0 && <span className="pr-more">+{extra}</span>}
    </span>
  );
}

/** Magenta "En direct" pill with a pulsing dot — used on chat lists and project cards. */
export function LivePill({ children = "En direct", style }: { children?: React.ReactNode; style?: React.CSSProperties }) {
  return <span className="pill pill-live" style={style}><span className="d" />{children}</span>;
}

// Local type so this file doesn't need an import alias
type TeamMember = TeamMemberType;
