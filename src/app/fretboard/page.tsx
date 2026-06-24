"use client";

import { useState } from "react";
import { Play, Music2, Grid3x3 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { Badge } from "@/components/ui/badge";
import { Fretboard, playScaleAscending } from "@/components/music/fretboard";
import { ChordDiagram } from "@/components/music/chord-diagram";
import { NOTE_NAMES } from "@/lib/music/notes";
import { SCALES, SCALE_LIST } from "@/lib/music/scales";
import { CHORDS, OPEN_CHORD_IDS, BARRE_CHORD_IDS } from "@/lib/music/chords";
import { cn } from "@/lib/utils";

type Tab = "explore" | "chords";
type ChordFilter = "open" | "seventh" | "barre" | "all";

export default function FretboardPage() {
  const [tab, setTab] = useState<Tab>("explore");
  const [root, setRoot] = useState(9); // A
  const [scaleId, setScaleId] = useState("minPent");
  const [mode, setMode] = useState<"scale" | "notes">("scale");
  const [filter, setFilter] = useState<ChordFilter>("open");

  const scale = SCALES[scaleId];

  const chordIds = (() => {
    if (filter === "open") return OPEN_CHORD_IDS.filter((id) => CHORDS[id].kind === "open");
    if (filter === "seventh") return Object.values(CHORDS).filter((c) => c.kind === "seventh").map((c) => c.id);
    if (filter === "barre") return BARRE_CHORD_IDS;
    return Object.keys(CHORDS);
  })();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Fretboard"
        subtitle="Explore scales on the neck and browse the chord library. Tap anything to hear it."
        action={
          <Segmented
            value={tab}
            onChange={setTab}
            options={[
              { label: "Explore", value: "explore" },
              { label: "Chords", value: "chords" },
            ]}
          />
        }
      />

      {tab === "explore" ? (
        <div className="space-y-4">
          <Card>
            <CardBody className="space-y-4 pt-5">
              <div className="flex flex-wrap items-center gap-3">
                <Segmented
                  value={mode}
                  onChange={setMode}
                  options={[
                    { label: "Scale", value: "scale" },
                    { label: "All notes", value: "notes" },
                  ]}
                />
                {mode === "scale" && (
                  <Button variant="secondary" onClick={() => playScaleAscending(root, scale)}>
                    <Play size={16} /> Play scale
                  </Button>
                )}
              </div>

              {/* Root picker */}
              <div>
                <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted">Root note</div>
                <div className="flex flex-wrap gap-1.5">
                  {NOTE_NAMES.map((n, pc) => (
                    <button
                      key={n}
                      onClick={() => setRoot(pc)}
                      className={cn(
                        "h-9 min-w-9 rounded-md px-2 text-sm font-semibold transition-colors",
                        root === pc ? "bg-ember text-white" : "bg-surface-2 text-muted hover:text-text",
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {mode === "scale" && (
                <div>
                  <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted">Scale</div>
                  <div className="flex flex-wrap gap-1.5">
                    {SCALE_LIST.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setScaleId(s.id)}
                        className={cn(
                          "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                          scaleId === s.id ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted hover:text-text",
                        )}
                      >
                        {s.short}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          <Card className="p-3">
            <Fretboard rootPc={root} scale={scale} mode={mode} maxFret={12} />
          </Card>

          {mode === "scale" && (
            <Card>
              <CardBody className="flex items-start gap-3 pt-5">
                <Music2 className="mt-0.5 shrink-0 text-accent" size={20} />
                <div>
                  <div className="font-display text-lg font-semibold">
                    {NOTE_NAMES[root]} {scale.name}
                  </div>
                  <p className="text-sm text-muted">{scale.blurb}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {scale.degrees.map((d) => (
                      <Badge key={d} tone="muted">{d}</Badge>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <Segmented
            value={filter}
            onChange={setFilter}
            options={[
              { label: "Open", value: "open" },
              { label: "7ths", value: "seventh" },
              { label: "Barre", value: "barre" },
              { label: "All", value: "all" },
            ]}
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {chordIds.map((id) => (
              <Card key={id} className="grid place-items-center p-3">
                <ChordDiagram chord={CHORDS[id]} size={120} />
              </Card>
            ))}
          </div>
          <p className="flex items-center gap-2 text-sm text-muted">
            <Grid3x3 size={15} /> Tap any chord to hear it strummed.
          </p>
        </div>
      )}
    </div>
  );
}
