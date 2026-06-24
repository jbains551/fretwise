"use client";

import { useMemo } from "react";
import { STANDARD_TUNING, STRING_LABELS, fretToMidi, noteName, pitchClass } from "@/lib/music/notes";
import { guitarAudio } from "@/lib/music/audio";
import { degreeFor, isRoot, scalePitchClasses, type ScaleDef } from "@/lib/music/scales";
import { cn } from "@/lib/utils";

const INLAYS = new Set([3, 5, 7, 9, 15, 17, 19, 21]);
const DOUBLE_INLAYS = new Set([12, 24]);

// Display strings top→bottom: high e (5) … low E (0), TAB orientation.
const ROWS = [5, 4, 3, 2, 1, 0];

export function Fretboard({
  rootPc,
  scale,
  mode = "scale",
  maxFret = 12,
  flats = false,
}: {
  rootPc?: number;
  scale?: ScaleDef;
  mode?: "scale" | "notes";
  maxFret?: number;
  flats?: boolean;
}) {
  const inScale = useMemo(
    () => (scale && rootPc !== undefined ? scalePitchClasses(rootPc, scale) : null),
    [scale, rootPc],
  );

  const frets = Array.from({ length: maxFret + 1 }, (_, i) => i);

  const playNote = (stringIndex: number, fret: number) => {
    guitarAudio.unlock();
    guitarAudio.pluck(fretToMidi(stringIndex, fret));
  };

  return (
    <div className="overflow-x-auto no-scrollbar">
      <div className="min-w-[640px] select-none">
        <div
          className="relative rounded-lg p-2"
          style={{
            background:
              "linear-gradient(180deg, hsl(var(--wood-1)), hsl(var(--wood-2)))",
          }}
        >
          {/* fret number row */}
          <div className="mb-1 flex pl-7">
            {frets.map((f) => (
              <div
                key={f}
                className="flex-1 text-center text-[10px] font-mono text-amber-100/50"
                style={{ flexGrow: f === 0 ? 0.6 : 1 }}
              >
                {f}
              </div>
            ))}
          </div>

          {ROWS.map((stringIndex) => (
            <div key={stringIndex} className="flex items-stretch">
              {/* string label */}
              <div className="flex w-7 items-center justify-center text-xs font-semibold text-amber-100/70">
                {STRING_LABELS[stringIndex]}
              </div>

              <div className="relative flex flex-1">
                {/* string line */}
                <div
                  className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 bg-string/70"
                  style={{ height: Math.max(1, (6 - stringIndex) * 0.6 + 0.6) }}
                />
                {frets.map((fret) => {
                  const midi = fretToMidi(stringIndex, fret);
                  const pc = pitchClass(midi);
                  const member = !inScale || inScale.has(pc);
                  const root = rootPc !== undefined && isRoot(midi, rootPc);
                  const show =
                    mode === "notes" ? true : inScale ? inScale.has(pc) : false;
                  const label =
                    mode === "notes"
                      ? noteName(midi, flats)
                      : scale && rootPc !== undefined
                        ? degreeFor(midi, rootPc, scale) ?? ""
                        : "";

                  return (
                    <button
                      key={fret}
                      onClick={() => playNote(stringIndex, fret)}
                      className={cn(
                        "relative flex h-9 flex-1 items-center justify-center md:h-10",
                        fret === 0
                          ? "border-r-[3px] border-amber-100/80"
                          : "border-r border-amber-950/40",
                      )}
                      style={{ flexGrow: fret === 0 ? 0.6 : 1 }}
                      aria-label={`${noteName(midi, flats)} on ${STRING_LABELS[stringIndex]} string, fret ${fret}`}
                    >
                      {/* inlay dots (drawn on the middle two strings' gap visually via center string) */}
                      {stringIndex === 2 && (INLAYS.has(fret) || DOUBLE_INLAYS.has(fret)) && (
                        <span className="pointer-events-none absolute -top-[2px] left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-amber-100/25" />
                      )}
                      {show && (label || mode === "notes") && (
                        <span
                          className={cn(
                            "z-10 grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold shadow md:h-7 md:w-7",
                            root
                              ? "bg-ember text-white ring-2 ring-amber-100/40"
                              : member
                                ? "bg-accent text-accent-fg"
                                : "bg-surface text-text",
                          )}
                        >
                          {label}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function playScaleAscending(rootPc: number, scale: ScaleDef, bpm = 80) {
  guitarAudio.unlock();
  // Build a simple one-octave-and-a-bit run on the low strings.
  const start = STANDARD_TUNING[0] + ((rootPc - pitchClass(STANDARD_TUNING[0]) + 12) % 12);
  const seq: number[] = [];
  for (const i of [...scale.intervals, 12]) seq.push(start + i);
  const spb = 60 / bpm;
  seq.forEach((m, i) => guitarAudio.pluck(m, 0.9, i * spb));
  // back down
  [...seq].reverse().slice(1).forEach((m, i) => guitarAudio.pluck(m, 0.8, (seq.length + i) * spb));
}
