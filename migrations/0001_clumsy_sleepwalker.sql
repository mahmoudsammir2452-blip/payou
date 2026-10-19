CREATE TABLE `admin_credentials` (
	`id` text PRIMARY KEY NOT NULL,
	`salt` text NOT NULL,
	`hash` text NOT NULL,
	`recovery` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `admin_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `admin_sessions` (
	`token` text PRIMARY KEY NOT NULL,
	`expires` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `catalog_overrides` (
	`slug` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`version` text NOT NULL
);
