import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  pgEnum,
} from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['user', 'admin', 'guest']);

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
  status: text('status').notNull(),
  fen: text('fen').notNull(),
  whitePlayerId: text('white_player_id'),
  blackPlayerId: text('black_player_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const moves = pgTable('moves', {
  id: serial('id').primaryKey(),
  gameId: serial('game_id').references(() => games.id),
  playerId: text('player_id'),
  move: text('move'),
  fen: text('fen').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const databaseSchema = {
  users,
  games,
  moves,
};
