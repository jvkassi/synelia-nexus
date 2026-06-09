import { cn } from "@/lib/utils";

/**
 * Synelia signature element — the 56×3 px magenta rule that sits under
 * every H1, H2, and section title on a content surface. See DESIGN.md.
 */
export function SyneliaRule({ className }: { className?: string }) {
  return <hr className={cn("synelia-rule", className)} aria-hidden="true" />;
}
