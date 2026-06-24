"use client";

import { useMemo } from "react";
import { Volume2 } from "lucide-react";
import type { ChordShape } from "@/lib/music/chords";
import { STANDARD_TUNING } from "@/lib/music/notes";
import { guitarAudio } from "@/lib/music/audio";
import { cn } from "@/lib/utils";

const STRINGS = 6;

export function ChordDiagram({
  chord,
  frets: fretCount = 5,
  size = 130,
  showName = true,
  playable = true,
  className,
}: {
  chord: ChordShape;
  frets?: number;
  size?: number;
  showName?: boolean;
  playable?: boolean;
  className?: string;
}) {
  const base = chord.baseFret ?? 1;
  const padX = size * 0.14;
  const padTop = size * 0.2;
  const padBottom = size * 0.08;
  const w = size;
  const h = size * 1.12;
  const gridW = w - padX * 2;
  const gridH = h - padTop - padBottom;
  const stringGap = gridW / (STRINGS - 1);
  const fretGap = gridH / fretCount;

  const midis = useMemo(
    () =>
      chord.frets
        .map((f, i) => (f === null ? null : STANDARD_TUNING[i] + f))
        .filter((m): m is number => m !== null),
    [chord],
  );

  const play = () => {
    guitarAudio.unlock();
    guitarAudio.strum(midis, { spread: 0.035 });
  };

  return (
    <div className={cn("inline-flex flex-col items-center gap-1.5", className)}>
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        className={cn(playable && "cursor-pointer")}
        onClick={playable ? play : undefined}
        role={playable ? "button" : undefined}
        aria-label={playable ? `Play ${chord.full}` : chord.full}
      >
        {/* nut (only when starting at fret 1) or base-fret label */}
        {base === 1 ? (
          <rect x={padX} y={padTop - 4} width={gridW} height={4} rx={1} className="fill-text" />
        ) : (
          <text
            x={padX - 6}
            y={padTop + fretGap * 0.7}
            textAnchor="end"
            className="fill-muted font-mono"
            fontSize={size * 0.1}
          >
            {base}fr
          </text>
        )}

        {/* frets */}
        {Array.from({ length: fretCount + 1 }).map((_, i) => (
          <line
            key={`f${i}`}
            x1={padX}
            y1={padTop + i * fretGap}
            x2={padX + gridW}
            y2={padTop + i * fretGap}
            className="stroke-border"
            strokeWidth={1}
          />
        ))}

        {/* strings */}
        {Array.from({ length: STRINGS }).map((_, i) => (
          <line
            key={`s${i}`}
            x1={padX + i * stringGap}
            y1={padTop}
            x2={padX + i * stringGap}
            y2={padTop + gridH}
            className="stroke-border"
            strokeWidth={1}
          />
        ))}

        {/* barres */}
        {chord.barres?.map((b, i) => {
          const rel = b.fret - base + 1;
          const cy = padTop + (rel - 0.5) * fretGap;
          const x1 = padX + b.fromString * stringGap;
          const x2 = padX + b.toString * stringGap;
          return (
            <rect
              key={`b${i}`}
              x={x1 - stringGap * 0.28}
              y={cy - fretGap * 0.28}
              width={x2 - x1 + stringGap * 0.56}
              height={fretGap * 0.56}
              rx={fretGap * 0.28}
              className="fill-accent"
            />
          );
        })}

        {/* open / muted markers + finger dots */}
        {chord.frets.map((f, i) => {
          const x = padX + i * stringGap;
          if (f === null) {
            return (
              <text key={`m${i}`} x={x} y={padTop - 8} textAnchor="middle" className="fill-muted" fontSize={size * 0.11}>
                ×
              </text>
            );
          }
          if (f === 0) {
            return (
              <circle key={`o${i}`} cx={x} cy={padTop - 11} r={size * 0.035} className="fill-none stroke-muted" strokeWidth={1.4} />
            );
          }
          // skip dots that belong to a barre's anchor fret (already drawn)
          const onBarre = chord.barres?.some((b) => b.fret === f && i >= b.fromString && i <= b.toString);
          const rel = f - base + 1;
          const cy = padTop + (rel - 0.5) * fretGap;
          const finger = chord.fingers[i];
          if (onBarre && finger === 1) return null;
          return (
            <g key={`d${i}`}>
              <circle cx={x} cy={cy} r={size * 0.052} className="fill-accent" />
              {finger ? (
                <text x={x} y={cy} textAnchor="middle" dominantBaseline="central" className="fill-accent-fg font-semibold" fontSize={size * 0.07}>
                  {finger}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>

      {showName && (
        <div className="flex items-center gap-1.5">
          <span className="font-display text-base font-semibold">{chord.name}</span>
          {playable && <Volume2 size={13} className="text-muted" />}
        </div>
      )}
    </div>
  );
}
