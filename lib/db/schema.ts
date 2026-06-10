import type { InferSelectModel } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  index,
  integer,
  json,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const user = pgTable("User", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  email: varchar("email", { length: 64 }).notNull(),
  password: varchar("password", { length: 64 }),
  name: text("name"),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  isAnonymous: boolean("isAnonymous").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type User = InferSelectModel<typeof user>;

export const workspace = pgTable("Workspace", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  createdBy: uuid("createdBy")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type Workspace = InferSelectModel<typeof workspace>;

export const workspaceMember = pgTable(
  "WorkspaceMember",
  {
    workspaceId: uuid("workspaceId")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    role: varchar("role", { enum: ["owner", "member"] })
      .notNull()
      .default("member"),
    joinedAt: timestamp("joinedAt").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.workspaceId, table.userId] }),
    userIdx: index("WorkspaceMember_userId_idx").on(table.userId),
  })
);

export type WorkspaceMember = InferSelectModel<typeof workspaceMember>;

export const project = pgTable(
  "Project",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    workspaceId: uuid("workspaceId")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    icon: varchar("icon", { length: 64 }),
    color: varchar("color", { length: 32 }),
    visibility: varchar("visibility", {
      enum: ["private", "public_to_workspace"],
    })
      .notNull()
      .default("private"),
    createdBy: uuid("createdBy")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => ({
    workspaceIdx: index("Project_workspaceId_updatedAt_idx").on(
      table.workspaceId,
      table.updatedAt
    ),
  })
);

export type Project = InferSelectModel<typeof project>;

export const projectMember = pgTable(
  "ProjectMember",
  {
    projectId: uuid("projectId")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    addedBy: uuid("addedBy").references(() => user.id),
    addedAt: timestamp("addedAt").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.projectId, table.userId] }),
    userIdx: index("ProjectMember_userId_idx").on(table.userId),
  })
);

export type ProjectMember = InferSelectModel<typeof projectMember>;

export const prompt = pgTable(
  "Prompt",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    workspaceId: uuid("workspaceId")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    body: text("body").notNull(),
    category: varchar("category", { length: 64 }),
    icon: varchar("icon", { length: 64 }),
    authorId: uuid("authorId")
      .notNull()
      .references(() => user.id),
    official: boolean("official").notNull().default(false),
    pinned: boolean("pinned").notNull().default(false),
    uses: integer("uses").notNull().default(0),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => ({
    workspaceIdx: index("Prompt_workspaceId_category_idx").on(
      table.workspaceId,
      table.category
    ),
  })
);

export type Prompt = InferSelectModel<typeof prompt>;

export const routine = pgTable(
  "Routine",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    projectId: uuid("projectId")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    prompt: text("prompt").notNull(),
    icon: varchar("icon", { length: 64 }),
    cadenceCron: varchar("cadenceCron", { length: 64 }).notNull(),
    cadenceLabel: text("cadenceLabel").notNull(),
    status: varchar("status", { enum: ["active", "paused"] })
      .notNull()
      .default("active"),
    nextRunAt: timestamp("nextRunAt"),
    lastRunAt: timestamp("lastRunAt"),
    ownerId: uuid("ownerId")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    projectIdx: index("Routine_projectId_idx").on(table.projectId),
    dueIdx: index("Routine_status_nextRunAt_idx").on(
      table.status,
      table.nextRunAt
    ),
  })
);

export type Routine = InferSelectModel<typeof routine>;

export const routineRun = pgTable(
  "RoutineRun",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    routineId: uuid("routineId")
      .notNull()
      .references(() => routine.id, { onDelete: "cascade" }),
    title: text("title"),
    output: text("output"),
    status: varchar("status", { enum: ["running", "success", "error"] })
      .notNull()
      .default("running"),
    error: text("error"),
    // null = déclenchée par le planificateur
    triggeredBy: uuid("triggeredBy").references(() => user.id),
    startedAt: timestamp("startedAt").notNull().defaultNow(),
    finishedAt: timestamp("finishedAt"),
    durationMs: integer("durationMs"),
  },
  (table) => ({
    routineIdx: index("RoutineRun_routineId_startedAt_idx").on(
      table.routineId,
      table.startedAt
    ),
  })
);

