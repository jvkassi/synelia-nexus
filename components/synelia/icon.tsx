import {
  BarChart3,
  BrainCircuit,
  Calculator,
  ClipboardCheck,
  Cloud,
  CloudCog,
  FileText,
  GitFork,
  GraduationCap,
  KanbanSquare,
  LayoutGrid,
  Library,
  ListChecks,
  type LucideIcon,
  Lock,
  MessagesSquare,
  Network,
  PenLine,
  Radar,
  ShieldAlert,
  ShieldCheck,
  Table2,
  Users,
} from "lucide-react";

/**
 * Synelia — maps the design's kebab-case Lucide icon names (as stored in
 * the workspace data) to `lucide-react` components. Falls back to a neutral
 * document glyph for unknown names.
 */
const MAP: Record<string, LucideIcon> = {
  "shield-check": ShieldCheck,
  "shield-alert": ShieldAlert,
  cloud: Cloud,
  "cloud-cog": CloudCog,
  lock: Lock,
  "graduation-cap": GraduationCap,
  radar: Radar,
  "list-checks": ListChecks,
  users: Users,
  "bar-chart-3": BarChart3,
  "table-2": Table2,
  "file-text": FileText,
  "layout-grid": LayoutGrid,
  "git-fork": GitFork,
  "messages-square": MessagesSquare,
  network: Network,
  library: Library,
  "clipboard-check": ClipboardCheck,
  "brain-circuit": BrainCircuit,
  "kanban-square": KanbanSquare,
  "pen-line": PenLine,
  calculator: Calculator,
};

export function Icon({
  name,
  className,
  style,
  strokeWidth,
}: {
  name: string;
  className?: string;
  style?: React.CSSProperties;
  strokeWidth?: number;
}) {
  const Cmp = MAP[name] ?? FileText;
  return <Cmp className={className} strokeWidth={strokeWidth} style={style} />;
}
