/** Note & interval math, standard guitar tuning. */

export const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

export const FLAT_NAMES = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
] as const;

export type PitchClass = number; // 0..11, 0 = C

/** Standard tuning, low E (6th string) → high E (1st string), as MIDI notes. */
export const STANDARD_TUNING = [40, 45, 50, 55, 59, 64]; // E2 A2 D3 G3 B3 E4
export const STRING_LABELS = ["E", "A", "D", "G", "B", "e"]; // low → high

export function pitchClass(midi: number): PitchClass {
  return ((midi % 12) + 12) % 12;
}

export function noteName(midi: number, flats = false): string {
  const pc = pitchClass(midi);
  return (flats ? FLAT_NAMES : NOTE_NAMES)[pc];
}

export function noteWithOctave(midi: number, flats = false): string {
  const octave = Math.floor(midi / 12) - 1;
  return `${noteName(midi, flats)}${octave}`;
}

/** MIDI note at a given string (0=low E) and fret. */
export function fretToMidi(stringIndex: number, fret: number): number {
  return STANDARD_TUNING[stringIndex] + fret;
}

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** Parse "C", "F#", "Bb" → pitch class. */
export function pitchClassFromName(name: string): PitchClass {
  const sharp = NOTE_NAMES.indexOf(name as (typeof NOTE_NAMES)[number]);
  if (sharp >= 0) return sharp;
  const flat = FLAT_NAMES.indexOf(name as (typeof FLAT_NAMES)[number]);
  if (flat >= 0) return flat;
  return 0;
}
