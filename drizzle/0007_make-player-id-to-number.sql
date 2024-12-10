ALTER TABLE games
ALTER COLUMN white_player_id TYPE integer USING white_player_id::integer,
ALTER COLUMN black_player_id TYPE integer USING black_player_id::integer,
ALTER COLUMN winner TYPE integer USING winner::integer;

ALTER TABLE moves
ALTER COLUMN player_id TYPE integer USING player_id::integer;