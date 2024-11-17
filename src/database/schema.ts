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

export const databaseSchema = {
  users,
};
