CREATE TABLE `job_filters` (
	`user_id` text PRIMARY KEY NOT NULL,
	`role` text,
	`technologies_json` text,
	`location_json` text,
	`min_experience` integer,
	`max_experience` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
