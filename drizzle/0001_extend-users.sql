CREATE TYPE "public"."role" AS ENUM('user', 'admin', 'guest');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "username" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "role" DEFAULT 'user';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "rating" integer DEFAULT 1200;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_active" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");