// The Sound sliders edit a drawing of the actual sound wave of the melody (owner's comment sheet, 2026-11-18: "the idea should be that they edit visualizations of the actual sound waves of the generated melody").
// The melody is the person's own (their notes, in their scale). Each note is drawn as a short, real piece of its wave, the same 25 ms for every note, so a higher note shows more cycles in the same room. Pitch moves
// every note up or down (two octaves each way across the slider), Volume sets how tall the wave is, and the first timbre word chosen sets its shape (how much of the higher overtones it has). Pure, so the
// numbers are tested; src/app/components/SoundWave.tsx draws them. Not an audio render: it draws the wave the notes would make, it does not play it.

export interface WaveInput { freqs: (number | null)[]; pitch: number | null; volume: number | null; timbre: string | null }
export const NOTE_WINDOW_S = 0.025;
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

/** Transposition factor for the Pitch slider (0 deep bass to 100 high treble): 0.25 to 4, 1 in the middle; not set is 1. */
export const pitchFactor = (pitch: number | null): number => (pitch === null || !Number.isFinite(pitch) ? 1 : 2 ** ((clamp(pitch, 0, 100) - 50) / 25));
/** Height of the wave for the Volume slider (0 whisper to 100 roar): 0.1 to 1; not set is 0.55. */
export const volumeHeight = (volume: number | null): number => (volume === null || !Number.isFinite(volume) ? 0.55 : 0.1 + 0.9 * (clamp(volume, 0, 100) / 100));

/** The overtones a timbre word adds, as [harmonic, strength] pairs on top of the plain wave. Words it does not know give the plain wave. */
export function overtones(timbre: string | null): [number, number][] {
  const t = (timbre ?? '').toLowerCase();
  if (/bright|sharp|brassy|metal|shrill|piercing|buzz|harsh|nasal|reedy/.test(t)) return [[2, 0.5], [3, 0.4], [5, 0.25]];
  if (/warm|round|mellow|soft|smooth|velvet|dark|deep|hollow|breathy|gentle|rich/.test(t)) return [[2, 0.18]];
  if (/ring|bell|glass|chime|crystal/.test(t)) return [[2.76, 0.4], [5.4, 0.25]];
  return [];
}

export interface Wave { points: [number, number][]; noteSpans: [number, number][]; label: string }
/** The wave as points in a box 0..1 wide and -1..1 tall (up is positive), `samplesPerNote` points for each note, and where each note's piece starts and ends. */
export function waveOf(i: WaveInput, samplesPerNote = 160): Wave {
  const notes = i.freqs.filter((f): f is number => typeof f === 'number' && f > 0), f = pitchFactor(i.pitch), h = volumeHeight(i.volume), ot = overtones(i.timbre);
  const points: [number, number][] = [], noteSpans: [number, number][] = [];
  const norm = 1 + ot.reduce((a, [, s]) => a + s, 0);
  notes.forEach((hz, n) => {
    const start = points.length;
    for (let k = 0; k < samplesPerNote; k++) {
      const t = (k / (samplesPerNote - 1)) * NOTE_WINDOW_S, base = hz * f;
      let y = Math.sin(2 * Math.PI * base * t);
      for (const [m, s] of ot) y += s * Math.sin(2 * Math.PI * base * m * t);
      points.push([(n * samplesPerNote + k) / Math.max(1, notes.length * samplesPerNote - 1), (y / norm) * h]);
    }
    noteSpans.push([start, points.length - 1]);
  });
  return { points, noteSpans, label: waveWords(i, notes.length) };
}

const PITCH_WORDS = ['very low', 'low', 'middle', 'high', 'very high'], VOL_WORDS = ['a whisper', 'quiet', 'medium', 'loud', 'a roar'];
const lv = (v: number | null) => (v === null || !Number.isFinite(v) ? 2 : clamp(Math.round(v / 25), 0, 4));
/** The same drawing in words, for the text twin. */
export function waveWords(i: WaveInput, noteCount: number): string {
  if (noteCount === 0) return 'No melody yet, so there is no wave to show.';
  const shape = overtones(i.timbre).length ? (i.timbre ? `${i.timbre.toLowerCase()} shape with overtones` : '') : 'plain, even shape';
  return `Your ${noteCount} notes, ${PITCH_WORDS[lv(i.pitch)]} in pitch, ${VOL_WORDS[lv(i.volume)]} in volume, ${shape}.`;
}

/** The SVG path for a wave in a width by height box. */
export function wavePath(w: Wave, width: number, height: number): string {
  if (w.points.length === 0) return '';
  const mid = height / 2;
  return w.points.map(([x, y], k) => `${k === 0 ? 'M' : 'L'}${(x * width).toFixed(1)} ${(mid - y * (height / 2 - 4)).toFixed(1)}`).join(' ');
}
