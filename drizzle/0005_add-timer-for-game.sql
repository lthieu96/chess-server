ALTER TABLE "games" ADD COLUMN "time_control" integer DEFAULT 600;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "increment" integer DEFAULT 5;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "white_time_remaining" integer;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "black_time_remaining" integer;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "last_move_time" timestamp;