export type RoutineRun = InferSelectModel<typeof routineRun>;

export const projectFile = pgTable(
  "ProjectFile",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    projectId: uuid("projectId")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    contentType: varchar("contentType", { length: 128 }),
    size: integer("size"),
    url: text("url"),
    uploadedBy: uuid("uploadedBy")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    projectIdx: index("ProjectFile_projectId_idx").on(table.projectId),
  })
);

export type ProjectFile = InferSelectModel<typeof projectFile>;

export const chat = pgTable(
  "Chat",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    createdAt: timestamp("createdAt").notNull(),
    title: text("title").notNull(),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    visibility: varchar("visibility", { enum: ["public", "private"] })
      .notNull()
      .default("private"),
    // null = conversation personnelle héritée (hors projet)
    projectId: uuid("projectId").references(() => project.id, {
      onDelete: "cascade",
    }),
    updatedAt: timestamp("updatedAt"),
  },
  (table) => ({
    projectIdx: index("Chat_projectId_updatedAt_idx").on(
      table.projectId,
      table.updatedAt
    ),
  })
);

export type Chat = InferSelectModel<typeof chat>;

export const message = pgTable("Message_v2", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chatId")
    .notNull()
    .references(() => chat.id),
  role: varchar("role").notNull(),
  parts: json("parts").notNull(),
  attachments: json("attachments").notNull(),
  createdAt: timestamp("createdAt").notNull(),
  // null pour l'assistant et les messages hérités
  authorId: uuid("authorId").references(() => user.id),
  // 'steering' = message d'orientation envoyé pendant une génération
  tag: varchar("tag", { length: 32 }),
  isInterrupted: boolean("isInterrupted").notNull().default(false),
});

export type DBMessage = InferSelectModel<typeof message>;

export const vote = pgTable(
  "Vote_v2",
  {
    chatId: uuid("chatId")
      .notNull()
      .references(() => chat.id),
    messageId: uuid("messageId")
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean("isUpvoted").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.chatId, table.messageId] }),
  })
);

export type Vote = InferSelectModel<typeof vote>;

export const document = pgTable(
  "Document",
  {
    id: uuid("id").notNull().defaultRandom(),
    createdAt: timestamp("createdAt").notNull(),
    title: text("title").notNull(),
    content: text("content"),
    kind: varchar("text", { enum: ["text", "code", "image", "sheet"] })
      .notNull()
      .default("text"),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    projectId: uuid("projectId").references(() => project.id, {
      onDelete: "cascade",
    }),
    // conversation d'origine de l'artefact, si créé en conversation
    chatId: uuid("chatId").references(() => chat.id),
    shareScope: varchar("shareScope", {
      enum: ["project", "workspace", "link"],
    })
      .notNull()
      .default("project"),
    shareToken: varchar("shareToken", { length: 32 }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id, table.createdAt] }),
    projectIdx: index("Document_projectId_idx").on(table.projectId),
    shareTokenIdx: uniqueIndex("Document_shareToken_idx").on(
      table.shareToken,
      table.createdAt
    ),
  })
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  "Suggestion",
  {
    id: uuid("id").notNull().defaultRandom(),
    documentId: uuid("documentId").notNull(),
    documentCreatedAt: timestamp("documentCreatedAt").notNull(),
    originalText: text("originalText").notNull(),
    suggestedText: text("suggestedText").notNull(),
    description: text("description"),
    isResolved: boolean("isResolved").notNull().default(false),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  })
);

export type Suggestion = InferSelectModel<typeof suggestion>;

export const stream = pgTable(
  "Stream",
  {
    id: uuid("id").notNull().defaultRandom(),
    chatId: uuid("chatId").notNull(),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    chatRef: foreignKey({
      columns: [table.chatId],
      foreignColumns: [chat.id],
    }),
  })
);

export type Stream = InferSelectModel<typeof stream>;
