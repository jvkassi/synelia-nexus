CREATE TABLE `Artifact` (
	`id` text PRIMARY KEY NOT NULL,
	`workspaceId` text NOT NULL,
	`threadId` text,
	`createdById` text NOT NULL,
	`title` text NOT NULL,
	`kind` text DEFAULT 'Document' NOT NULL,
	`icon` text DEFAULT 'file-text' NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`when` text DEFAULT 'maintenant' NOT NULL,
	`live` integer DEFAULT false NOT NULL,
	`shared` integer DEFAULT false NOT NULL,
	`publicSlug` text,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`threadId`) REFERENCES `Thread`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `Artifact_workspace_idx` ON `Artifact` (`workspaceId`);--> statement-breakpoint
CREATE TABLE `Message` (
	`id` text PRIMARY KEY NOT NULL,
	`threadId` text NOT NULL,
	`userId` text NOT NULL,
	`role` text NOT NULL,
	`text` text NOT NULL,
	`at` text NOT NULL,
	`parts` text NOT NULL,
	`attachments` text DEFAULT '[]' NOT NULL,
	`isSteer` integer DEFAULT false NOT NULL,
	`isInterrupted` integer DEFAULT false NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`threadId`) REFERENCES `Thread`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `Message_thread_idx` ON `Message` (`threadId`,`createdAt`);--> statement-breakpoint
CREATE TABLE `Prompt` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`categoryId` text NOT NULL,
	`icon` text DEFAULT 'library' NOT NULL,
	`authorId` text NOT NULL,
	`uses` integer DEFAULT 0 NOT NULL,
	`pinned` integer DEFAULT false NOT NULL,
	`official` integer DEFAULT false NOT NULL,
	`desc` text NOT NULL,
	`body` text NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`categoryId`) REFERENCES `PromptCategory`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `Prompt_cat_idx` ON `Prompt` (`categoryId`);--> statement-breakpoint
CREATE TABLE `PromptCategory` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`icon` text DEFAULT 'library' NOT NULL,
	`color` text
);
--> statement-breakpoint
CREATE TABLE `Routine` (
	`id` text PRIMARY KEY NOT NULL,
	`workspaceId` text NOT NULL,
	`title` text NOT NULL,
	`cadence` text NOT NULL,
	`ownerId` text NOT NULL,
	`next` text DEFAULT '' NOT NULL,
	`icon` text DEFAULT 'repeat' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`ago` text DEFAULT 'maintenant' NOT NULL,
	`prompt` text NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `Routine_workspace_idx` ON `Routine` (`workspaceId`);--> statement-breakpoint
CREATE TABLE `RoutineRun` (
	`id` text PRIMARY KEY NOT NULL,
	`routineId` text NOT NULL,
	`title` text NOT NULL,
	`date` text NOT NULL,
	`ranFor` text NOT NULL,
	`thought` integer DEFAULT 0 NOT NULL,
	`output` text NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`routineId`) REFERENCES `Routine`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `RoutineRun_routine_idx` ON `RoutineRun` (`routineId`,`createdAt`);--> statement-breakpoint
CREATE TABLE `ScheduledTask` (
	`id` text PRIMARY KEY NOT NULL,
	`workspaceId` text NOT NULL,
	`threadId` text,
	`routineId` text,
	`scheduledById` text NOT NULL,
	`prompt` text NOT NULL,
	`runAt` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`resultMessageId` text,
	`error` text,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`threadId`) REFERENCES `Thread`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`routineId`) REFERENCES `Routine`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`scheduledById`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`resultMessageId`) REFERENCES `Message`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `ScheduledTask_status_idx` ON `ScheduledTask` (`status`,`runAt`);--> statement-breakpoint
CREATE TABLE `Thread` (
	`id` text PRIMARY KEY NOT NULL,
	`workspaceId` text NOT NULL,
	`title` text NOT NULL,
	`icon` text,
	`preview` text,
	`lastById` text,
	`updated` text DEFAULT 'maintenant' NOT NULL,
	`pinned` integer DEFAULT false NOT NULL,
	`liveState` text,
	`liveUserId` text,
	`createdById` text NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`lastById`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`liveUserId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `Thread_workspace_idx` ON `Thread` (`workspaceId`);--> statement-breakpoint
CREATE TABLE `ThreadParticipant` (
	`threadId` text NOT NULL,
	`userId` text NOT NULL,
	`joinedAt` integer NOT NULL,
	PRIMARY KEY(`threadId`, `userId`),
	FOREIGN KEY (`threadId`) REFERENCES `Thread`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `User` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password` text,
	`name` text,
	`emailVerified` integer DEFAULT false NOT NULL,
	`image` text,
	`isAnonymous` integer DEFAULT false NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`title` text,
	`color` text,
	`initials` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Workspace` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`emoji` text DEFAULT 'folder-kanban' NOT NULL,
	`color` text DEFAULT '#4B2882' NOT NULL,
	`isPublic` integer DEFAULT false NOT NULL,
	`updated` text DEFAULT 'maintenant' NOT NULL,
	`createdById` text NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Workspace_slug_idx` ON `Workspace` (`slug`);--> statement-breakpoint
CREATE TABLE `WorkspaceMember` (
	`workspaceId` text NOT NULL,
	`userId` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`joinedAt` integer NOT NULL,
	PRIMARY KEY(`workspaceId`, `userId`),
	FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action
);
