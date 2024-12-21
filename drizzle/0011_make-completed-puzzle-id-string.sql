ALTER TABLE "completed_puzzles"
  ALTER COLUMN "puzzle_id"
    SET DATA TYPE text
    USING ("puzzle_id"::text);