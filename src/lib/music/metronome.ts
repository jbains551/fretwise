/**
 * Sample-accurate metronome using the Web Audio "lookahead" scheduling
 * technique (schedule ahead with setTimeout, fire with the audio clock).
 * Clicks are synthesized with short filtered oscillator blips.
 */

export interface MetronomeConfig {
  bpm: number;
  beatsPerMeasure: number; // e.g. 4
  subdivision: number; // notes per beat: 1, 2, 3, 4
  accentFirst: boolean;
  volume: number; // 0..1
}

type BeatCallback = (info: { beat: number; isAccent: boolean; isSub: boolean; time: number }) => void;

const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD = 0.12; // seconds

export class Metronome {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private nextNoteTime = 0;
  private current = 0; // running 16th-ish counter across the measure (in subdivisions)
  private onBeat?: BeatCallback;

  config: MetronomeConfig = {
    bpm: 80,
    beatsPerMeasure: 4,
    subdivision: 1,
    accentFirst: true,
    volume: 0.9,
  };

  running = false;

  setCallback(cb: BeatCallback) {
    this.onBeat = cb;
  }

  private ensure() {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.config.volume;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  private secondsPerSub() {
    return 60 / this.config.bpm / this.config.subdivision;
  }

  private scheduleClick(subInMeasure: number, time: number) {
    const ctx = this.ctx!;
    const isBeat = subInMeasure % this.config.subdivision === 0;
    const beatNumber = Math.floor(subInMeasure / this.config.subdivision);
    const isAccent = this.config.accentFirst && beatNumber === 0 && isBeat;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const freq = isAccent ? 1500 : isBeat ? 1000 : 720;
    osc.frequency.value = freq;
    osc.type = "square";

    const peak = (isBeat ? 1 : 0.45) * this.config.volume;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(peak, time + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);

    osc.connect(gain).connect(this.master!);
    osc.start(time);
    osc.stop(time + 0.06);

    if (this.onBeat) {
      const delay = Math.max(0, (time - ctx.currentTime) * 1000);
      setTimeout(() => {
        this.onBeat?.({ beat: beatNumber, isAccent, isSub: !isBeat, time });
      }, delay);
    }
  }

  private scheduler = () => {
    const ctx = this.ctx!;
    const totalSubs = this.config.beatsPerMeasure * this.config.subdivision;
    while (this.nextNoteTime < ctx.currentTime + SCHEDULE_AHEAD) {
      this.scheduleClick(this.current % totalSubs, this.nextNoteTime);
      this.nextNoteTime += this.secondsPerSub();
      this.current = (this.current + 1) % totalSubs;
    }
  };

  start() {
    const ctx = this.ensure();
    if (!ctx || this.running) return;
    this.running = true;
    this.current = 0;
    this.nextNoteTime = ctx.currentTime + 0.06;
    this.scheduler();
    this.timer = setInterval(this.scheduler, LOOKAHEAD_MS);
  }

  stop() {
    this.running = false;
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  toggle() {
    this.running ? this.stop() : this.start();
  }

  setBpm(bpm: number) {
    this.config.bpm = Math.max(20, Math.min(300, Math.round(bpm)));
  }

  update(patch: Partial<MetronomeConfig>) {
    this.config = { ...this.config, ...patch };
    if (this.master && patch.volume !== undefined) this.master.gain.value = patch.volume;
  }

  dispose() {
    this.stop();
    void this.ctx?.close();
    this.ctx = null;
  }
}
