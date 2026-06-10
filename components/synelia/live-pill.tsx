import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* Synelia — pastille « En direct » (point magenta pulsant) */

export function LivePill({
  children = "En direct",
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-magenta/10 px-2.5 py-[3px] font-semibold text-[11.5px] text-magenta",
        className
      )}
      style={{ fontFamily: "var(--font-display)" }}
    >
      <span className="live-pill-dot size-[7px] rounded-full bg-magenta" />
      {children}
    </span>
  );
}
