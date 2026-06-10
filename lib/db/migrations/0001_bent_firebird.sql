CREATE TABLE IF NOT EXISTS "Project" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspaceId" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" varchar(64),
	"color" varchar(32),
	"visibility" varchar DEFAULT 'private' NOT NULL,
	"createdBy" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ProjectFile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"projectId" uuid NOT NULL,
	"name" text NOT NULL,
	"contentType" varchar(128),
	"size" integer,
	"url" text,
	"uploadedBy" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ProjectMember" (
	"projectId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"addedBy" uuid,
	"addedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ProjectMember_projectId_userId_pk" PRIMARY KEY("projectId","userId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Prompt" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspaceId" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"body" text NOT NULL,
	"category" varchar(64),
	"icon" varchar(64),
	"authorId" uuid NOT NULL,
	"official" boolean DEFAULT false NOT NULL,
	"pinned" boolean DEFAULT false NOT NULL,
	"uses" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Routine" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"projectId" uuid NOT NULL,
	"title" text NOT NULL,
	"prompt" text NOT NULL,
	"icon" varchar(64),
	"cadenceCron" varchar(64) NOT NULL,
	"cadenceLabel" text NOT NULL,
	"status" varchar DEFAULT 'active' NOT NULL,
	"nextRunAt" timestamp,
	"lastRunAt" timestamp,
	"ownerId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "RoutineRun" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"routineId" uuid NOT NULL,
	"title" text,
	"output" text,
	"status" varchar DEFAULT 'running' NOT NULL,
	"error" text,
	"triggeredBy" uuid,
	"startedAt" timestamp DEFAULT now() NOT NULL,
	"finishedAt" timestamp,
	"durationMs" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Workspace" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" varchar(64) NOT NULL,
	"createdBy" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Workspace_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "WorkspaceMember" (
	"workspaceId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"role" varchar DEFAULT 'member' NOT NULL,
	"joinedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "WorkspaceMember_workspaceId_userId_pk" PRIMARY KEY("workspaceId","userId")
);
--> statement-breakpoint
ALTER TABLE "Chat" ADD COLUMN IF NOT EXISTS "projectId" uuid;--> statement-breakpoint
ALTER TABLE "Chat" ADD COLUMN IF NOT EXISTS "updatedAt" timestamp;--> statement-breakpoint
ALTER TABLE "Message_v2" ADD COLUMN IF NOT EXISTS "authorId" uuid;--> statement-breakpoint
ALTER TABLE "Message_v2" ADD COLUMN IF NOT EXISTS "tag" varchar(32);--> statement-breakpoint
ALTER TABLE "Message_v2" ADD COLUMN IF NOT EXISTS "isInterrupted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "projectId" uuid;--> statement-breakpoint
ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "chatId" uuid;--> statement-breakpoint
ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "shareScope" varchar DEFAULT 'project' NOT NULL;--> statement-breakpoint
ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "shareToken" varchar(32);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Chat" ADD CONSTRAINT "Chat_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Document" ADD CONSTRAINT "Document_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Document" ADD CONSTRAINT "Document_chatId_Chat_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Message_v2" ADD CONSTRAINT "Message_v2_authorId_User_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Project" ADD CONSTRAINT "Project_workspaceId_Workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Project" ADD CONSTRAINT "Project_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProjectFile" ADD CONSTRAINT "ProjectFile_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProjectFile" ADD CONSTRAINT "ProjectFile_uploadedBy_User_id_fk" FOREIGN KEY ("uploadedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_addedBy_User_id_fk" FOREIGN KEY ("addedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Prompt" ADD CONSTRAINT "Prompt_workspaceId_Workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Prompt" ADD CONSTRAINT "Prompt_authorId_User_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Routine" ADD CONSTRAINT "Routine_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Routine" ADD CONSTRAINT "Routine_ownerId_User_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "RoutineRun" ADD CONSTRAINT "RoutineRun_routineId_Routine_id_fk" FOREIGN KEY ("routineId") REFERENCES "public"."Routine"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "RoutineRun" ADD CONSTRAINT "RoutineRun_triggeredBy_User_id_fk" FOREIGN KEY ("triggeredBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_workspaceId_Workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Chat_projectId_updatedAt_idx" ON "Chat" USING btree ("projectId","updatedAt");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Document_projectId_idx" ON "Document" USING btree ("projectId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Document_shareToken_idx" ON "Document" USING btree ("shareToken","createdAt");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Project_workspaceId_updatedAt_idx" ON "Project" USING btree ("workspaceId","updatedAt");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ProjectFile_projectId_idx" ON "ProjectFile" USING btree ("projectId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ProjectMember_userId_idx" ON "ProjectMember" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Prompt_workspaceId_category_idx" ON "Prompt" USING btree ("workspaceId","category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Routine_projectId_idx" ON "Routine" USING btree ("projectId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Routine_status_nextRunAt_idx" ON "Routine" USING btree ("status","nextRunAt");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "RoutineRun_routineId_startedAt_idx" ON "RoutineRun" USING btree ("routineId","startedAt");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "WorkspaceMember_userId_idx" ON "WorkspaceMember" USING btree ("userId");
