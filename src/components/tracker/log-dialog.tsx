"use client";

import { useState } from "react";
import { Check, Mic, PenLine, Loader2, Sparkles } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { Slider } from "@/components/ui/slider";
import { cn, localDateKey } from "@/lib/utils";
import { useStore } from "@/lib/store";
import type { ExerciseCategory, SessionExercise, SessionSong } from "@/lib/types";

const MOODS = ["😖", "😕", "😐", "🙂", "🤩"];

export function LogDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addSession = useStore((s) => s.addSession);
  const ensureSong = useStore((s) => s.ensureSong);
  const ensureExercise = useStore((s) => s.ensureExercise);

  const [method, setMethod] = useState<"quick" | "journal">("quick");
  const [minutes, setMinutes] = useState(20);
  const [date, setDate] = useState(localDateKey());
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [worked, setWorked] = useState("");
  const [journal, setJournal] = useState("");
  const [parsing, setParsing] = useState(false);
  const [saved, setSaved] = useState(false);

  const reset = () => {
    setMinutes(20); setMood(3); setEnergy(3); setWorked(""); setJournal("");
    setSaved(false); setMethod("quick"); setDate(localDateKey());
  };

  const close = () => { reset(); onClose(); };

  const startedAt = new Date(date + "T18:00:00").toISOString();

  const saveQuick = () => {
    const songs: SessionSong[] = [];
    const exercises: SessionExercise[] = [];
    worked
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((item) => {
        const exId = ensureExercise(item, "other");
        exercises.push({ exerciseId: exId });
      });
    addSession({
      startedAt,
      durationMin: minutes,
      entryMethod: "quick_log",
      mood,
      energy,
      notes: worked || undefined,
      exercises,
      songs,
    });
    setSaved(true);
    setTimeout(close, 900);
  };

  const saveJournal = async () => {
    setParsing(true);
    let parsed: {
      durationMin?: number;
      mood?: number;
      energy?: number;
      summary?: string;
      songs?: { title: string; artist?: string }[];
      exercises?: { name: string; category?: string }[];
      tags?: string[];
    } | null = null;
    try {
      const res = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: journal }),
      });
      if (res.ok) parsed = (await res.json()).data;
    } catch {
      /* offline / not configured — fall back to raw */
    }

    const songs: SessionSong[] = (parsed?.songs ?? []).map((s) => ({
      songId: ensureSong(s.title, s.artist),
    }));
    const exercises: SessionExercise[] = (parsed?.exercises ?? []).map((e) => ({
      exerciseId: ensureExercise(e.name, (e.category as ExerciseCategory) || "other"),
    }));

    addSession({
      startedAt,
      durationMin: parsed?.durationMin ?? minutes,
      entryMethod: "free_journal",
      mood: parsed?.mood ?? mood,
      energy: parsed?.energy ?? energy,
      rawText: journal,
      notes: parsed?.summary ?? journal,
      songs,
      exercises,
      tags: parsed?.tags ?? [],
    });
    setParsing(false);
    setSaved(true);
    setTimeout(close, 900);
  };

  return (
    <Dialog open={open} onClose={close}>
      <h2 className="mb-1 font-display text-2xl font-semibold">Log practice</h2>
      <p className="mb-4 text-sm text-muted">Under 30 seconds. Every minute counts toward your streak.</p>

      <Segmented
        className="mb-5"
        value={method}
        onChange={setMethod}
        options={[
          { label: "Quick", value: "quick" },
          { label: "Journal", value: "journal" },
        ]}
      />

      {method === "quick" ? (
        <div className="space-y-5">
          <Field label={`How long? · ${minutes} min`}>
            <div className="mb-2 flex gap-2">
              {[10, 15, 20, 30, 45].map((m) => (
                <button
                  key={m}
                  onClick={() => setMinutes(m)}
                  className={cn(
                    "flex-1 rounded-md py-1.5 text-sm font-medium",
                    minutes === m ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
            <Slider value={minutes} min={5} max={120} step={5} onChange={setMinutes} aria-label="Minutes" />
          </Field>

          <Field label="What did you work on? (comma separated)">
            <input
              value={worked}
              onChange={(e) => setWorked(e.target.value)}
              placeholder="C–G changes, Em, strumming"
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-accent"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Mood">
              <EmojiPick value={mood} onChange={setMood} />
            </Field>
            <Field label="Energy">
              <EmojiPick value={energy} onChange={setEnergy} />
            </Field>
          </div>

          <Field label="Date">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-accent"
            />
          </Field>

          <Button onClick={saveQuick} disabled={saved} className="w-full" size="lg">
            {saved ? <><Check size={18} /> Logged!</> : "Log session"}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg border border-accent/25 bg-accent/10 p-3 text-xs text-muted">
            <Sparkles size={15} className="shrink-0 text-accent" />
            Type or dictate freely. If AI is set up, it pulls out your time, songs, and BPMs automatically.
          </div>
          <textarea
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
            rows={6}
            placeholder="About 30 minutes tonight. Worked on C to G changes — getting cleaner. Started learning the intro to a song, strumming felt good around 80 bpm. F still a struggle."
            className="w-full resize-none rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-accent"
          />
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <Mic size={13} /> Tip: tap the mic on your phone keyboard to dictate after practice.
          </p>
          <Button onClick={saveJournal} disabled={parsing || saved || !journal.trim()} className="w-full" size="lg">
            {parsing ? (
              <><Loader2 size={18} className="animate-spin" /> Reading your notes…</>
            ) : saved ? (
              <><Check size={18} /> Logged!</>
            ) : (
              <><PenLine size={18} /> Save journal entry</>
            )}
          </Button>
        </div>
      )}
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{label}</div>
      {children}
    </div>
  );
}

function EmojiPick({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex justify-between">
      {MOODS.map((e, i) => (
        <button
          key={i}
          onClick={() => onChange(i + 1)}
          className={cn(
            "h-9 w-9 rounded-lg text-lg transition",
            value === i + 1 ? "scale-110 bg-surface-3" : "opacity-50 hover:opacity-100",
          )}
        >
          {e}
        </button>
      ))}
    </div>
  );
}
