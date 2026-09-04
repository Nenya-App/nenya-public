// Sound gateway audio engine: maps colors to a 6-note melody and plays
// notes/melodies via the Web Audio API.
//
// Notes are drawn from a real two-octave Western chromatic scale (C4-C6,
// 25 notes including sharps) rather than a fixed 10-note pentatonic set --
// this is what makes an actual musical-staff picker meaningful instead of
// just relabeling the old bar-graph buttons. Frequencies are computed from
// the standard 12-tone equal-temperament formula (A4 = 440Hz) rather than
// hand-typed, so they're exact.
const NOTE_LETTERS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FIRST_MIDI = 60; // C4 ("middle C")
const LAST_MIDI = 84; // C6

export interface ChromaticNote {
  name: string; // e.g. "C#5"
  freq: number;
  midi: number;
  letter: string; // 'C'..'B', without octave, without sharp -- the natural this note sits on/near
  sharp: boolean;
  octave: number;
}

export const CHROMATIC_NOTES: ChromaticNote[] = [];
for (let midi = FIRST_MIDI; midi <= LAST_MIDI; midi++) {
  const letterIndex = midi % 12;
  const octave = Math.floor(midi / 12) - 1;
  const letter = NOTE_LETTERS[letterIndex];
  const sharp = letter.includes('#');
  const freq = 440 * Math.pow(2, (midi - 69) / 12);
  CHROMATIC_NOTES.push({ name: `${letter}${octave}`, freq, midi, letter: letter.replace('#', ''), sharp, octave });
}

export const WESTERN_NOTE_NAMES = CHROMATIC_NOTES.map((n) => n.name);
/** @deprecated use WESTERN_NOTE_NAMES -- kept as an alias for existing call sites */
export const NOTE_NAMES = WESTERN_NOTE_NAMES;

// Maqam Rast, the tonal system most commonly used to introduce Arabic
// maqam theory (and the one whose "neutral third" is the clearest example
// of what a quarter-tone actually sounds like). Verified interval
// structure: two Rast tetrachords (whole tone, neutral second, neutral
// second -- i.e. 4/3/3 quarter-tone steps), the second built a fifth above
// the first: C, D, E half-flat, F, G, A, B half-flat, C.
//
// Tuning uses 24-tone equal temperament (each step = 50 cents), the
// standard theoretical approximation used to teach and notate maqam music
// -- documented as a "conceptual map" real performance practice varies
// around, not a claim that this is exactly what a performer would play.
// This is one maqam, not a general Arabic-music system; more tonal systems
// are a real follow-up, not something this claims to cover.
export interface ScaleNote {
  name: string; // e.g. "E4 (half-flat)"
  freq: number;
}

const C4_FREQ = 440 * Math.pow(2, (60 - 69) / 12);
// Quarter-tone steps from each octave's C, for one Rast tetrachord+pentachord:
// C, D, E-half-flat, F, G, A, B-half-flat (the octave-completing C is the
// next octave's degree 0, not repeated here).
const RAST_DEGREE_STEPS = [0, 4, 7, 10, 14, 18, 21];
const RAST_DEGREE_LABELS = ['C', 'D', 'E½♭', 'F', 'G', 'A', 'B½♭'];

export const MAQAM_RAST_NOTES: ScaleNote[] = [];
// Two octaves (C4-C5, C5-C6) plus the final C6 -- octave number is derived
// from the actual quarter-step count, not a loop variable, so the closing
// note is correctly labeled C6 rather than inheriting the wrong octave.
for (let octaveOffset = 0; octaveOffset <= 2; octaveOffset++) {
  const degreesToAdd = octaveOffset < 2 ? RAST_DEGREE_STEPS.length : 1; // stop at C6 itself
  for (let d = 0; d < degreesToAdd; d++) {
    const quarterSteps = octaveOffset * 24 + RAST_DEGREE_STEPS[d];
    const octave = 4 + octaveOffset;
    const freq = C4_FREQ * Math.pow(2, quarterSteps / 24);
    MAQAM_RAST_NOTES.push({ name: `${RAST_DEGREE_LABELS[d]}${octave}`, freq });
  }
}

export const RAST_NOTE_NAMES = MAQAM_RAST_NOTES.map((n) => n.name);

export type TonalSystem = 'western' | 'rast';

export function getScale(system: TonalSystem): ScaleNote[] {
  return system === 'rast' ? MAQAM_RAST_NOTES : CHROMATIC_NOTES;
}

export function getNoteNames(system: TonalSystem): string[] {
  return system === 'rast' ? RAST_NOTE_NAMES : WESTERN_NOTE_NAMES;
}

export type Timbre = 'soft' | 'pure' | 'bell' | 'pluck' | 'bowl';

/** Maps a hex color's R/G/B channels to three note indices within CHROMATIC_NOTES. */
function hexToMelodyIndices(hex: string): number[] {
  const clean = hex.replace('#', '').padEnd(6, '0');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const max = CHROMATIC_NOTES.length - 1;
  const scale = (v: number) => Math.min(max, Math.floor((v / 256) * CHROMATIC_NOTES.length));
  return [scale(r), scale(g), scale(b)];
}

/** Combines two colors into a 6-note melody: first color's RGB, then second's. */
export function colorsToMelody(hex1: string, hex2: string): number[] {
  return [...hexToMelodyIndices(hex1), ...hexToMelodyIndices(hex2)];
}

