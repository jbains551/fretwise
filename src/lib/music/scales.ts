/** Scale & mode definitions plus fretboard membership helpers. */

import { pitchClass } from "./notes";

export interface ScaleDef {
  id: string;
  name: string;
  short: string;
  intervals: number[]; // semitones from root
  degrees: string[]; // degree label per interval
  blurb: string;
}

export const SCALES: Record<string, ScaleDef> = {
  major: {
    id: "major", name: "Major (Ionian)", short: "maj",
    intervals: [0, 2, 4, 5, 7, 9, 11],
    degrees: ["1", "2", "3", "4", "5", "6", "7"],
    blurb: "Bright and happy — the foundation of Western music.",
  },
  minor: {
    id: "minor", name: "Natural Minor (Aeolian)", short: "min",
    intervals: [0, 2, 3, 5, 7, 8, 10],
    degrees: ["1", "2", "♭3", "4", "5", "♭6", "♭7"],
    blurb: "Darker and emotional — the relative minor of the major scale.",
  },
  majPent: {
    id: "majPent", name: "Major Pentatonic", short: "maj pent",
    intervals: [0, 2, 4, 7, 9],
    degrees: ["1", "2", "3", "5", "6"],
    blurb: "Five notes that always sound good. Great for country and pop solos.",
  },
  minPent: {
    id: "minPent", name: "Minor Pentatonic", short: "min pent",
    intervals: [0, 3, 5, 7, 10],
    degrees: ["1", "♭3", "4", "5", "♭7"],
    blurb: "The most-used scale in rock and blues. Start your soloing here.",
  },
  blues: {
    id: "blues", name: "Blues Scale", short: "blues",
    intervals: [0, 3, 5, 6, 7, 10],
    degrees: ["1", "♭3", "4", "♭5", "5", "♭7"],
    blurb: "Minor pentatonic plus the gritty ♭5 'blue note'.",
  },
  dorian: {
    id: "dorian", name: "Dorian Mode", short: "dorian",
    intervals: [0, 2, 3, 5, 7, 9, 10],
    degrees: ["1", "2", "♭3", "4", "5", "6", "♭7"],
    blurb: "Minor with a raised 6th — jazzy and Santana-flavored.",
  },
  mixolydian: {
    id: "mixolydian", name: "Mixolydian Mode", short: "mixo",
    intervals: [0, 2, 4, 5, 7, 9, 10],
    degrees: ["1", "2", "3", "4", "5", "6", "♭7"],
    blurb: "Major with a flat 7 — the sound of blues-rock and jam bands.",
  },
};

export const SCALE_LIST = Object.values(SCALES);

/** Pitch classes contained in a scale rooted at `rootPc`. */
export function scalePitchClasses(rootPc: number, scale: ScaleDef): Set<number> {
  return new Set(scale.intervals.map((i) => pitchClass(rootPc + i)));
}

/** Degree label for a given absolute pitch class, or null if not in scale. */
export function degreeFor(midi: number, rootPc: number, scale: ScaleDef): string | null {
  const rel = pitchClass(midi - rootPc);
  const idx = scale.intervals.indexOf(rel);
  return idx >= 0 ? scale.degrees[idx] : null;
}

export function isRoot(midi: number, rootPc: number): boolean {
  return pitchClass(midi) === pitchClass(rootPc);
}
