import { getMember } from "@/lib/synelia/data";

/** A single round initials avatar for a team member id. */
export function Avatar({
  id,
  size = 28,
  className,
}: {
  id: string;
  size?: number;
  className?: string;
}) {
  const m = getMember(id);
  const initials = m?.initials ?? id.slice(0, 2).toUpperCase();
  const color = m?.color ?? "var(--primary-mid)";
  return (
    <span
      className={`synelia-avatar ${className ?? ""}`}
      style={{
        background: color,
        width: size,
        height: size,
        fontSize: Math.round(size * 0.36),
      }}
      title={m?.name ?? id}
    >
      {initials}
    </span>
  );
}

/** Overlapped stack of avatars + "+N" overflow chip. */
export function AvatarStack({
  ids,
  max = 4,
  size = 28,
}: {
  ids: string[];
  max?: number;
  size?: number;
}) {
  const shown = ids.slice(0, max);
  const extra = ids.length - shown.length;
  return (
    <span className="synelia-avatar-stack">
      {shown.map((id) => (
        <Avatar id={id} key={id} size={size} />
      ))}
      {extra > 0 && (
        <span
          className="synelia-avatar"
          style={{
            background: "var(--primary-mid)",
            width: size,
            height: size,
            fontSize: Math.round(size * 0.34),
          }}
        >
          +{extra}
        </span>
      )}
    </span>
  );
}
