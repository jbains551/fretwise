"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useEffect } from "react";
import { localDateKey, uid } from "@/lib/utils";
import type {
  Session,
  Song,
  Exercise,
  LessonProgress,
  Settings,
  SessionSong,
  SessionExercise,
} from "@/lib/types";

interface State {
  hydrated: boolean;
  sessions: Session[];
  songs: Song[];
  exercises: Exercise[];
  lessonProgress: Record<string, LessonProgress>;
  settings: Settings;

  // mutations
  addSession: (input: Partial<Session> & { durationMin?: number }) => Session;
  updateSession: (id: string, patch: Partial<Session>) => void;
  deleteSession: (id: string) => void;

  addSong: (input: Partial<Song> & { title: string }) => Song;
  updateSong: (id: string, patch: Partial<Song>) => void;
  ensureSong: (title: string, artist?: string) => string;

  addExercise: (input: Partial<Exercise> & { name: string }) => Exercise;
  ensureExercise: (name: string, category?: Exercise["category"]) => string;

  completeLesson: (id: string, practicedSeconds?: number) => void;
  uncompleteLesson: (id: string) => void;

  setGoal: (dailyMinutes: number) => void;
  setDefaultBpm: (bpm: number) => void;

  importData: (data: Partial<State>) => void;
  reset: () => void;
}

const DEFAULT_SETTINGS: Settings = { goal: { dailyMinutes: 20 }, defaultBpm: 80 };

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      hydrated: false,
      sessions: [],
      songs: [],
      exercises: [],
      lessonProgress: {},
      settings: DEFAULT_SETTINGS,

      addSession: (input) => {
        const now = new Date().toISOString();
        const session: Session = {
          id: uid(),
          startedAt: input.startedAt ?? now,
          durationMin: input.durationMin,
          entryMethod: input.entryMethod ?? "quick_log",
          mood: input.mood,
          energy: input.energy,
          rawText: input.rawText,
          notes: input.notes,
          songs: input.songs ?? [],
          exercises: input.exercises ?? [],
          tags: input.tags ?? [],
          createdAt: now,
        };
        set((s) => ({ sessions: [session, ...s.sessions] }));
        return session;
      },

      updateSession: (id, patch) =>
        set((s) => ({
          sessions: s.sessions.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),

      deleteSession: (id) =>
        set((s) => ({ sessions: s.sessions.filter((x) => x.id !== id) })),

      addSong: (input) => {
        const song: Song = {
          id: uid(),
          title: input.title,
          artist: input.artist,
          status: input.status ?? "learning",
          difficulty: input.difficulty,
          targetBpm: input.targetBpm,
          notes: input.notes,
          addedAt: new Date().toISOString(),
        };
        set((s) => ({ songs: [...s.songs, song] }));
        return song;
      },

      updateSong: (id, patch) =>
        set((s) => ({ songs: s.songs.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),

      ensureSong: (title, artist) => {
        const existing = get().songs.find(
          (s) => s.title.toLowerCase() === title.toLowerCase() &&
            (s.artist ?? "").toLowerCase() === (artist ?? "").toLowerCase(),
        );
        if (existing) return existing.id;
        return get().addSong({ title, artist }).id;
      },

      addExercise: (input) => {
        const ex: Exercise = {
          id: uid(),
          name: input.name,
          category: input.category ?? "other",
          notes: input.notes,
          addedAt: new Date().toISOString(),
        };
        set((s) => ({ exercises: [...s.exercises, ex] }));
        return ex;
      },

      ensureExercise: (name, category) => {
        const existing = get().exercises.find(
          (e) => e.name.toLowerCase() === name.toLowerCase(),
        );
        if (existing) return existing.id;
        return get().addExercise({ name, category }).id;
      },

      completeLesson: (id, practicedSeconds) =>
        set((s) => ({
          lessonProgress: {
            ...s.lessonProgress,
            [id]: { completedAt: new Date().toISOString(), practicedSeconds },
          },
        })),

      uncompleteLesson: (id) =>
        set((s) => {
          const next = { ...s.lessonProgress };
          delete next[id];
          return { lessonProgress: next };
        }),

      setGoal: (dailyMinutes) =>
        set((s) => ({ settings: { ...s.settings, goal: { dailyMinutes } } })),

      setDefaultBpm: (bpm) => set((s) => ({ settings: { ...s.settings, defaultBpm: bpm } })),

      importData: (data) => set((s) => ({ ...s, ...data })),

      reset: () =>
        set({
          sessions: [],
          songs: [],
          exercises: [],
          lessonProgress: {},
          settings: DEFAULT_SETTINGS,
        }),
    }),
    {
      name: "fretwise-data-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true, // we rehydrate after mount to avoid SSR mismatch
      partialize: ({ sessions, songs, exercises, lessonProgress, settings }) => ({
        sessions,
        songs,
        exercises,
        lessonProgress,
        settings,
      }),
      onRehydrateStorage: () => (state) => {
        useStore.setState({ hydrated: true });
        void state;
      },
    },
  ),
);

/** Mount once near the root to load persisted data on the client. */
export function useEnsureHydrated() {
  useEffect(() => {
    void useStore.persist.rehydrate();
  }, []);
}

/* ------------------------------------------------------------------ */
/*  Derived selectors                                                  */
/* ------------------------------------------------------------------ */

function sessionDateKeys(sessions: Session[]): Set<string> {
  const set = new Set<string>();
  for (const s of sessions) set.add(localDateKey(new Date(s.startedAt)));
  return set;
}

/** Consecutive days practiced, ending today (or yesterday — one grace day). */
export function computeStreak(sessions: Session[]): number {
  const keys = sessionDateKeys(sessions);
  if (keys.size === 0) return 0;
  const today = new Date();
  let cursor = new Date(today);

  // Allow today to be empty without breaking the streak yet.
  if (!keys.has(localDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!keys.has(localDateKey(cursor))) return 0;
  }
  let streak = 0;
  while (keys.has(localDateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export const useStreak = () => useStore((s) => computeStreak(s.sessions));

export const useTodayMinutes = () =>
  useStore((s) => {
    const today = localDateKey();
    return s.sessions
      .filter((x) => localDateKey(new Date(x.startedAt)) === today)
      .reduce((sum, x) => sum + (x.durationMin ?? 0), 0);
  });

export function totalMinutes(sessions: Session[]) {
  return sessions.reduce((sum, x) => sum + (x.durationMin ?? 0), 0);
}

export type { Session, Song, Exercise, SessionSong, SessionExercise };
