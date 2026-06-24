"use client";

import { Minus, Plus, Play, Pause, Hand } from "lucide-react";
import { useMetronome } from "@/hooks/use-metronome";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Segmented } from "@/components/ui/segmented";
import { cn } from "@/lib/utils";

function tempoName(bpm: number) {
  if (bpm < 60) return "Largo";
  if (bpm < 76) return "Adagio";
  if (bpm < 108) return "Andante";
  if (bpm < 120) return "Moderato";
  if (bpm < 168) return "Allegro";
  return "Presto";
}

export function MetronomePanel({
  compact = false,
  initialBpm,
}: {
  compact?: boolean;
  initialBpm?: number;
}) {
  const { running, beat, config, toggle, update, setBpm, tap } = useMetronome(
    initialBpm ? { bpm: initialBpm } : undefined,
  );

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Beat dots */}
      <div className="flex items-center gap-2.5">
        {Array.from({ length: config.beatsPerMeasure }).map((_, i) => {
          const active = running && beat === i;
          const isOne = i === 0 && config.accentFirst;
          return (
            <span
              key={i}
              className={cn(
                "rounded-full transition-all duration-100",
                isOne ? "h-4 w-4" : "h-3 w-3",
                active
                  ? isOne
                    ? "bg-ember scale-125"
                    : "bg-accent scale-125"
                  : "bg-surface-3",
              )}
            />
          );
        })}
      </div>

      {/* BPM display */}
      <div className="relative grid place-items-center">
        {running && (
          <span
            className="pointer-events-none absolute h-40 w-40 rounded-full border-2 border-accent/40"
            style={{ animation: `pulse-ring ${60 / config.bpm}s ease-out infinite` }}
          />
        )}
        <div className="text-center">
          <div className="font-display text-7xl font-semibold tabular leading-none md:text-8xl">
            {config.bpm}
          </div>
          <div className="mt-1 text-sm uppercase tracking-widest text-muted">
            BPM · {tempoName(config.bpm)}
          </div>
        </div>
      </div>

      {/* Transport */}
      <div className="flex items-center gap-3">
        <Button variant="secondary" size="icon" onClick={() => setBpm(config.bpm - 1)} aria-label="Slower">
          <Minus size={18} />
        </Button>
        <Button
          onClick={toggle}
          className="h-16 w-16 rounded-full"
          aria-label={running ? "Stop" : "Start"}
        >
          {running ? <Pause size={26} /> : <Play size={26} className="ml-0.5" />}
        </Button>
        <Button variant="secondary" size="icon" onClick={() => setBpm(config.bpm + 1)} aria-label="Faster">
          <Plus size={18} />
        </Button>
      </div>

      <div className="w-full max-w-sm px-2">
        <Slider value={config.bpm} min={40} max={220} onChange={setBpm} aria-label="Tempo" />
      </div>

      <button
        onClick={tap}
        className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:text-text active:scale-95 transition"
      >
        <Hand size={15} /> Tap tempo
      </button>

      {!compact && (
        <div className="grid w-full max-w-sm grid-cols-1 gap-4 pt-2">
          <Row label="Time signature">
            <Segmented
              value={config.beatsPerMeasure}
              onChange={(v) => update({ beatsPerMeasure: v })}
              options={[
                { label: "2/4", value: 2 },
                { label: "3/4", value: 3 },
                { label: "4/4", value: 4 },
                { label: "6/8", value: 6 },
              ]}
            />
          </Row>
          <Row label="Subdivision">
            <Segmented
              value={config.subdivision}
              onChange={(v) => update({ subdivision: v })}
              options={[
                { label: "♩", value: 1 },
                { label: "♫", value: 2 },
                { label: "3", value: 3 },
                { label: "4", value: 4 },
              ]}
            />
          </Row>
          <Row label="Accent beat 1">
            <button
              onClick={() => update({ accentFirst: !config.accentFirst })}
              className={cn(
                "relative h-7 w-12 rounded-full transition-colors",
                config.accentFirst ? "bg-accent" : "bg-surface-3",
              )}
              aria-pressed={config.accentFirst}
            >
              <span
                className={cn(
                  "absolute top-1 h-5 w-5 rounded-full bg-white transition-all",
                  config.accentFirst ? "left-6" : "left-1",
                )}
              />
            </button>
          </Row>
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm font-medium text-muted">{label}</span>
      {children}
    </div>
  );
}