function indicesToHex(indices: number[]): string {
  const max = CHROMATIC_NOTES.length - 1;
  const toByte = (v: number) => Math.round((255 * v) / max);
  const toHexPair = (v: number) => v.toString(16).padStart(2, '0').toUpperCase();
  const r = toByte(indices[0] ?? 0);
  const g = toByte(indices[1] ?? 0);
  const b = toByte(indices[2] ?? 0);
  return `#${toHexPair(r)}${toHexPair(g)}${toHexPair(b)}`;
}

/** Reverses a 6-note melody back into its two seed colors. */
export function melodyToColors(indices: number[]): [string, string] {
  const filled = indices.map((v) => v ?? 0);
  return [indicesToHex(filled.slice(0, 3)), indicesToHex(filled.slice(3, 6))];
}

export function isValidHex(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

function getAudioContext(): AudioContext {
  const Ctor = window.AudioContext || (window as any).webkitAudioContext;
  return new Ctor();
}

let currentTimbre: Timbre = 'soft';

export function setTimbre(timbre: Timbre) {
  currentTimbre = timbre;
}

/** Plays a single preview note (e.g. on hover/click in the note picker). */
export function playNote(noteIndex: number, scale: ScaleNote[] = CHROMATIC_NOTES) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    const t0 = ctx.currentTime;

    if (currentTimbre === 'bell') {
      filter.frequency.value = 4000;
      osc.type = 'sine';
      osc.frequency.value = scale[noteIndex].freq;
      const modOsc = ctx.createOscillator();
      const modGain = ctx.createGain();
      modOsc.type = 'sine';
      modOsc.frequency.value = scale[noteIndex].freq * 5;
      modGain.gain.value = scale[noteIndex].freq * 6;
      modOsc.connect(modGain);
      modGain.connect(osc.frequency);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(0.22, t0 + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 1.2);
      modOsc.start(t0);
      osc.start(t0);
      modOsc.stop(t0 + 1.3);
      osc.stop(t0 + 1.3);
      setTimeout(() => ctx.close(), 1500);
    } else if (currentTimbre === 'pluck') {
      filter.frequency.value = 2000;
      osc.type = 'sawtooth';
      osc.frequency.value = scale[noteIndex].freq;
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.3, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.2);
      osc.start(t0);
      osc.stop(t0 + 0.25);
      setTimeout(() => ctx.close(), 350);
    } else if (currentTimbre === 'bowl') {
      filter.frequency.value = 1200;
      osc.type = 'sine';
      osc.frequency.value = scale[noteIndex].freq;
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(0.18, t0 + 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 1.2);
      osc.start(t0);
      osc.stop(t0 + 1.3);
      setTimeout(() => ctx.close(), 1500);
    } else {
      filter.frequency.value = currentTimbre === 'pure' ? 3000 : 1800;
      osc.type = currentTimbre === 'pure' ? 'sine' : 'triangle';
      osc.frequency.value = scale[noteIndex].freq;
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(0.22, t0 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.45);
      osc.start(t0);
      osc.stop(t0 + 0.5);
      setTimeout(() => ctx.close(), 650);
    }
  } catch {
    // Web Audio unavailable -- fail silently, this is a non-essential embellishment
  }
}

/** Plays a full 6-note melody in sequence, staggered by 390ms each. */
export function playMelody(indices: (number | null)[], scale: ScaleNote[] = CHROMATIC_NOTES, onComplete?: () => void) {
  try {
    const ctx = getAudioContext();
    indices.forEach((noteIndex, i) => {
      if (noteIndex === null) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      const t = ctx.currentTime + 0.39 * i;

      if (currentTimbre === 'bell') {
        filter.frequency.value = 4000;
        osc.type = 'sine';
        osc.frequency.value = scale[noteIndex].freq;
        const modOsc = ctx.createOscillator();
        const modGain = ctx.createGain();
        modOsc.type = 'sine';
        modOsc.frequency.value = scale[noteIndex].freq * 5;
        modGain.gain.value = scale[noteIndex].freq * 6;
        modOsc.connect(modGain);
        modGain.connect(osc.frequency);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.18, t + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
        modOsc.start(t);
        osc.start(t);
        modOsc.stop(t + 1);
        osc.stop(t + 1);
      } else if (currentTimbre === 'pluck') {
        filter.frequency.value = 2000;
        osc.type = 'sawtooth';
        osc.frequency.value = scale[noteIndex].freq;
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        osc.start(t);
        osc.stop(t + 0.2);
      } else if (currentTimbre === 'bowl') {
        filter.frequency.value = 1200;
        osc.type = 'sine';
        osc.frequency.value = scale[noteIndex].freq;
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.15, t + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
        osc.start(t);
        osc.stop(t + 0.9);
      } else {
        filter.frequency.value = currentTimbre === 'pure' ? 3000 : 2000;
        osc.type = currentTimbre === 'pure' ? 'sine' : 'triangle';
        osc.frequency.value = scale[noteIndex].freq;
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.2, t + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
        osc.start(t);
        osc.stop(t + 0.37);
      }
    });
    const totalMs = 0.39 * indices.length * 1000 + 1500;
    setTimeout(() => {
      ctx.close();
      onComplete?.();
    }, totalMs);
  } catch {
    onComplete?.();
  }
}
