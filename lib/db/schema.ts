import type { InferSelectModel } from "drizzle-orm";
import {
  foreignKey,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

/** Generate a v4 UUID for primary keys (SQLite has no native uuid type). */
const uuid = () => crypto.randomUUID();

/* ============================================================
   Synelia Cowork schema — multi-user AI workspace
   ============================================================
   This is the production schema for the Cowork UI. The Vercel-fork
   tables below (User, Chat_v2, Message_v2, Document, Vote_v2,
   Suggestion, Stream) are kept for back-compat with lib/db/queries.ts
   and the auth flow; they will be removed once the Cowork UI fully
   replaces the legacy Vercel chat.
   ============================================================ */

// ===== Identity =====

export const user = sqliteTable("User", {
  id: text("id").primaryKey().notNull().$defaultFn(uuid),
  email: text("email").notNull(),
  password: text("password"),
  name: text("name"),
  emailVerified: integer("emailVerified", { mode: "boolean" })
    .notNull()
    .default(false),
  image: text("image"),
  isAnonymous: integer("isAnonymous", { mode: "boolean" })
    .notNull()
    .default(false),
  /** Synelia Cowork — role inside the team (used by the admin console). */
  role: text("role", { enum: ["owner", "admin", "member"] }).notNull().default("member"),
  /** Free-form title, e.g. "Lead Data & IA" — shown next to the avatar. */
  title: text("title"),
  /** Hex color used for the avatar tile. */
  color: text("color"),
  /** Display initials (2 chars, used in Avatar component). */
  initials: text("initials"),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type User = InferSelectModel<typeof user>;

// ===== Synelia Cowork: Workspaces, Members, Threads, Messages =====

/** A workspace is a shared team space (e.g. "Direction Data & IA").
 *  In the current handoff the app assumes ONE workspace per user, but
 *  the schema is multi-workspace so teams can isolate client projects. */
export const workspace = sqliteTable(
  "Workspace",
  {
    id: text("id").primaryKey().notNull().$defaultFn(uuid),
    name: text("name").notNull(),
    /** URL-safe slug, unique per workspace. */
    slug: text("slug").notNull(),
    description: text("description"),
    /** Lucide icon name (e.g. "shield-check", "cloud", "graduation-cap"). */
    emoji: text("emoji").notNull().default("folder-kanban"),
    /** Hex color used for the project tile (e.g. "#4B2882"). */
    color: text("color").notNull().default("#4B2882"),
    /** Public workspaces are visible to every member of the org (onboarding). */
    isPublic: integer("isPublic", { mode: "boolean" }).notNull().default(false),
    /** Free-form update label, e.g. "maintenant", "il y a 1 h". */
    updated: text("updated").notNull().default("maintenant"),
    createdById: text("createdById").notNull().references(() => user.id),
    createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => ({
    slugIdx: uniqueIndex("Workspace_slug_idx").on(table.slug),
  }),
);

export type Workspace = InferSelectModel<typeof workspace>;

/** A user's membership in a workspace. Composite PK. */
export const workspaceMember = sqliteTable(
  "WorkspaceMember",
  {
    workspaceId: text("workspaceId").notNull().references(() => workspace.id),
    userId: text("userId").notNull().references(() => user.id),
    /** "owner" for the workspace creator, "member" for everyone else. */
    role: text("role", { enum: ["owner", "admin", "member"] }).notNull().default("member"),
    joinedAt: integer("joinedAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.workspaceId, table.userId] }),
  }),
);

export type WorkspaceMember = InferSelectModel<typeof workspaceMember>;

/** A conversation thread inside a workspace. Shared across all members. */
export const thread = sqliteTable(
  "Thread",
  {
    id: text("id").primaryKey().notNull().$defaultFn(uuid),
    workspaceId: text("workspaceId").notNull().references(() => workspace.id),
    title: text("title").notNull(),
    /** Lucide icon for the thread (matches the chat's purpose). */
    icon: text("icon"),
    /** Free-form preview shown in the chat list. */
    preview: text("preview"),
    /** Last user who sent a message. */
    lastById: text("lastById").references(() => user.id),
    /** Free-form update label, e.g. "maintenant", "il y a 35 min". */
    updated: text("updated").notNull().default("maintenant"),
    /** Pinned to the top of the chat list. */
    pinned: integer("pinned", { mode: "boolean" }).notNull().default(false),
    /** Live state — null if idle. "ai-typing" / "user-typing" matches the handoff. */
    liveState: text("liveState", { enum: ["ai-typing", "user-typing"] }),
    liveUserId: text("liveUserId").references(() => user.id),
    createdById: text("createdById").notNull().references(() => user.id),
    createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => ({
    workspaceIdx: index("Thread_workspace_idx").on(table.workspaceId),
  }),
);

export type Thread = InferSelectModel<typeof thread>;

/** A many-to-many link of users to threads (participants). */
export const threadParticipant = sqliteTable(
  "ThreadParticipant",
  {
    threadId: text("threadId").notNull().references(() => thread.id),
    userId: text("userId").notNull().references(() => user.id),
    joinedAt: integer("joinedAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.threadId, table.userId] }),
  }),
);

export type ThreadParticipant = InferSelectModel<typeof threadParticipant>;

/** A message in a thread. AI SDK v6 `parts` (JSON) and `attachments` (JSON). */
export const message = sqliteTable(
  "Message_v2",
  {
    id: text("id").primaryKey().notNull().$defaultFn(uuid),
    threadId: text("threadId").notNull().references(() => thread.id),
    /** The user who authored the message (assistant msgs have the triggering userId too). */
    userId: text("userId").notNull().references(() => user.id),
    /** "user" | "assistant" | "system". */
    role: text("role", { enum: ["user", "assistant", "system"] }).notNull(),
    /** Plain markdown for display (denormalized from parts[].text for fast read). */
    text: text("text").notNull(),
    /** Free-form "10:02", "10:05" — when the message was sent. */
    at: text("at").notNull(),
    /** AI SDK v6 parts as JSON — used for streaming re-render. */
    parts: text("parts", { mode: "json" }).notNull().$type<unknown[]>(),
    /** Attachments (file name + icon). */
    attachments: text("attachments", { mode: "json" }).notNull().$type<{ name: string; icon: string }[]>().default([]),
    /** Flag: this message was the user steering the AI mid-stream. */
    isSteer: integer("isSteer", { mode: "boolean" }).notNull().default(false),
    /** Flag: this message was interrupted (the AI was cut off by a steer). */
    isInterrupted: integer("isInterrupted", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => ({
    threadIdx: index("Message_thread_idx").on(table.threadId, table.createdAt),
  }),
);

export type DBMessage = InferSelectModel<typeof message>;

/* ============================================================
   Synelia Cowork: Artifacts, Routines, Prompts
   ============================================================ */

/** An artifact produced by the AI inside a thread. Shown in the project's
 *  Artefacts tab, the global Artefacts gallery, and the in-chat viewer. */
export const artifact = sqliteTable(
  "Artifact",
  {
    id: text("id").primaryKey().notNull().$defaultFn(uuid),
    workspaceId: text("workspaceId").notNull().references(() => workspace.id),
    threadId: text("threadId").references(() => thread.id),
    createdById: text("createdById").notNull().references(() => user.id),
    title: text("title").notNull(),
    /** Synelia Cowork kinds: "Document" | "Tableur" | "Diagramme". */
    kind: text("kind", { enum: ["Document", "Tableur", "Diagramme"] }).notNull().default("Document"),
    /** Lucide icon name. */
    icon: text("icon").notNull().default("file-text"),
    /** Markdown body of the artifact. */
    content: text("content").notNull().default(""),
    /** Free-form timestamp label, e.g. "maintenant", "il y a 2 h". */
    when: text("when").notNull().default("maintenant"),
    /** Flag: artifact is currently being built (live ticker). */
    live: integer("live", { mode: "boolean" }).notNull().default(false),
    /** Flag: shared by a public link (`/a/<id>-<slug>`). */
    shared: integer("shared", { mode: "boolean" }).notNull().default(false),
    /** Slug for the share-by-link URL. */
    publicSlug: text("publicSlug"),
    createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => ({
    workspaceIdx: index("Artifact_workspace_idx").on(table.workspaceId),
  }),
);

export type Artifact = InferSelectModel<typeof artifact>;

/** A routine = a recurring task the AI runs on a cadence (the r1..r6 in the mock). */
export const routine = sqliteTable(
  "Routine",
  {
    id: text("id").primaryKey().notNull().$defaultFn(uuid),
    workspaceId: text("workspaceId").notNull().references(() => workspace.id),
    title: text("title").notNull(),
    /** Free-form cadence label, e.g. "Chaque lundi · 08:00". */
    cadence: text("cadence").notNull(),
    ownerId: text("ownerId").notNull().references(() => user.id),
    /** Free-form next-run label, e.g. "Lun. 9 juin". */
    next: text("next").notNull().default(""),
    /** Lucide icon. */
    icon: text("icon").notNull().default("repeat"),
    status: text("status", { enum: ["active", "paused"] }).notNull().default("active"),
    /** Free-form "il y a 2 j" / "il y a 6 h" label. */
    ago: text("ago").notNull().default("maintenant"),
    /** The prompt given to the AI on each run. */
    prompt: text("prompt").notNull(),
    createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => ({
    workspaceIdx: index("Routine_workspace_idx").on(table.workspaceId),
  }),
);

export type Routine = InferSelectModel<typeof routine>;

/** A single execution of a routine (the r1.runs[] in the mock). */
export const routineRun = sqliteTable(
  "RoutineRun",
  {
    id: text("id").primaryKey().notNull().$defaultFn(uuid),
    routineId: text("routineId").notNull().references(() => routine.id),
    title: text("title").notNull(),
    /** Free-form date label, e.g. "Lun. 2 juin 2026". */
    date: text("date").notNull(),
    /** Free-form duration label, e.g. "8,4 s". */
    ranFor: text("ranFor").notNull(),
    /** Thought seconds (for the master-detail "Réflexion · N s" label). */
    thought: integer("thought").notNull().default(0),
    /** The markdown output of the run. */
    output: text("output").notNull(),
    createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => ({
    routineIdx: index("RoutineRun_routine_idx").on(table.routineId, table.createdAt),
  }),
);

export type RoutineRun = InferSelectModel<typeof routineRun>;

/** The department-wide prompt library (12 prompts in 6 categories in the mock). */
export const promptCategory = sqliteTable("PromptCategory", {
  id: text("id").primaryKey(),
  label: text("label").notNull(),
  /** Lucide icon. */
  icon: text("icon").notNull().default("library"),
  /** Hex color used for the category chip. */
  color: text("color"),
});

export type PromptCategory = InferSelectModel<typeof promptCategory>;

/** A single shared prompt in the library. */
export const prompt = sqliteTable(
  "Prompt",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    categoryId: text("categoryId").notNull().references(() => promptCategory.id),
    /** Lucide icon. */
    icon: text("icon").notNull().default("library"),
    authorId: text("authorId").notNull().references(() => user.id),
    uses: integer("uses").notNull().default(0),
    pinned: integer("pinned", { mode: "boolean" }).notNull().default(false),
    official: integer("official", { mode: "boolean" }).notNull().default(false),
    /** Short description. */
    desc: text("desc").notNull(),
    /** The full prompt body. */
    body: text("body").notNull(),
    createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => ({
    catIdx: index("Prompt_cat_idx").on(table.categoryId),
  }),
);

export type Prompt = InferSelectModel<typeof prompt>;

/* ============================================================
   Synelia Cowork: Scheduled tasks (worker, Redis ZSET in prod)
   ============================================================ */

/** A scheduled task. The worker polls this table (or a Redis ZSET in
 *  production) and runs the prompt at `runAt`. */
export const scheduledTask = sqliteTable(
  "ScheduledTask",
  {
    id: text("id").primaryKey().notNull().$defaultFn(uuid),
    workspaceId: text("workspaceId").notNull().references(() => workspace.id),
    threadId: text("threadId").references(() => thread.id),
    routineId: text("routineId").references(() => routine.id),
    /** The user who scheduled the task. */
    scheduledById: text("scheduledById").notNull().references(() => user.id),
    /** The prompt body to run. */
    prompt: text("prompt").notNull(),
    /** When the task should run. */
    runAt: integer("runAt", { mode: "timestamp_ms" }).notNull(),
    status: text("status", { enum: ["pending", "running", "done", "failed", "cancelled"] }).notNull().default("pending"),
    /** The assistant message created when the task ran (links to Message_v2). */
    resultMessageId: text("resultMessageId").references(() => message.id),
    /** Optional error message. */
    error: text("error"),
    createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => ({
    statusIdx: index("ScheduledTask_status_idx").on(table.status, table.runAt),
  }),
);

export type ScheduledTask = InferSelectModel<typeof scheduledTask>;

/* ============================================================
   Legacy Vercel-fork tables (kept for queries.ts back-compat)
   ============================================================ */

export const chat = sqliteTable("Chat", {
  id: text("id").primaryKey().notNull().$defaultFn(uuid),
  createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull(),
  title: text("title").notNull(),
  userId: text("userId").notNull().references(() => user.id),
  visibility: text("visibility", { enum: ["public", "private"] }).notNull().default("private"),
});

export const vote = sqliteTable(
  "Vote_v2",
  {
    chatId: text("chatId").notNull().references(() => chat.id),
    messageId: text("messageId").notNull().references(() => message.id),
    isUpvoted: integer("isUpvoted", { mode: "boolean" }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.chatId, table.messageId] }),
  }),
);

export const document = sqliteTable(
  "Document",
  {
    id: text("id").notNull().$defaultFn(uuid),
    createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull(),
    title: text("title").notNull(),
    content: text("content"),
    kind: text("text", { enum: ["text", "code", "image", "sheet"] }).notNull().default("text"),
    userId: text("userId").notNull().references(() => user.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id, table.createdAt] }),
  }),
);

export const suggestion = sqliteTable(
  "Suggestion",
  {
    id: text("id").notNull().$defaultFn(uuid),
    documentId: text("documentId").notNull(),
    documentCreatedAt: integer("documentCreatedAt", { mode: "timestamp_ms" }).notNull(),
    originalText: text("originalText").notNull(),
    suggestedText: text("suggestedText").notNull(),
    description: text("description"),
    isResolved: integer("isResolved", { mode: "boolean" }).notNull().default(false),
    userId: text("userId").notNull().references(() => user.id),
    createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  }),
);

export const stream = sqliteTable(
  "Stream",
  {
    id: text("id").notNull().$defaultFn(uuid),
    chatId: text("chatId").notNull(),
    createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    chatRef: foreignKey({ columns: [table.chatId], foreignColumns: [chat.id] }),
  }),
);
