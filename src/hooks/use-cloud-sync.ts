"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useStore } from "@/lib/store";
import type { Exercise, LessonProgress, Session, Song } from "@/lib/types";

type Row = Record<string, unknown>;

function iso(v: unknown): string {
  if (typeof v === "string") return v;
  try {
    return new Date(v as string).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

/** Map the Postgres rows returned by GET /api/sync back into local store shape. */
function mapCloud(data: {
  sessions?: Row[];
  songs?: Row[];
  exercises?: Row[];
  progress?: Row[];
}) {
  const sessions: Session[] = (data.sessions ?? []).map((r) => ({
    id: String(r.clientId),
    startedAt: iso(r.startedAt),
    durationMin: (r.durationMin as number) ?? undefined,
    entryMethod: (r.entryMethod as Session["entryMethod"]) ?? "quick_log",
    mood: (r.mood as number) ?? undefined,
    energy: (r.energy as number) ?? undefined,
    rawText: (r.rawText as string) ?? undefined,
    notes: (r.notes as string) ?? undefined,
    songs: (r.songs as Session["songs"]) ?? [],
    exercises: (r.exercises as Session["exercises"]) ?? [],
    tags: (r.tags as string[]) ?? [],
    createdAt: iso(r.createdAt),
  }));
  const songs: Song[] = (data.songs ?? []).map((r) => ({
    id: String(r.clientId),
    title: r.title as string,
    artist: (r.artist as string) ?? undefined,
    status: (r.status as Song["status"]) ?? "learning",
    difficulty: (r.difficulty as number) ?? undefined,
    targetBpm: (r.targetBpm as number) ?? undefined,
    notes: (r.notes as string) ?? undefined,
    addedAt: iso(r.addedAt),
  }));
  const exercises: Exercise[] = (data.exercises ?? []).map((r) => ({
    id: String(r.clientId),
    name: r.name as string,
    category: (r.category as Exercise["category"]) ?? "other",
    notes: (r.notes as string) ?? undefined,
    addedAt: iso(r.addedAt),
  }));
  const lessonProgress: Record<string, LessonProgress> = {};
  for (const r of data.progress ?? []) {
    lessonProgress[String(r.lessonId)] = { completedAt: iso(r.completedAt) };
  }
  return { sessions, songs, exercises, lessonProgress };
}

/**
 * Keeps the local store and the user's Postgres rows in sync once signed in.
 * Mounted once, near the app root.
 */
export function useCloudSync() {
  const { isLoaded, isSignedIn } = useAuth();
  const hydrated = useStore((s) => s.hydrated);
  const applying = useRef(false); // guards against pull → setState → push echo
  const pulled = useRef(false);

  async function push() {
    const s = useStore.getState();
    try {
      await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessions: s.sessions,
          songs: s.songs,
          exercises: s.exercises,
          lessonProgress: s.lessonProgress,
        }),
      });
    } catch {
      /* offline — local store is the source of truth, retry on next change */
    }
  }

  // Re-arm the pull when the user signs out then back in.
  useEffect(() => {
    if (!isSignedIn) pulled.current = false;
  }, [isSignedIn]);

  // On first sign-in after hydration: pull cloud data, or seed cloud from local.
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !hydrated || pulled.current) return;
    pulled.current = true;
    (async () => {
      try {
        const res = await fetch("/api/sync");
        if (!res.ok) return;
        const data = await res.json();
        const hasCloud =
          (data.sessions?.length ?? 0) +
            (data.songs?.length ?? 0) +
            (data.exercises?.length ?? 0) +
            (data.progress?.length ?? 0) >
          0;
        if (hasCloud) {
          applying.current = true;
          useStore.getState().importData(mapCloud(data));
          setTimeout(() => (applying.current = false), 150);
        } else {
          await push(); // first sign-in with local history → seed the cloud
        }
      } catch {
        /* ignore — stays local-first */
      }
    })();
  }, [isLoaded, isSignedIn, hydrated]);

  // Debounced push on any store change while signed in.
  useEffect(() => {
    if (!isSignedIn) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsub = useStore.subscribe(() => {
      if (applying.current) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(push, 1500);
    });
    return () => {
      if (timer) clearTimeout(timer);
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn]);
}
