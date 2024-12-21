CREATE TABLE IF NOT EXISTS "completed_puzzles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"puzzle_id" integer NOT NULL,
	"completed_at" timestamp DEFAULT now()
);
