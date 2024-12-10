ALTER TABLE moves
ALTER COLUMN game_id TYPE integer USING game_id::integer;