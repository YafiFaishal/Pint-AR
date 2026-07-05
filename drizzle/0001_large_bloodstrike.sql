ALTER TABLE `jawaban_lks` ADD `dinilai` integer DEFAULT false NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `jawaban_user_template_unq` ON `jawaban_lks` (`user_id`,`lks_template_id`);