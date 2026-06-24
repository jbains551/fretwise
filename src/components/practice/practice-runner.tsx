"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Check, X, Volume2, Hand } from "lucide-react";
import type { PracticeSpec } from "@/lib/curriculum";
import { Button } from "@/components/ui/button";
import { Ring } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChordDiagram } from "@/components/music/chord-diagram";
import { Fretboard, playScaleAscending } from "@/components/music/fretboard";
import { MetronomePanel } from "@/components/metronome";
import { useMetronome } from "@/hooks/use-metronome";
import { getChord } from "@/lib/music/chords";
import { STANDARD_TUNING } from "@/lib/music/notes";
import { guitarAudio } from "@/lib/music/audio";
import { SCALES } from "@/lib/music/scales";
import { pitchClassFromName } from "@/lib/music/notes";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function PracticeRunner({
  spec,
  title,
  onClose,
}: {
  spec: PracticeSpec;
  title?: string;
  onClose?: () => void;
}) {
  const total = "seconds" in spec && spec.seconds ? spec.seconds : 120;
  const [remaining, setRemaining] = useState(total);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [changes, setChanges] = useState(0);
  const [chordIdx, setChordIdx] = useState(0);

  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    setRunning(false);
    if (tick.current) clearInterval(tick.current);
    tick.current = null;
  }, []);

  const finish = useCallback(() => {
    stop();
    setDone(true);
  }, [stop]);

  const start = useCallback(() => {
    if (done) return;
    setRunning(true);
    guitarAudio.unlock();
    tick.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          finish();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  }, [done, finish]);

  useEffect(() => () => stop(), [stop]);

  const reset = () => {
    stop();
    setRemaining(total);
    setDone(false);
    setChanges(0);
    setChordIdx(0);
  };

  const pct = ((total - remaining) / total) * 100;
  const mm = String(Math.floor(remaining / 60)).padStart(1, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-5">
      {title && <h2 className="font-display text-xl font-semibold">{title}</h2>}

      {/* Timer ring */}
      <Ring value={pct} size={120} stroke={8}>
        <div className="text-center">
          <div className="font-display text-2xl font-semibold tabular">
            {mm}:{ss}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-muted">
            {done ? "done" : running ? "go" : "ready"}
          </div>
        </div>
      </Ring>

      {/* Spec-specific body */}
      {!done && (
        <SpecBody
          spec={spec}
          running={running}
          changes={changes}
          setChanges={setChanges}
          chordIdx={chordIdx}
          setChordIdx={setChordIdx}
        />
      )}

      {done ? (
        <CompletionCard
          spec={spec}
          seconds={total}
          changes={changes}
          onAgain={reset}
          onClose={onClose}
        />
      ) : (
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="icon" onClick={reset} aria-label="Reset">
            <RotateCcw size={18} />
          </Button>
          <Button onClick={running ? stop : start} className="px-8">
            {running ? <Pause size={18} /> : <Play size={18} />}
            {running ? "Pause" : remaining === total ? "Start" : "Resume"}
          </Button>
          <Button variant="secondary" onClick={finish}>
            Finish
          </Button>
        </div>
      )}
    </div>
  );
}

/* ---------- per-spec interactive body ---------- */

function SpecBody({
  spec,
  running,
  changes,
  setChanges,
  chordIdx,
  setChordIdx,
}: {
  spec: PracticeSpec;
  running: boolean;
  changes: number;
  setChanges: (fn: (n: number) => number) => void;
  chordIdx: number;
  setChordIdx: (fn: (n: number) => number) => void;
}) {
  if (spec.kind === "changes") {
    const a = getChord(spec.chords[chordIdx % spec.chords.length]);
    const b = getChord(spec.chords[(chordIdx + 1) % spec.chords.length]);
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-6">
          {a && <ChordDiagram chord={a} size={120} />}
          <div className="text-2xl text-muted">→</div>
          {b && <ChordDiagram chord={b} size={120} playable={false} />}
        </div>
        <div className="text-center">
          <div className="font-display text-4xl font-semibold tabular text-accent">{changes}</div>
          <div className="text-xs uppercase tracking-widest text-muted">clean changes</div>
        </div>
        <Button
          size="lg"
          disabled={!running}
          onClick={() => {
            setChanges((n) => n + 1);
            setChordIdx((n) => n + 1);
          }}
          className="w-56"
        >
          <Hand size={18} /> I made the change
        </Button>
        <p className="max-w-xs text-center text-xs text-muted">
          Tap each time you land the next chord cleanly. Accuracy first — your count climbs as you improve.
        </p>
      </div>
    );
  }

  if (spec.kind === "strum") {
    return <StrumRound spec={spec} running={running} />;
  }

  if (spec.kind === "scale") {
    const scale = SCALES[spec.scaleId];
    const rootPc = pitchClassFromName(spec.root);
    return (
      <div className="w-full space-y-3">
        <div className="flex items-center justify-center gap-3">
          <Badge tone="accent">{spec.root} {scale?.short}</Badge>
          <Badge tone="muted">{spec.bpm} BPM</Badge>
          <Button variant="secondary" size="sm" onClick={() => playScaleAscending(rootPc, scale, spec.bpm)}>
            <Play size={14} /> Play
          </Button>
        </div>
        <Fretboard rootPc={rootPc} scale={scale} mode="scale" maxFret={12} />
      </div>
    );
  }

  if (spec.kind === "metronome") {
    return <MetronomePanel compact initialBpm={spec.bpm} />;
  }

  // free
  return (
    <p className="max-w-md text-center text-muted">{spec.prompt}</p>
  );
}

