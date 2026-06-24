"use client";

import { useMemo } from "react";
import type { Session } from "@/lib/types";
import { localDateKey } from "@/lib/utils";

/** Minutes practiced per day over the last `days` days. */
export function PracticeBars({ sessions, days = 14 }: { sessions: Session[]; days?: number }) {
  const data = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of sessions) {
      const k = localDateKey(new Date(s.startedAt));
      map.set(k, (map.get(k) ?? 0) + (s.durationMin ?? 0));
    }
    const out: { key: string; label: string; dow: string; minutes: number }[] = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const k = localDateKey(d);
      out.push({
        key: k,
        label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        dow: d.toLocaleDateString(undefined, { weekday: "narrow" }),
        minutes: map.get(k) ?? 0,
      });
    }
    return out;
  }, [sessions, days]);

  const max = Math.max(30, ...data.map((d) => d.minutes));

  return (
    <div className="flex h-40 items-end gap-1.5">
      {data.map((d) => {
        const h = (d.minutes / max) * 100;
        return (
          <div key={d.key} className="group flex flex-1 flex-col items-center gap-1">
            <div className="relative flex h-full w-full items-end">
              <div
                className="w-full rounded-t bg-accent/80 transition-all group-hover:bg-accent"
                style={{ height: `${Math.max(d.minutes ? 4 : 0, h)}%` }}
                title={`${d.minutes} min`}
              />
            </div>
            <span className="text-[9px] text-muted">{d.dow}</span>
          </div>
        );
      })}
    </div>
  );
}

/** Tiny inline sparkline for per-song BPM progression. */
export function Sparkline({ points, width = 80, height = 24 }: { points: number[]; width?: number; height?: number }) {
  if (points.length < 2) return <span className="text-xs text-muted">—</span>;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = width / (points.length - 1);
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${i * step} ${height - ((p - min) / range) * height}`)
    .join(" ");
  return (
    <svg width={width} height={height} className="overflow-visible">
      <path d={path} fill="none" stroke="hsl(var(--accent))" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
