"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, Music, Flame, Clock, CalendarDays, Sparkles, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogDialog } from "@/components/tracker/log-dialog";
import { PracticeBars, Sparkline } from "@/components/tracker/charts";
import { useStore, useStreak, totalMinutes } from "@/lib/store";
import { formatMinutes, localDateKey, daysBetween, cn } from "@/lib/utils";
import type { SongStatus } from "@/lib/types";

const STATUS_TONE: Record<SongStatus, "muted" | "info" | "success" | "accent"> = {
  learning: "accent",
  in_rotation: "info",
  mastered: "success",
  shelved: "muted",
};

export default function TrackerPage() {
  const [logOpen, setLogOpen] = useState(false);
  const sessions = useStore((s) => s.sessions);
  const songs = useStore((s) => s.songs);
  const deleteSession = useStore((s) => s.deleteSession);
  const addSong = useStore((s) => s.addSong);
  const setGoal = useStore((s) => s.setGoal);
  const goal = useStore((s) => s.settings.goal.dailyMinutes);
  const streak = useStreak();

  const weekMinutes = useMemo(() => {
    const today = localDateKey();
    return sessions
      .filter((s) => daysBetween(localDateKey(new Date(s.startedAt)), today) < 7)
      .reduce((sum, s) => sum + (s.durationMin ?? 0), 0);
  }, [sessions]);

  const songBpm = useMemo(() => {
    const map = new Map<string, number[]>();
    [...sessions].reverse().forEach((s) =>
      s.songs.forEach((ss) => {
        const bpm = ss.bpmEnd ?? ss.bpmStart;
        if (bpm) map.set(ss.songId, [...(map.get(ss.songId) ?? []), bpm]);
      }),
    );
    return map;
  }, [sessions]);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Tracker"
        subtitle="Your practice history, streaks, and progress over time."
        action={<Button onClick={() => setLogOpen(true)}><Plus size={16} /> Log</Button>}
      />

      {/* Stat cards */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Flame} tone="text-ember" value={`${streak}`} label="Day streak" />
        <StatCard icon={CalendarDays} tone="text-accent" value={formatMinutes(weekMinutes)} label="This week" />
        <StatCard icon={Clock} tone="text-info" value={formatMinutes(totalMinutes(sessions))} label="All time" />
        <StatCard icon={Music} tone="text-success" value={`${sessions.length}`} label="Sessions" />
      </div>

      {/* Practice chart */}
      <Card className="mb-4">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Last 14 days</CardTitle>
          <div className="flex items-center gap-1.5 text-xs text-muted">
            Daily goal:
            {[15, 20, 30, 45].map((g) => (
              <button
                key={g}
                onClick={() => setGoal(g)}
                className={cn(
                  "rounded px-2 py-0.5 font-medium",
                  goal === g ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted hover:text-text",
                )}
              >
                {g}m
              </button>
            ))}
          </div>
        </CardHeader>
        <CardBody>
          {sessions.length === 0 ? (
            <EmptyHint text="Log your first session to start your streak and fill this chart." />
          ) : (
            <PracticeBars sessions={sessions} days={14} />
          )}
        </CardBody>
      </Card>

      <WeeklyDigest disabled={sessions.length === 0} />

      {/* Songs */}
      <Card className="mb-4 mt-4">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Songs</CardTitle>
        </CardHeader>
        <CardBody className="space-y-2">
          <AddSong onAdd={(title, artist) => addSong({ title, artist })} />
          {songs.length === 0 ? (
            <EmptyHint text="Add songs you're learning to track their status and tempo." />
          ) : (
            songs.map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 p-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{s.title}</div>
                  {s.artist && <div className="truncate text-xs text-muted">{s.artist}</div>}
                </div>
                <Sparkline points={songBpm.get(s.id) ?? []} />
                <Badge tone={STATUS_TONE[s.status]}>{s.status.replace("_", " ")}</Badge>
              </div>
            ))
          )}
        </CardBody>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardBody className="space-y-2">
          {sessions.length === 0 ? (
            <EmptyHint text="No sessions yet." />
          ) : (
            sessions.map((s) => (
              <div key={s.id} className="group flex items-start gap-3 rounded-lg border border-border bg-surface-2 p-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm">{s.notes || s.rawText || "Practice session"}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                    <span>
                      {new Date(s.startedAt).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                    </span>
                    {s.durationMin ? <Badge tone="muted">{s.durationMin}m</Badge> : null}
                    {s.entryMethod === "free_journal" && <Badge tone="accent">journal</Badge>}
                    {s.tags.includes("practice-round") && <Badge tone="info">round</Badge>}
                  </div>
                </div>
                <button
                  onClick={() => deleteSession(s.id)}
                  className="rounded-md p-1.5 text-muted opacity-0 transition hover:bg-danger/15 hover:text-danger group-hover:opacity-100"
                  aria-label="Delete session"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </CardBody>
      </Card>

      <LogDialog open={logOpen} onClose={() => setLogOpen(false)} />
    </div>
  );
}

function StatCard({ icon: Icon, value, label, tone }: { icon: typeof Flame; value: string; label: string; tone: string }) {
  return (
    <Card>
      <CardBody className="flex flex-col items-center gap-1 py-4">
        <Icon size={20} className={tone} />
        <div className="font-display text-xl font-semibold tabular">{value}</div>
        <div className="text-xs text-muted">{label}</div>
      </CardBody>
    </Card>
  );
}

function AddSong({ onAdd }: { onAdd: (title: string, artist?: string) => void }) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  return (
    <div className="flex gap-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Song title"
        className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <input
        value={artist}
        onChange={(e) => setArtist(e.target.value)}
        placeholder="Artist"
        className="w-28 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <Button
        size="icon"
        disabled={!title.trim()}
        onClick={() => {
          onAdd(title.trim(), artist.trim() || undefined);
          setTitle("");
          setArtist("");
        }}
      >
        <Plus size={18} />
      </Button>
    </div>
  );
}

function WeeklyDigest({ disabled }: { disabled: boolean }) {
  const sessions = useStore((s) => s.sessions);
  const songs = useStore((s) => s.songs);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/digest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessions: sessions.slice(0, 40), songs }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      setText(json.summary);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not generate digest");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardBody className="pt-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-accent" />
            <div>
              <div className="font-display text-lg font-semibold">Weekly digest</div>
              <div className="text-xs text-muted">An AI summary of your recent progress and what to focus on next.</div>
            </div>
          </div>
          <Button variant="secondary" onClick={run} disabled={disabled || loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            Generate
          </Button>
        </div>
        {err && <p className="mt-3 text-sm text-muted">{err} — set up the AI key (see README) to enable this.</p>}
        {text && (
          <div className="mt-3 whitespace-pre-wrap rounded-lg border border-border bg-surface-2 p-4 text-sm leading-relaxed">
            {text}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <p className="py-4 text-center text-sm text-muted">{text}</p>;
}
