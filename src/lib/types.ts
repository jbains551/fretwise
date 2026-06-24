/**
 * Shared data model for Fretwise.
 *
 * This mirrors the original practice-journal `schema.sql` so the local-first
 * store and the future Postgres backend speak the same shape. IDs are strings
 * here (client-generated) and map to serial/uuid columns on the server.
 */

export type EntryMethod = "quick_log" | "voice_note" | "free_journal";
export type SongStatus = "learning" | "in_rotation" | "mastered" | "shelved";
export type ExerciseCategory =
  | "scale"
  | "arpeggio"
  | "chord_change"
  | "picking"
  | "strumming"
  | "ear"
  | "theory"
  | "other";

export interface Song {
  id: string;
  title: string;
  artist?: string;
  status: SongStatus;
  difficulty?: number; // 1..5
  targetBpm?: number;
  notes?: string;
  addedAt: string; // ISO
}

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  notes?: string;
  addedAt: string;
}

/** A song touched during a session, with optional BPM progression. */
export interface SessionSong {
  songId: string;
  minutes?: number;
  bpmStart?: number;
  bpmEnd?: number;
  notes?: string;
}

export interface SessionExercise {
  exerciseId: string;
  minutes?: number;
  bpm?: number;
  notes?: string;
}

export interface Session {
  id: string;
  startedAt: string; // ISO 8601 with offset — when practice happened (backdatable)
  durationMin?: number;
  entryMethod: EntryMethod;
  mood?: number; // 1..5
  energy?: number; // 1..5
  rawText?: string; // original voice/journal input — never overwritten
  notes?: string; // cleaned summary
  songs: SessionSong[];
  exercises: SessionExercise[];
  tags: string[];
  createdAt: string;
}

/** Per-lesson completion record. */
export interface LessonProgress {
  completedAt: string;
  practicedSeconds?: number;
}

export interface Goal {
  dailyMinutes: number;
}

export interface Settings {
  goal: Goal;
  defaultBpm: number;
}
