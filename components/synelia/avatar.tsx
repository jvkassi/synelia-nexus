import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/* Synelia — avatars à initiales (primitives partagées) */

export type SynUser = {
  id: string;
  name: string;
  color?: string | null;
};

export const AVATAR_COLORS = [
  "#4B2882",
  "#6B3FA0",
  "#C0297A",
  "#2D1557",
  "#00AEEF",
  "#FF6B35",
  "#00C48C",
];

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

export function colorFor(seed: string): string {
  let hash = 0;
  for (const char of seed) {
    hash = char.charCodeAt(0) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function SynAvatar({
  user,
  size = 30,
  square = false,
  ringColor,
  className,
  style,
}: {
  user: SynUser;
  size?: number;
  square?: boolean;
  ringColor?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={cn(
        "relative grid flex-none select-none place-items-center font-semibold text-white",
        className
      )}
      style={{
        width: size,
        height: size,
        borderRadius: square ? 7 : "50%",
        background: user.color ?? colorFor(user.id || user.name),
        fontSize: Math.round(size * 0.4),
        fontFamily: "var(--font-display)",
        boxShadow: ringColor ? `0 0 0 2px ${ringColor}` : undefined,
        ...style,
      }}
      title={user.name}
    >
      {getInitials(user.name)}
    </span>
  );
}

export function SynAvatarStack({
  users,
  size = 26,
  max = 4,
  ringColor = "#fff",
  className,
}: {
  users: SynUser[];
  size?: number;
  max?: number;
  ringColor?: string;
  className?: string;
}) {
  const shown = users.slice(0, max);
  const extra = users.length - shown.length;

  return (
    <span className={cn("inline-flex items-center", className)}>
      {shown.map((member, index) => (
        <SynAvatar
          key={member.id}
          ringColor={ringColor}
          size={size}
          style={{ marginLeft: index === 0 ? 0 : -size * 0.28 }}
          user={member}
        />
      ))}
      {extra > 0 && (
        <span className="ml-1 text-[11px] text-muted-foreground">+{extra}</span>
      )}
    </span>
  );
}
