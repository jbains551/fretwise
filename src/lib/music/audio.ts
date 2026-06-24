/**
 * Plucked-string synth using the Karplus–Strong algorithm.
 *
 * Each note is rendered once into an AudioBuffer (cached by MIDI number) and
 * played back with a BufferSource. KS gives a warm, guitar-like pluck without
 * shipping any samples. The AudioContext is created lazily on first use so we
 * respect browser autoplay policies (call from a user gesture).
 */

import { midiToFreq } from "./notes";

class GuitarAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private cache = new Map<number, AudioBuffer>();
  private muted = false;

  private ensure(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.85;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  /** Prime the audio context from a user gesture. */
  unlock() {
    this.ensure();
  }

  setMuted(m: boolean) {
    this.muted = m;
  }

  private render(midi: number): AudioBuffer {
    const ctx = this.ctx!;
    const sr = ctx.sampleRate;
    const freq = midiToFreq(midi);
    const dur = 2.6;
    const length = Math.floor(sr * dur);
    const buffer = ctx.createBuffer(1, length, sr);
    const data = buffer.getChannelData(0);

    const N = Math.max(2, Math.round(sr / freq));
    const line = new Float32Array(N);
    for (let i = 0; i < N; i++) line[i] = Math.random() * 2 - 1;

    // Pluck position filter + string damping. Slightly higher damping for
    // higher notes so the top strings don't ring forever.
    const damping = 0.5 * (0.992 + 0.006 * Math.min(1, freq / 660));
    let idx = 0;
    for (let i = 0; i < length; i++) {
      const cur = line[idx];
      const next = line[(idx + 1) % N];
      const out = cur;
      line[idx] = (cur + next) * damping;
      idx = (idx + 1) % N;
      // gentle overall fade so the tail dies out cleanly
      data[i] = out * Math.exp((-3.0 * i) / length);
    }
    return buffer;
  }

  private bufferFor(midi: number): AudioBuffer {
    let buf = this.cache.get(midi);
    if (!buf) {
      buf = this.render(midi);
      this.cache.set(midi, buf);
    }
    return buf;
  }

  /** Play a single note. `when` is an offset in seconds. */
  pluck(midi: number, velocity = 1, when = 0) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const src = ctx.createBufferSource();
    src.buffer = this.bufferFor(midi);
    const gain = ctx.createGain();
    gain.gain.value = 0.0001;
    const t = ctx.currentTime + when;
    gain.gain.setValueAtTime(Math.max(0.05, velocity) * 0.9, t);
    src.connect(gain).connect(this.master);
    src.start(t);
    src.stop(t + 2.7);
  }

  /** Strum a chord — array of MIDI notes, low → high, slightly rolled. */
  strum(midis: number[], opts: { down?: boolean; spread?: number; velocity?: number } = {}) {
    if (this.muted) return;
    this.ensure();
    const { down = true, spread = 0.028, velocity = 0.9 } = opts;
    const order = down ? midis : [...midis].reverse();
    order.forEach((m, i) => this.pluck(m, velocity, i * spread));
  }
}

export const guitarAudio = new GuitarAudio();