/* ---------- strum / progression player ---------- */

function StrumRound({ spec, running }: { spec: Extract<PracticeSpec, { kind: "strum" }>; running: boolean }) {
  const { beat, toggle, running: metRunning, config, setBpm } = useMetronome({ bpm: spec.bpm });
  const [bar, setBar] = useState(0);
  const chords = spec.chords ?? [];
  const prevBeat = useRef(-1);

  // sync metronome with the round's running state
  useEffect(() => {
    if (running && !metRunning) toggle();
    if (!running && metRunning) toggle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  // advance the chord each downbeat (beat 0)
  useEffect(() => {
    if (beat === 0 && prevBeat.current !== 0 && metRunning) {
      setBar((b) => b + 1);
    }
    prevBeat.current = beat;
  }, [beat, metRunning]);

  const cur = chords.length ? getChord(chords[bar % chords.length]) : undefined;
  const next = chords.length ? getChord(chords[(bar + 1) % chords.length]) : undefined;

  const tokens = spec.pattern.split(" ").filter(Boolean);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* beat dots */}
      <div className="flex gap-2">
        {Array.from({ length: config.beatsPerMeasure }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-3 w-3 rounded-full transition-all",
              metRunning && beat === i ? "scale-125 bg-accent" : "bg-surface-3",
            )}
          />
        ))}
      </div>

      {cur && (
        <div className="flex items-end gap-5">
          <div className="flex flex-col items-center">
            <ChordDiagram chord={cur} size={132} showName />
            <Badge tone="accent" className="mt-1">now</Badge>
          </div>
          {next && chords.length > 1 && (
            <div className="flex flex-col items-center opacity-60">
              <ChordDiagram chord={next} size={92} playable={false} />
              <Badge tone="muted" className="mt-1">next</Badge>
            </div>
          )}
        </div>
      )}

      {/* strum pattern */}
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {tokens.map((t, i) => (
          <span
            key={i}
            className={cn(
              "grid h-9 w-7 place-items-center rounded-md text-sm font-bold",
              t === "-" ? "text-muted/40" : t === "D" ? "bg-accent/15 text-accent" : "bg-info/15 text-info",
            )}
          >
            {t === "-" ? "·" : t}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs text-muted">
        <Volume2 size={13} /> D = down · U = up · {config.bpm} BPM
        <button onClick={() => setBpm(config.bpm - 5)} className="ml-2 rounded bg-surface-2 px-2 py-0.5">−5</button>
        <button onClick={() => setBpm(config.bpm + 5)} className="rounded bg-surface-2 px-2 py-0.5">+5</button>
      </div>
    </div>
  );
}

/* ---------- completion + logging ---------- */

function CompletionCard({
  spec,
  seconds,
  changes,
  onAgain,
  onClose,
}: {
  spec: PracticeSpec;
  seconds: number;
  changes: number;
  onAgain: () => void;
  onClose?: () => void;
}) {
  const addSession = useStore((s) => s.addSession);
  const ensureExercise = useStore((s) => s.ensureExercise);
  const [logged, setLogged] = useState(false);
  const minutes = Math.max(1, Math.round(seconds / 60));

  const summary = describeSpec(spec);
  const cpm = spec.kind === "changes" ? Math.round((changes / seconds) * 60) : null;

  const log = () => {
    const category =
      spec.kind === "changes" ? "chord_change" :
      spec.kind === "strum" ? "strumming" :
      spec.kind === "scale" ? "scale" : "other";
    const exId = ensureExercise(summary, category);
    addSession({
      durationMin: minutes,
      entryMethod: "quick_log",
      notes: `Practice round: ${summary}${cpm !== null ? ` — ${cpm} changes/min` : ""}`,
      exercises: [{ exerciseId: exId, minutes, bpm: "bpm" in spec ? spec.bpm : undefined }],
      tags: ["practice-round"],
    });
    setLogged(true);
  };

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-3 rounded-xl border border-success/30 bg-success/10 p-5 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-success text-white">
        <Check size={24} />
      </div>
      <div className="font-display text-lg font-semibold">Nice work!</div>
      <p className="text-sm text-muted">
        {summary}
        {cpm !== null && (
          <>
            {" "}— <span className="font-semibold text-text">{cpm}</span> changes/min
          </>
        )}
      </p>
      {logged ? (
        <Badge tone="success"><Check size={13} /> Logged {minutes}m to today</Badge>
      ) : (
        <div className="flex gap-2">
          <Button onClick={log}>Log {minutes}m</Button>
          <Button variant="secondary" onClick={onAgain}>
            <RotateCcw size={16} /> Again
          </Button>
        </div>
      )}
      {onClose && (
        <button onClick={onClose} className="mt-1 inline-flex items-center gap-1 text-sm text-muted hover:text-text">
          <X size={14} /> Close
        </button>
      )}
    </div>
  );
}

export function describeSpec(spec: PracticeSpec): string {
  switch (spec.kind) {
    case "changes":
      return `Changes: ${spec.chords.join(" ↔ ")}`;
    case "strum":
      return `Strumming: ${(spec.chords ?? []).join(" · ") || spec.pattern}`;
    case "scale":
      return `${spec.root} ${SCALES[spec.scaleId]?.short ?? "scale"}`;
    case "metronome":
      return `Metronome @ ${spec.bpm}`;
    case "free":
      return spec.prompt.length > 40 ? spec.prompt.slice(0, 40) + "…" : spec.prompt;
  }
}
