// Chord prototype for the Sound gateway (staging only, VITE_SOUND_CHORDS=on): a color's three notes played together, three ways, so the owner
// can listen and decide. Nothing new is derived from the color: the chord is the same three notes the melody already uses.
//   raw       exactly the color's three notes, at once (honest; sometimes harsh)
//   softened  the nearest settled chord (major, minor, suspended or open fifth), Western scale only; the notes may move a little
//   drone     the color's notes one after another over a held low note (the scale's first note): fits scales that are not built on chords
// Everything is made on the device. Volume is shared out between the voices so a chord is not louder than a melody note.
import type { ScaleNote, Timbre } from './audio.ts';

export type Voicing = 'raw' | 'softened' | 'drone';

/** Chord shapes the softened voicing may land on, as semitones above a root. */
export const SETTLED_SHAPES: { name: string; steps: number[] }[] = [
  { name: 'major', steps: [0, 4, 7] },
  { name: 'minor', steps: [0, 3, 7] },
  { name: 'suspended second', steps: [0, 2, 7] },
  { name: 'suspended fourth', steps: [0, 5, 7] },
  { name: 'open fifth', steps: [0, 7, 12] },
];

const semitones = (freq: number): number => 12 * Math.log2(freq / 440) + 69; // as a MIDI number, possibly fractional

/** The settled chord nearest to three pitches (MIDI numbers): the shape and root that move the notes least, kept in the same register. */
export function nearestSettled(midis: number[]): { midis: number[]; shape: string; moved: number } {
  const sorted = [...midis].sort((a, b) => a - b);
  if (new Set(sorted.map((m) => Math.round(m) % 12)).size < 2) return { midis: sorted.map(Math.round), shape: 'single note', moved: 0 };
  let best = { midis: sorted.map(Math.round), shape: 'as played', moved: Infinity, cost: Infinity };
  const low = Math.floor(sorted[0]) - 12;
  for (let root = low; root <= Math.ceil(sorted[0]) + 1; root++) {
    for (const s of SETTLED_SHAPES) {
      // every chord tone in the two octaves around the notes
      const tones: number[] = [];
      for (let o = -12; o <= 24; o += 12) for (const st of s.steps) tones.push(root + st + o);
      const pick = sorted.map((m) => tones.reduce((a, b) => (Math.abs(b - m) < Math.abs(a - m) ? b : a)));
      // a chord needs at least two different pitch classes, and the shape's root must be among them
      // the result must be the whole shape (every one of its notes, in some octave), so its name is true
      const classes = new Set(pick.map((p) => ((p % 12) + 12) % 12));
      const want = new Set(s.steps.map((st) => (((root + st) % 12) + 12) % 12));
      if (classes.size !== want.size || [...want].some((c) => !classes.has(c))) continue;
      const moved = pick.reduce((sum, p, i) => sum + Math.abs(p - sorted[i]), 0);
      // a bare fifth fits almost anything, so it must win by more than a semitone and a half to be chosen over a full chord
      const cost = moved + (s.name === 'open fifth' ? 1.5 : 0);
      if (cost < best.cost) best = { midis: pick, shape: s.name, moved, cost };
    }
  }
  return { midis: best.midis, shape: best.shape, moved: best.moved };
}

const freqOf = (midi: number): number => 440 * Math.pow(2, (midi - 69) / 12);

/** The frequencies to sound for one color's three notes (scale indices) in a voicing, and a plain description. */
export function voice(indices: number[], scale: ScaleNote[], voicing: Voicing, westernScale: boolean): { freqs: number[]; drone: number | null; describe: string } {
  const freqs = indices.filter((i) => scale[i]).map((i) => scale[i].freq);
  if (voicing === 'softened' && westernScale && freqs.length === 3) {
    const s = nearestSettled(freqs.map(semitones));
    return { freqs: s.midis.map(freqOf), drone: null, describe: s.shape === 'single note' ? 'one note, so nothing to soften' : s.moved === 0 ? `already a ${s.shape} chord` : `softened to a ${s.shape} chord (notes moved ${s.moved} semitone${s.moved === 1 ? '' : 's'} in all)` };
  }
  if (voicing === 'drone') return { freqs, drone: scale[0] ? scale[0].freq / 2 : null, describe: 'the notes one after another over a held low note' };
  return { freqs, drone: null, describe: 'the three notes together, as the color gives them' };
}

const CHORD_SECONDS = 2.2;
const GAP_SECONDS = 0.35;

function waveFor(timbre: Timbre): OscillatorType {
  return timbre === 'pure' || timbre === 'bowl' || timbre === 'bell' ? 'sine' : 'triangle';
}

function sustained(ctx: BaseAudioContext, dest: AudioNode, freq: number, t: number, dur: number, level: number, type: OscillatorType): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 2200;
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(filter); filter.connect(gain); gain.connect(dest);
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(level, t + 0.12); // a soft start, never a click
  gain.gain.setValueAtTime(level, t + Math.max(0.2, dur - 0.6));
  gain.gain.exponentialRampToValueAtTime(0.0008, t + dur);
  osc.start(t); osc.stop(t + dur + 0.05);
}

/** Seconds a run of chords lasts. */
export const chordsDuration = (count: number): number => count * (CHORD_SECONDS + GAP_SECONDS);

/** Plays chords one after another (each a color's three notes). Returns a stop function. Volume is split across the voices. */
export function playChords(chords: number[][], scale: ScaleNote[], voicing: Voicing, opts: { volume?: number; timbre?: Timbre; westernScale: boolean; onChord?: (i: number) => void; onEnd?: () => void }): () => void {
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
    const master = ctx!.createGain();
    master.gain.value = Math.min(1, Math.max(0, opts.volume ?? 0.8));
    master.connect(ctx!.destination);
    const type = waveFor(opts.timbre ?? 'soft');
    chords.forEach((idx, c) => {
      const start = 0.05 + c * (CHORD_SECONDS + GAP_SECONDS);
      const v = voice(idx, scale, voicing, opts.westernScale);
      const voices = v.freqs.length + (v.drone ? 1 : 0);
      const level = 0.22 / Math.max(1, voices); // shared out, so a chord is about as loud as one melody note
      if (v.drone) sustained(ctx!, master, v.drone, start, CHORD_SECONDS, level * 1.2, 'sine');
      v.freqs.forEach((f, i) => {
        const offset = voicing === 'drone' ? i * 0.45 : i * 0.03; // drone: one after another; chord: a slight spread so each note is heard
        sustained(ctx!, master, f, start + offset, CHORD_SECONDS - offset, level, type);
      });
      timers.push(setTimeout(() => { if (!stopped) opts.onChord?.(c); }, start * 1000));
    });
    timers.push(setTimeout(finish, (chordsDuration(chords.length) + 0.3) * 1000));
  } catch {
    stopped = true;
    opts.onEnd?.();
  }
  return finish;
}

export const chordsOn = (): boolean => import.meta.env?.VITE_SOUND_CHORDS === 'on';
