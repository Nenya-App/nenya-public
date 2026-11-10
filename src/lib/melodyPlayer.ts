// Playing a melody of any length with a chosen pace and volume, a callback for the note being played, a stop, and the same sound written to a WAV file
// for download (docs/sound-from-colors-scope.md). Everything happens on the device: the file is made in the browser and goes nowhere.
// `null` entries are rests. The voices match the ones in audio.ts (soft, pure, bell, pluck, bowl).
import type { ScaleNote, Timbre } from './audio.ts';

export interface PlayOptions {
  /** Seconds from the start of one note to the start of the next (default 0.39, the original pace). */
  stepSeconds?: number;
  /** 0 to 1 (default 0.8). */
  volume?: number;
  timbre?: Timbre;
  /** Called as each note starts: its position in the list. */
  onNote?: (position: number) => void;
  onEnd?: () => void;
}

export const MIN_STEP = 0.2;
export const MAX_STEP = 1.2;
export const DEFAULT_STEP = 0.39;
export const TAIL_SECONDS = 1.5;

export const clampStep = (n: number): number => (Number.isFinite(n) ? Math.min(MAX_STEP, Math.max(MIN_STEP, n)) : DEFAULT_STEP);
export const clampVolume = (n: number): number => (Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0.8);

/** How long the melody lasts, in seconds, including the tail. */
export const melodyDuration = (count: number, stepSeconds: number = DEFAULT_STEP): number => Math.max(0, count) * clampStep(stepSeconds) + TAIL_SECONDS;

type Ctx = BaseAudioContext;

/** Schedules one note starting at time t on `dest`. The same shapes as the original single-note and melody playback. */
function scheduleNote(ctx: Ctx, dest: AudioNode, freq: number, t: number, timbre: Timbre): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  osc.frequency.value = freq;
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  if (timbre === 'bell') {
    filter.frequency.value = 4000;
    osc.type = 'sine';
    const mod = ctx.createOscillator();
    const modGain = ctx.createGain();
    mod.type = 'sine';
    mod.frequency.value = freq * 5;
    modGain.gain.value = freq * 6;
    mod.connect(modGain);
    modGain.connect(osc.frequency);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
    mod.start(t); osc.start(t); mod.stop(t + 1); osc.stop(t + 1);
  } else if (timbre === 'pluck') {
    filter.frequency.value = 2000;
    osc.type = 'sawtooth';
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.start(t); osc.stop(t + 0.2);
  } else if (timbre === 'bowl') {
    filter.frequency.value = 1200;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
    osc.start(t); osc.stop(t + 0.9);
  } else {
    filter.frequency.value = timbre === 'pure' ? 3000 : 2000;
    osc.type = timbre === 'pure' ? 'sine' : 'triangle';
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
    osc.start(t); osc.stop(t + 0.37);
  }
}

function scheduleAll(ctx: Ctx, indices: (number | null)[], scale: ScaleNote[], step: number, volume: number, timbre: Timbre): void {
  const master = ctx.createGain();
  master.gain.value = clampVolume(volume);
  master.connect(ctx.destination);
  indices.forEach((idx, i) => {
    if (idx === null || idx === undefined || !scale[idx]) return;
    scheduleNote(ctx, master, scale[idx].freq, i * step + 0.02, timbre);
  });
}

/** Plays the melody. Returns a function that stops it at once. If sound is unavailable it ends straight away. */
export function playSequence(indices: (number | null)[], scale: ScaleNote[], opts: PlayOptions = {}): () => void {
  const step = clampStep(opts.stepSeconds ?? DEFAULT_STEP);
  const timers: ReturnType<typeof setTimeout>[] = [];
  let ctx: AudioContext | null = null;
  let stopped = false;
  const finish = () => {
    if (stopped) return;
    stopped = true;
    timers.forEach(clearTimeout);
    try { ctx?.close(); } catch { /* already closed */ }
    opts.onEnd?.();
  };
  try {
    const Ctor = window.AudioContext || (window as any).webkitAudioContext;
    ctx = new Ctor();
    scheduleAll(ctx!, indices, scale, step, opts.volume ?? 0.8, opts.timbre ?? 'soft');
    indices.forEach((_, i) => { timers.push(setTimeout(() => { if (!stopped) opts.onNote?.(i); }, i * step * 1000)); });
    timers.push(setTimeout(finish, melodyDuration(indices.length, step) * 1000));
  } catch {
    opts.onEnd?.();
    stopped = true;
  }
  return finish;
}

/** 16-bit mono PCM WAV from samples in -1..1. */
export function encodeWav(samples: Float32Array, sampleRate: number): Uint8Array {
  const bytes = new Uint8Array(44 + samples.length * 2);
  const view = new DataView(bytes.buffer);
  const text = (at: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(at + i, s.charCodeAt(i)); };
  text(0, 'RIFF'); view.setUint32(4, 36 + samples.length * 2, true); text(8, 'WAVE'); text(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  text(36, 'data'); view.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, v < 0 ? v * 0x8000 : v * 0x7fff, true);
  }
  return bytes;
}

/** The melody as a WAV file (a Blob), rendered offline in the browser. Rejects if the browser cannot render audio. */
export async function renderWav(indices: (number | null)[], scale: ScaleNote[], opts: PlayOptions = {}): Promise<Blob> {
  const step = clampStep(opts.stepSeconds ?? DEFAULT_STEP);
  const sampleRate = 44100;
  const Offline = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
  const ctx = new Offline(1, Math.ceil(melodyDuration(indices.length, step) * sampleRate), sampleRate);
  scheduleAll(ctx, indices, scale, step, opts.volume ?? 0.8, opts.timbre ?? 'soft');
  const buffer = await ctx.startRendering();
  return new Blob([encodeWav(buffer.getChannelData(0), sampleRate).buffer as ArrayBuffer], { type: 'audio/wav' });
}
