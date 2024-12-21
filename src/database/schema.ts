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
  whitePlayerId: integer('white_player_id'),
  blackPlayerId: integer('black_player_id'),
  winner: integer('winner'),
  isCheck: boolean('is_check').default(false),
  isCheckmate: boolean('is_checkmate').default(false),
  isDraw: boolean('is_draw').default(false),
  isPrivate: boolean('is_private').default(false),
  turn: text('turn').notNull().default('w'),
  timeControl: integer('time_control').default(600), // 10 minutes in seconds
  increment: integer('increment').default(5), // 5 seconds increment per move
  whiteTimeRemaining: integer('white_time_remaining'),
  blackTimeRemaining: integer('black_time_remaining'),
  lastMoveTime: timestamp('last_move_time'),
  moves: text('moves').default(''), // Store moves as comma-separated string
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const completedPuzzles = pgTable('completed_puzzles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  puzzleId: text('puzzle_id').notNull(),
  completedAt: timestamp('completed_at').defaultNow(),
});

export const databaseSchema = {
  users,
  games,
  completedPuzzles,
};
