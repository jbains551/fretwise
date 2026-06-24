/**
 * Postgres schema (Drizzle) — the cloud mirror of the local-first store.
 *
 * Adapted from the original practice-journal `schema.sql`, with a `user_id`
 * column added so multiple signed-in users (via Clerk) can each keep their own
 * data. Generate SQL with `npm run db:generate` and apply with `npm run db:push`.
 */

import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export const sessions = pgTable(
  "sessions",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    clientId: text("client_id").notNull(), // the uid generated on-device, for dedupe
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    durationMin: integer("duration_min"),
    entryMethod: text("entry_method").notNull().default("quick_log"),
    mood: integer("mood"),
    energy: integer("energy"),
    rawText: text("raw_text"),
    notes: text("notes"),
    songs: jsonb("songs").$type<unknown[]>().default([]),
    exercises: jsonb("exercises").$type<unknown[]>().default([]),
    tags: jsonb("tags").$type<string[]>().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_sessions_user").on(t.userId), index("idx_sessions_started").on(t.startedAt)],
);

export const songs = pgTable(
  "songs",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    clientId: text("client_id").notNull(),
    title: text("title").notNull(),
    artist: text("artist"),
    status: text("status").notNull().default("learning"),
    difficulty: integer("difficulty"),
    targetBpm: integer("target_bpm"),
    notes: text("notes"),
    addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_songs_user").on(t.userId)],
);

export const exercises = pgTable(
  "exercises",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    clientId: text("client_id").notNull(),
    name: text("name").notNull(),
    category: text("category").notNull().default("other"),
    notes: text("notes"),
    addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_exercises_user").on(t.userId)],
);

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    lessonId: text("lesson_id").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_progress_user").on(t.userId)],
);

export const digests = pgTable("digests", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  weekStart: text("week_start").notNull(),
  summary: text("summary").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
