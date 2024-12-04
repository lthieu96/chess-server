CREATE TYPE "public"."game_status" AS ENUM('waiting', 'active', 'completed');--> statement-breakpoint
ALTER TABLE "moves" DROP CONSTRAINT "moves_game_id_games_id_fk";
--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "status" SET DATA TYPE game_status
USING status::game_status;--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "status" SET DEFAULT 'waiting';--> statement-breakpoint
ALTER TABLE "moves" ALTER COLUMN "game_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "moves" ALTER COLUMN "game_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "moves" ALTER COLUMN "move" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "winner" text;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "is_check" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "is_checkmate" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "is_draw" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "turn" text DEFAULT 'w' NOT NULL;--> statement-breakpoint
ALTER TABLE "moves" ADD COLUMN "is_check" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "moves" ADD COLUMN "is_checkmate" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "moves" ADD COLUMN "is_draw" boolean DEFAULT false;