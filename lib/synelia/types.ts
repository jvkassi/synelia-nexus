// lib/synelia/types.ts
// Synelia Cowork — data types, ported from the handoff's data.js + rightpanel.jsx
// Source: Claude cowork-handoff.zip (2026-06-09)

export type ProjectId = "coris" | "cnps" | "oneci" | "academy";
export type ChatId =
  | "c-synthese" | "c-remediation" | "c-entretiens"
  | "c-conformite" | "c-archi" | "c-budget";
export type RoutineId = "r1" | "r2" | "r3" | "r4" | "r5" | "r6";
export type UserId = "awa" | "kofi" | "fatou" | "yao" | "mariam" | "ibrahim";

export type ArtifactKind = "Document" | "Tableur" | "Diagramme";
export type RoutineStatus = "active" | "paused";
export type ChatLiveState = "ai-typing" | "user-typing";
export type RiskLevel = "crit" | "high" | "med" | "low";
export type Role = "Propriétaire" | "Membre";

export interface TeamMember {
  id: UserId;
  name: string;
  initials: string;
  color: string;
  role: Role;
  title: string;
  online: boolean;
  last?: string;
  you?: boolean;
}

export interface Project {
  id: ProjectId;
  name: string;
  emoji: string; // lucide icon name
  color: string;
  desc: string;
  members: UserId[];
  updated: string;
  chats: number;
  files: number;
  routines: number;
  artifacts: number;
  public: boolean;
}

export interface ChatMessage {
  id: string;
  author: UserId | "ai";
  role: "user" | "assistant" | "system";
  at: string;
  text: string;
  attachments?: { name: string; icon: string }[];
}

export interface Chat {
  id: ChatId;
  title: string;
  project: ProjectId;
  lastBy: UserId;
  preview: string;
  updated: string;
  live: boolean;
  liveUser?: UserId;
  liveState?: ChatLiveState;
  participants: UserId[];
  pinned?: boolean;
}

/** CHATS is keyed by project; projects without chats (cnps, oneci, academy in the mock) get an empty array. */
export type ChatsByProject = Record<ProjectId, Chat[]>;

export interface RoutineRun {
  title: string;
  date: string;
  ranFor: string;
  thought: number;
  output: string; // markdown
}

export interface Routine {
  id: RoutineId;
  title: string;
  cadence: string;
  owner: UserId;
  next: string;
  project: ProjectId;
  icon: string;
  status: RoutineStatus;
  ago: string;
  prompt: string;
  runs: RoutineRun[];
}

export interface ProjectFile {
  id: string;
  name: string;
  type: "sheet" | "pdf" | "doc";
  size: string;
  by: UserId;
  when: string;
  icon: string;
}

export interface Artifact {
  id: string;
  title: string;
  kind: ArtifactKind;
  icon: string;
  creator: UserId;
  when: string;
  project: ProjectId;
  chat?: ChatId;
  live?: boolean;
  shared?: boolean;
}

export interface Activity {
  id: string;
  user: UserId;
  verb: string;
  target: string;
  project: string;
  when: string;
  live?: boolean;
}

export interface RiskRow {
  c: string; // constats (finding)
  fam: string; // famille
  cote: string; // cotation
  lvl: RiskLevel;
  owner: string;
}

export interface PromptCategory {
  id: string;
  label: string;
  icon: string;
}

export interface Prompt {
  id: string;
  title: string;
  cat: string; // cat id (not all)
  icon: string;
  author: UserId;
  uses: number;
  pinned?: boolean;
  official?: boolean;
  desc: string;
  body: string;
}

export interface SyneliaData {
  TEAM: Record<UserId, TeamMember>;
  ME: TeamMember;
  PROJECTS: Project[];
  CHATS: Record<ProjectId, Chat[]>;
  ROUTINES: Routine[];
  FILES: ProjectFile[];
  ARTIFACTS: Artifact[];
  ACTIVITY: Activity[];
  THREAD_SYNTHESE: ChatMessage[];
  LIVE_AI_REPLY: string;
  RISK_ROWS: RiskRow[];
  PROMPT_CATS: PromptCategory[];
  PROMPTS: Prompt[];
}
