/**
 * Chord shape library.
 *
 * `frets` and `fingers` are low-E → high-e (6 entries).
 *   fret:  null = muted (don't play), 0 = open string, N = fret number
 *   finger: 0 = open/none, 1=index … 4=pinky
 * `barre` describes a finger laid across several strings at one fret.
 */

export type ChordKind = "open" | "barre" | "power" | "seventh";

export interface Barre {
  fret: number;
  fromString: number; // low index
  toString: number; // high index
}

export interface ChordShape {
  id: string;
  name: string; // "C", "Am", "F"
  full: string; // "C major"
  frets: (number | null)[];
  fingers: (number | null)[];
  baseFret?: number; // lowest fret rendered (barre chords); default 1
  barres?: Barre[];
  kind: ChordKind;
  tip?: string;
}

export const CHORDS: Record<string, ChordShape> = {
  C: {
    id: "C", name: "C", full: "C major", kind: "open",
    frets: [null, 3, 2, 0, 1, 0], fingers: [null, 3, 2, 0, 1, 0],
    tip: "Keep your wrist low and arch your fingers so the open G and high E ring clear.",
  },
  A: {
    id: "A", name: "A", full: "A major", kind: "open",
    frets: [null, 0, 2, 2, 2, 0], fingers: [null, 0, 1, 2, 3, 0],
    tip: "Three fingers stack in the second fret — cram them in or learn the one-finger barre later.",
  },
  G: {
    id: "G", name: "G", full: "G major", kind: "open",
    frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3],
    tip: "Try the 3-4 fingering (middle+ring+pinky) so you can switch to C and D smoothly.",
  },
  E: {
    id: "E", name: "E", full: "E major", kind: "open",
    frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0],
    tip: "This same shape becomes every barre chord later — get it solid now.",
  },
  D: {
    id: "D", name: "D", full: "D major", kind: "open",
    frets: [null, null, 0, 2, 3, 2], fingers: [null, null, 0, 1, 3, 2],
    tip: "Only strum the top four strings. Keep that little triangle tight.",
  },
  Am: {
    id: "Am", name: "Am", full: "A minor", kind: "open",
    frets: [null, 0, 2, 2, 1, 0], fingers: [null, 0, 2, 3, 1, 0],
    tip: "It's the E shape moved over one string — notice the family resemblance.",
  },
  Em: {
    id: "Em", name: "Em", full: "E minor", kind: "open",
    frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0],
    tip: "The friendliest chord on the guitar. Two fingers, strum everything.",
  },
  Dm: {
    id: "Dm", name: "Dm", full: "D minor", kind: "open",
    frets: [null, null, 0, 2, 3, 1], fingers: [null, null, 0, 2, 3, 1],
    tip: "Top four strings only — that minor color is great for sad songs.",
  },
  E7: {
    id: "E7", name: "E7", full: "E dominant 7", kind: "seventh",
    frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0],
    tip: "Lift one finger off E and you've got E7 — a bluesy push toward A.",
  },
  A7: {
    id: "A7", name: "A7", full: "A dominant 7", kind: "seventh",
    frets: [null, 0, 2, 0, 2, 0], fingers: [null, 0, 1, 0, 2, 0],
    tip: "Two fingers, lots of jangle. Pairs perfectly with D and E.",
  },
  D7: {
    id: "D7", name: "D7", full: "D dominant 7", kind: "seventh",
    frets: [null, null, 0, 2, 1, 2], fingers: [null, null, 0, 2, 1, 3],
    tip: "That little zig-zag shape resolves beautifully back to G.",
  },
  G7: {
    id: "G7", name: "G7", full: "G dominant 7", kind: "seventh",
    frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1],
    tip: "G's cousin — the index on the high E gives it that ragtime sound.",
  },
  B7: {
    id: "B7", name: "B7", full: "B dominant 7", kind: "seventh",
    frets: [null, 2, 1, 2, 0, 2], fingers: [null, 2, 1, 3, 0, 4],
    tip: "Four fingers but worth it — it's the V chord in the key of E.",
  },
  Cadd9: {
    id: "Cadd9", name: "Cadd9", full: "C add 9", kind: "open",
    frets: [null, 3, 2, 0, 3, 3], fingers: [null, 2, 1, 0, 3, 4],
    tip: "A lush, modern C. Lives next door to G — great for strumming songs.",
  },
  Dsus4: {
    id: "Dsus4", name: "Dsus4", full: "D suspended 4", kind: "open",
    frets: [null, null, 0, 2, 3, 3], fingers: [null, null, 0, 1, 2, 3],
    tip: "Add your pinky to D for tension, lift it to release back to D.",
  },
  Dsus2: {
    id: "Dsus2", name: "Dsus2", full: "D suspended 2", kind: "open",
    frets: [null, null, 0, 2, 3, 0], fingers: [null, null, 0, 1, 2, 0],
    tip: "Lift the high finger off D for an airy, open sound.",
  },
  Asus2: {
    id: "Asus2", name: "Asus2", full: "A suspended 2", kind: "open",
    frets: [null, 0, 2, 2, 0, 0], fingers: [null, 0, 1, 2, 0, 0],
    tip: "Easier than A and dreamy — two fingers in the second fret.",
  },
  Em7: {
    id: "Em7", name: "Em7", full: "E minor 7", kind: "open",
    frets: [0, 2, 0, 0, 0, 0], fingers: [0, 1, 0, 0, 0, 0],
    tip: "One finger. Strum all six. A great resting place for beginners.",
  },
  Fmaj7: {
    id: "Fmaj7", name: "Fmaj7", full: "F major 7 (easy F)", kind: "open",
    frets: [null, null, 3, 2, 1, 0], fingers: [null, null, 3, 2, 1, 0],
    tip: "The stepping-stone to the full F barre. Lovely on its own, too.",
  },
  F: {
    id: "F", name: "F", full: "F major (barre)", kind: "barre", baseFret: 1,
    frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1],
    barres: [{ fret: 1, fromString: 0, toString: 5 }],
    tip: "Roll the index slightly onto its bony side and press near the fret. Everyone struggles here — that's normal.",
  },
  Bm: {
    id: "Bm", name: "Bm", full: "B minor (barre)", kind: "barre", baseFret: 2,
    frets: [null, 2, 4, 4, 3, 2], fingers: [null, 1, 3, 4, 2, 1],
    barres: [{ fret: 2, fromString: 1, toString: 5 }],
    tip: "An A-minor shape barred at the 2nd fret. The first barre chord most songs ask for.",
  },
  "F#m": {
    id: "F#m", name: "F#m", full: "F# minor (barre)", kind: "barre", baseFret: 2,
    frets: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1],
    barres: [{ fret: 2, fromString: 0, toString: 5 }],
    tip: "Em shape barred at the 2nd fret — full and moody.",
  },
  Bb: {
    id: "Bb", name: "Bb", full: "B♭ major (barre)", kind: "barre", baseFret: 1,
    frets: [null, 1, 3, 3, 3, 1], fingers: [null, 1, 2, 3, 4, 1],
    barres: [{ fret: 1, fromString: 1, toString: 5 }],
    tip: "An A-shape barre at the 1st fret. Common in folk and worship songs.",
  },
  E5: {
    id: "E5", name: "E5", full: "E power chord", kind: "power",
    frets: [0, 2, 2, null, null, null], fingers: [0, 1, 2, null, null, null],
    tip: "Just root and fifth — no major or minor. The backbone of rock.",
  },
};

export const OPEN_CHORD_IDS = [
  "Em", "Em7", "C", "G", "D", "A", "E", "Am", "Dm",
  "E7", "A7", "D7", "G7", "Cadd9", "Asus2", "Dsus2", "Dsus4", "Fmaj7",
];
export const BARRE_CHORD_IDS = ["F", "Bm", "F#m", "Bb"];

export function getChord(id: string): ChordShape | undefined {
  return CHORDS[id];
}
