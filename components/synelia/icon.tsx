import {
  ArrowUpRight, BadgeCheck, BarChart3, Bell, BookOpen, BrainCircuit, Calculator,
  Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown,
  ClipboardCheck, Cloud, CloudCog, Copy, CornerDownRight, FilePlus, FileText,
  Folder, FolderPlus, GitFork, Globe, GraduationCap, KanbanSquare, LayoutDashboard,
  LayoutGrid, Library, Link, ListChecks, Lock, type LucideIcon, MessageSquare,
  MessageSquareDot, Menu, MessagesSquare, Network, Paperclip, PenLine, Plus,
  Radar, Repeat, Search, Send, Settings, Share2, ShieldAlert, ShieldCheck,
  SquarePen, StopCircle, Table2, Tag, UserPlus, Users, X, Eye, EyeOff,
} from "lucide-react";

/**
 * Synelia — maps kebab-case Lucide icon names (as stored in workspace data
 * and the handoff's data.js) to lucide-react components. Falls back to a
 * neutral document glyph for unknown names. Add new icons here as the
 * handoff uses them.
 */
const MAP: Record<string, LucideIcon> = {
  // Sidebar / nav
  "layout-dashboard": LayoutDashboard,
  library: Library, "layout-grid": LayoutGrid, repeat: Repeat,
  // Topbar
  search: Search, bell: Bell, "user-plus": UserPlus, menu: Menu,
  // Header
  settings: Settings, "chevron-right": ChevronRight, "chevron-left": ChevronLeft,
  "chevron-down": ChevronDown, "chevrons-up-down": ChevronsUpDown,
  // Form / actions
  plus: Plus, x: X, check: Check, "check-circle-2": CheckCircle2, send: Send,
  "stop-circle": StopCircle, "square-pen": SquarePen, "file-plus": FilePlus,
  "folder-plus": FolderPlus, eye: Eye, "eye-off": EyeOff, copy: Copy,
  // Library
  "badge-check": BadgeCheck, "arrow-up-right": ArrowUpRight,
  "corner-down-right": CornerDownRight, link: Link, tag: Tag,
  // Project / artifact
  "folder-kanban": BookOpen, folder: Folder, "shield-check": ShieldCheck,
  "shield-alert": ShieldAlert, cloud: Cloud, "cloud-cog": CloudCog,
  lock: Lock, "graduation-cap": GraduationCap, radar: Radar,
  "list-checks": ListChecks, users: Users, "bar-chart-3": BarChart3,
  "table-2": Table2, "file-text": FileText, "git-fork": GitFork,
  "messages-square": MessagesSquare, network: Network,
  "clipboard-check": ClipboardCheck, "brain-circuit": BrainCircuit,
  "kanban-square": KanbanSquare, "pen-line": PenLine, calculator: Calculator,
  "message-square": MessageSquare, "message-square-dot": MessageSquareDot,
  paperclip: Paperclip, share: Share2, globe: Globe,
};

export function Icon({
  name, className, style, strokeWidth, size,
}: {
  name: string;
  className?: string;
  style?: React.CSSProperties;
  strokeWidth?: number;
  size?: number;
}) {
  const Cmp = MAP[name] ?? FileText;
  return <Cmp className={className} strokeWidth={strokeWidth ?? 1.75} style={style} size={size} />;
}
