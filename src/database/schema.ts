import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  pgEnum,
  boolean,
} from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['user', 'admin', 'guest']);
export const gameStatusEnum = pgEnum('game_status', [
  'waiting',
  'active',
  'completed',
]);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').unique(),
  role: roleEnum('role').default('user'),
  email: text('email').unique(),
  rating: integer('rating').default(1200),
  createdAt: timestamp('created_at').defaultNow(),
  lastActive: timestamp('last_active').defaultNow(),
  password: text('password'),
});

export const games = pgTable('games', {
  id: serial('id').primaryKey(),
  status: gameStatusEnum('status').notNull().default('waiting'),
  fen: text('fen').notNull(),
  whitePlayerId: text('white_player_id'),
  blackPlayerId: text('black_player_id'),
  winner: text('winner'),
  isCheck: boolean('is_check').default(false),
  isCheckmate: boolean('is_checkmate').default(false),
  isDraw: boolean('is_draw').default(false),
  turn: text('turn').notNull().default('w'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const moves = pgTable('moves', {
  id: serial('id').primaryKey(),
  gameId: text('game_id'),
  playerId: text('player_id'),
  move: text('move').notNull(),
  fen: text('fen').notNull(),
  isCheck: boolean('is_check').default(false),
  isCheckmate: boolean('is_checkmate').default(false),
  isDraw: boolean('is_draw').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const databaseSchema = {
  users,
  games,
  moves,
};
