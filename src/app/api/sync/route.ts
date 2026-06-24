/**
 * Cloud sync endpoint (env-gated on DATABASE_URL).
 *
 *   GET  /api/sync  → pull the signed-in user's data
 *   POST /api/sync  → push (full replace) the user's data from the device
 *
 * Returns 503 until the Postgres layer is provisioned, so the local-first app
 * keeps working unchanged. See README → "Turning on cloud sync".
 */

import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { getUserId } from "@/lib/auth";

export async function GET(req: Request) {
  const db = getDb();
  if (!db) return Response.json({ error: "Cloud sync not configured." }, { status: 503 });
  const userId = await getUserId(req);
  if (!userId) return Response.json({ error: "Unauthorized." }, { status: 401 });

  const [sessions, songs, exercises, progress] = await Promise.all([
    db.select().from(schema.sessions).where(eq(schema.sessions.userId, userId)),
    db.select().from(schema.songs).where(eq(schema.songs.userId, userId)),
    db.select().from(schema.exercises).where(eq(schema.exercises.userId, userId)),
    db.select().from(schema.lessonProgress).where(eq(schema.lessonProgress.userId, userId)),
  ]);

  return Response.json({ sessions, songs, exercises, progress });
}

export async function POST(req: Request) {
  const db = getDb();
  if (!db) return Response.json({ error: "Cloud sync not configured." }, { status: 503 });
  const userId = await getUserId(req);
  if (!userId) return Response.json({ error: "Unauthorized." }, { status: 401 });

  const body = await req.json();

  await db.transaction(async (tx) => {
    // Full replace — simplest correct strategy for single-user device sync.
    await tx.delete(schema.sessions).where(eq(schema.sessions.userId, userId));
    await tx.delete(schema.songs).where(eq(schema.songs.userId, userId));
    await tx.delete(schema.exercises).where(eq(schema.exercises.userId, userId));
    await tx.delete(schema.lessonProgress).where(eq(schema.lessonProgress.userId, userId));

    if (body.sessions?.length) {
      await tx.insert(schema.sessions).values(
        body.sessions.map((s: Record<string, unknown>) => ({
          userId,
          clientId: String(s.id),
          startedAt: new Date(s.startedAt as string),
          durationMin: s.durationMin as number | undefined,
          entryMethod: (s.entryMethod as string) ?? "quick_log",
          mood: s.mood as number | undefined,
          energy: s.energy as number | undefined,
          rawText: s.rawText as string | undefined,
          notes: s.notes as string | undefined,
          songs: (s.songs as unknown[]) ?? [],
          exercises: (s.exercises as unknown[]) ?? [],
          tags: (s.tags as string[]) ?? [],
        })),
      );
    }
    if (body.songs?.length) {
      await tx.insert(schema.songs).values(
        body.songs.map((s: Record<string, unknown>) => ({
          userId,
          clientId: String(s.id),
          title: s.title as string,
          artist: s.artist as string | undefined,
          status: (s.status as string) ?? "learning",
          difficulty: s.difficulty as number | undefined,
          targetBpm: s.targetBpm as number | undefined,
          notes: s.notes as string | undefined,
        })),
      );
    }
    if (body.exercises?.length) {
      await tx.insert(schema.exercises).values(
        body.exercises.map((e: Record<string, unknown>) => ({
          userId,
          clientId: String(e.id),
          name: e.name as string,
          category: (e.category as string) ?? "other",
          notes: e.notes as string | undefined,
        })),
      );
    }
    const progressEntries = Object.entries(body.lessonProgress ?? {});
    if (progressEntries.length) {
      await tx.insert(schema.lessonProgress).values(
        progressEntries.map(([lessonId, v]) => ({
          userId,
          lessonId,
          completedAt: new Date((v as { completedAt?: string }).completedAt ?? Date.now()),
        })),
      );
    }
  });

  return Response.json({ ok: true });
}
