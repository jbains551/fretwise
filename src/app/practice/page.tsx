"use client";

import { useState } from "react";
import { Repeat, Guitar, Music4, Timer, Plus, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PracticeRunner } from "@/components/practice/practice-runner";
import type { PracticeSpec } from "@/lib/curriculum";
import { OPEN_CHORD_IDS, CHORDS } from "@/lib/music/chords";
import { cn } from "@/lib/utils";

const PRESETS: { id: string; title: string; desc: string; icon: typeof Repeat; spec: PracticeSpec; tone: string }[] = [
  {
    id: "changes",
    title: "Chord Change Trainer",
    desc: "One-minute changes between two chords. Count clean switches, beat your record.",
    icon: Repeat,
    tone: "text-accent",
    spec: { kind: "changes", chords: ["C", "G"], seconds: 60 },
  },
  {
    id: "strum",
    title: "Strumming Workout",
    desc: "Play a 4-chord loop in time with the metronome and the D-DU-UDU pattern.",
    icon: Guitar,
    tone: "text-ember",
    spec: { kind: "strum", bpm: 70, pattern: "D - D U - U D U", chords: ["G", "D", "Em", "C"], seconds: 180 },
  },
  {
    id: "scale",
    title: "Scale Run",
    desc: "Run the A minor pentatonic up and down to a click. Build speed and accuracy.",
    icon: Music4,
    tone: "text-info",
    spec: { kind: "scale", root: "A", scaleId: "minPent", bpm: 70 },
  },
  {
    id: "warmup",
    title: "Metronome Warm-up",
    desc: "Chromatic 1-2-3-4 finger exercise. Just you and a steady click.",
    icon: Timer,
    tone: "text-success",
    spec: { kind: "metronome", bpm: 60 },
  },
];

export default function PracticePage() {
  const [active, setActive] = useState<{ spec: PracticeSpec; title: string } | null>(null);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Practice Rounds"
        subtitle="Short, focused drills. Each one logs to your tracker when you finish."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {PRESETS.map((p) => (
          <Card key={p.id} className="transition hover:border-accent/40">
            <CardBody className="flex h-full flex-col pt-5">
              <div className="mb-3 flex items-center gap-3">
                <div className={cn("grid h-10 w-10 place-items-center rounded-lg bg-surface-2", p.tone)}>
                  <p.icon size={20} />
                </div>
                <h3 className="font-display text-lg font-semibold">{p.title}</h3>
              </div>
              <p className="mb-4 flex-1 text-sm text-muted">{p.desc}</p>
              <Button onClick={() => setActive({ spec: p.spec, title: p.title })} className="w-full">
                Start
              </Button>
            </CardBody>
          </Card>
        ))}
      </div>

      <ChangeBuilder onLaunch={(spec) => setActive({ spec, title: "Chord Change Trainer" })} />

      <Dialog open={!!active} onClose={() => setActive(null)} className="sm:max-w-xl">
        {active && (
          <div className="pt-4">
            <PracticeRunner spec={active.spec} title={active.title} onClose={() => setActive(null)} />
          </div>
        )}
      </Dialog>
    </div>
  );
}

function ChangeBuilder({ onLaunch }: { onLaunch: (spec: PracticeSpec) => void }) {
  const [picked, setPicked] = useState<string[]>(["Em", "C"]);
  const [seconds, setSeconds] = useState(60);

  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length < 4 ? [...p, id] : p));

  return (
    <Card className="mt-6">
      <CardBody className="pt-5">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles size={18} className="text-accent" />
          <h3 className="font-display text-lg font-semibold">Build your own change drill</h3>
        </div>
        <p className="mb-3 text-sm text-muted">Pick 2–4 chords you want to switch between.</p>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {OPEN_CHORD_IDS.filter((id) => CHORDS[id]).map((id) => (
            <button
              key={id}
              onClick={() => toggle(id)}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-sm font-semibold transition-colors",
                picked.includes(id) ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted hover:text-text",
              )}
            >
              {CHORDS[id].name}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {[60, 90, 120].map((s) => (
              <button
                key={s}
                onClick={() => setSeconds(s)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium",
                  seconds === s ? "bg-surface-3 text-text" : "text-muted hover:text-text",
                )}
              >
                {s}s
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="muted">{picked.length} chords</Badge>
            <Button
              disabled={picked.length < 2}
              onClick={() => onLaunch({ kind: "changes", chords: picked, seconds })}
            >
              <Plus size={16} /> Launch drill
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
