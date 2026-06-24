"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Metronome, type MetronomeConfig } from "@/lib/music/metronome";

export function useMetronome(initial?: Partial<MetronomeConfig>) {
  const engineRef = useRef<Metronome | null>(null);
  if (!engineRef.current && typeof window !== "undefined") {
    engineRef.current = new Metronome();
    if (initial) engineRef.current.update(initial);
  }

  const [running, setRunning] = useState(false);
  const [beat, setBeat] = useState(-1);
  const [config, setConfig] = useState<MetronomeConfig>(
    () => engineRef.current?.config ?? {
      bpm: initial?.bpm ?? 80,
      beatsPerMeasure: initial?.beatsPerMeasure ?? 4,
      subdivision: initial?.subdivision ?? 1,
      accentFirst: initial?.accentFirst ?? true,
      volume: initial?.volume ?? 0.9,
    },
  );

  useEffect(() => {
    const eng = engineRef.current;
    if (!eng) return;
    eng.setCallback(({ beat, isSub }) => {
      if (!isSub) setBeat(beat);
    });
    return () => eng.dispose();
  }, []);

  const start = useCallback(() => {
    engineRef.current?.start();
    setRunning(true);
  }, []);

  const stop = useCallback(() => {
    engineRef.current?.stop();
    setRunning(false);
    setBeat(-1);
  }, []);

  const toggle = useCallback(() => {
    const eng = engineRef.current;
    if (!eng) return;
    if (eng.running) {
      eng.stop();
      setRunning(false);
      setBeat(-1);
    } else {
      eng.start();
      setRunning(true);
    }
  }, []);

  const update = useCallback((patch: Partial<MetronomeConfig>) => {
    engineRef.current?.update(patch);
    setConfig((c) => ({ ...c, ...patch }));
  }, []);

  const setBpm = useCallback((bpm: number) => {
    update({ bpm: Math.max(20, Math.min(300, Math.round(bpm))) });
  }, [update]);

  // Tap tempo
  const tapsRef = useRef<number[]>([]);
  const tap = useCallback(() => {
    const now = performance.now();
    const taps = tapsRef.current.filter((t) => now - t < 2500);
    taps.push(now);
    tapsRef.current = taps;
    if (taps.length >= 2) {
      const intervals = taps.slice(1).map((t, i) => t - taps[i]);
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const bpm = Math.round(60000 / avg);
      if (bpm >= 20 && bpm <= 300) setBpm(bpm);
    }
  }, [setBpm]);

  return { running, beat, config, start, stop, toggle, update, setBpm, tap };
}
