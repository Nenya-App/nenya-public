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
  octave: number;
  // undefined = natural. A plain string rather than a `sharp: boolean` so
  // any staff-positioned scale (not just 12-TET ones) can carry whatever
  // accidental mark it needs -- e.g. Rast's half-flat "½♭" below -- through
  // the same field MusicalStaff already knows how to render.
  accidentalLabel?: string;
}

export const CHROMATIC_NOTES: ChromaticNote[] = [];
for (let midi = FIRST_MIDI; midi <= LAST_MIDI; midi++) {
  const letterIndex = midi % 12;
  const octave = Math.floor(midi / 12) - 1;
  const letter = NOTE_LETTERS[letterIndex];
  const accidentalLabel = letter.includes('#') ? '#' : undefined;
  const freq = 440 * Math.pow(2, (midi - 69) / 12);
  CHROMATIC_NOTES.push({ name: `${letter}${octave}`, freq, midi, letter: letter.replace('#', ''), octave, accidentalLabel });
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

// A scale note that also carries a real staff position -- a letter line/
// space plus an optional accidental -- so MusicalStaff can place it
// without needing to know anything about which tonal system it came from.
// Only scales that actually map onto the seven natural letters (Western,
// Rast, Blues) get one of these; Slendro and Miyako-bushi use their own
// non-staff notations instead (see below).
export interface StaffNote extends ScaleNote {
  letter: string; // 'C'..'B'
  octave: number;
  accidentalLabel?: string; // e.g. '#' or '½♭'; undefined = natural
}

const C4_FREQ = 440 * Math.pow(2, (60 - 69) / 12);

// Generic N-tone-equal-division-of-the-octave scale builder -- every
// non-12-TET tonal system here (Rast's 24-TET quarter-tones, Slendro's
// 5-EDO, and whatever comes after) is "some number of equal steps per
// octave, labeled per degree," so this is the one algorithm all of them
// share rather than each reimplementing its own octave/frequency loop.
// `degreeSteps` are step counts (each step = 1/divisionsPerOctave of an
// octave) from the tonic, ascending, NOT including the octave-closing
// tonic repeat -- that closing note is generated separately below so its
// octave number is always derived from the real step count, never a loop
// variable (a real bug caught here during Rast's original implementation:
// the closing note was mislabeled with the wrong octave when the octave
// number came from the loop index instead).
//
// `formatName` lets each caller control how a degree label and its octave
// combine into a display name -- Rast just appends the octave number
// (the default), but Slendro's authentic cipher notation marks register
// with a dot above/below the digit instead of a trailing number, which a
// flat "label+octave" concatenation can't express.
function buildEqualDivisionScale(
  divisionsPerOctave: number,
  degreeSteps: number[],
  degreeLabels: string[],
  octaves: number = 2,
  formatName: (label: string, octaveOffset: number, octave: number) => string = (label, _octaveOffset, octave) => `${label}${octave}`
): ScaleNote[] {
  const notes: ScaleNote[] = [];
  for (let octaveOffset = 0; octaveOffset <= octaves; octaveOffset++) {
    const degreesToAdd = octaveOffset < octaves ? degreeSteps.length : 1; // stop at the closing tonic
    for (let d = 0; d < degreesToAdd; d++) {
      const steps = octaveOffset * divisionsPerOctave + degreeSteps[d];
      const octave = 4 + octaveOffset;
      const freq = C4_FREQ * Math.pow(2, steps / divisionsPerOctave);
      notes.push({ name: formatName(degreeLabels[d], octaveOffset, octave), freq });
    }
  }
  return notes;
}

// Same construction as above, but for scales that map onto real staff
// positions (a letter + an accidental) rather than an arbitrary label --
// Rast's degrees are real letters (C, D, E...) with a half-flat on two of
// them, so its staff form is this builder, not a separate reimplementation.
function buildEqualDivisionStaffScale(
  divisionsPerOctave: number,
  degreeSteps: number[],
  degreeLetters: string[],
  degreeAccidentals: (string | undefined)[],
  octaves: number = 2
): StaffNote[] {
  const notes: StaffNote[] = [];
  for (let octaveOffset = 0; octaveOffset <= octaves; octaveOffset++) {
    const degreesToAdd = octaveOffset < octaves ? degreeSteps.length : 1;
    for (let d = 0; d < degreesToAdd; d++) {
      const steps = octaveOffset * divisionsPerOctave + degreeSteps[d];
      const octave = 4 + octaveOffset;
      const freq = C4_FREQ * Math.pow(2, steps / divisionsPerOctave);
      const letter = degreeLetters[d];
      const accidentalLabel = degreeAccidentals[d];
      notes.push({ name: `${letter}${accidentalLabel ?? ''}${octave}`, freq, letter, octave, accidentalLabel });
    }
  }
  return notes;
}

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
// This is one maqam, not a general Arabic-music system.
//
// Rast's degrees are real staff letters (each note is "C," "D," etc.,
// just like Western notation) with a half-flat accidental on two of them
// -- unlike Slendro/Miyako-bushi below, that means Rast can reuse the
// same staff MusicalStaff already draws for Western notes, just with a
// different accidental symbol, rather than needing its own notation.
const RAST_DEGREE_STEPS = [0, 4, 7, 10, 14, 18, 21];
const RAST_DEGREE_LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const RAST_DEGREE_ACCIDENTALS: (string | undefined)[] = [undefined, undefined, '½♭', undefined, undefined, undefined, '½♭'];

export const RAST_STAFF_NOTES: StaffNote[] = buildEqualDivisionStaffScale(24, RAST_DEGREE_STEPS, RAST_DEGREE_LETTERS, RAST_DEGREE_ACCIDENTALS);
export const MAQAM_RAST_NOTES: ScaleNote[] = RAST_STAFF_NOTES.map((n) => ({ name: n.name, freq: n.freq }));
export const RAST_NOTE_NAMES = MAQAM_RAST_NOTES.map((n) => n.name);

// Slendro, the five-tone Javanese gamelan tuning. Real gamelans vary
// instrument-to-instrument with no universal standard (verified: measured
// Javanese slendro octaves range roughly 219-267 cents per step across
// different ensembles) -- five equal divisions of the octave (~240 cents
// each) is the standard theoretical approximation used to describe it in
// the abstract, the same kind of "conceptual map" simplification as
// Rast's 24-TET above, not a claim about any specific gamelan's real
// tuning. Degree labels use the real Kepatihan cipher notation (1 2 3 5 6
// -- degrees 4 and 7 are conventionally skipped so the numbering stays
// comparable to pelog's seven-tone system; this is authentic notation,
// not a typo).
//
// Cipher notation marks octave register with a dot above or below the
// digit rather than a trailing octave number (a plain "label+octave"
// concatenation would render our first two degrees as "14"/"24", which
// reads as fourteen/twenty-four -- genuinely ambiguous, not just
// inauthentic). This mirrors the real convention: a middle/reference
// octave carries no mark, the octave below gets a dot underneath, and the
// octave above gets a dot on top.
const SLENDRO_DEGREE_STEPS = [0, 1, 2, 3, 4];
const SLENDRO_DEGREE_LABELS = ['1', '2', '3', '5', '6'];
const COMBINING_DOT_BELOW = '̣';
const COMBINING_DOT_ABOVE = '̇';

function slendroCipherName(label: string, octaveOffset: number): string {
  if (octaveOffset === 0) return label + COMBINING_DOT_BELOW;
  if (octaveOffset >= 2) return label + COMBINING_DOT_ABOVE;
  return label;
}

export const SLENDRO_NOTES: ScaleNote[] = buildEqualDivisionScale(
  5,
  SLENDRO_DEGREE_STEPS,
  SLENDRO_DEGREE_LABELS,
  2,
  (label, octaveOffset) => slendroCipherName(label, octaveOffset)
);
export const SLENDRO_NOTE_NAMES = SLENDRO_NOTES.map((n) => n.name);

// Bhairav, Miyako-bushi, and the (minor) blues scale are all standard
// 12-tone-equal-temperament scales -- each just a fixed subset of pitch
// classes from the same chromatic grid CHROMATIC_NOTES already computes,
// unlike Rast/Slendro's non-12-TET tunings above. So rather than
// reimplementing 12-TET frequency math a third time, this filters the
// already-verified CHROMATIC_NOTES array down to each scale's degrees,
// reusing its exact frequencies (and, since CHROMATIC_NOTES entries are
// already ChromaticNote/StaffNote-shaped, its real staff positions too --
// which is what lets Blues below reuse MusicalStaff directly rather than
// needing its own notation). `degreeLabels`, if given, overrides the
// plain pitch-letter name per scale degree -- used by Bhairav so its
// picker shows real Sargam solfège instead of absolute pitch letters.
function subsetOfChromatic(pitchClassesFromC: number[], degreeLabels?: string[]): StaffNote[] {
  const wanted = new Set(pitchClassesFromC);
  const filtered = CHROMATIC_NOTES.filter((n) => wanted.has((n.midi - FIRST_MIDI) % 12));
  if (!degreeLabels) return filtered;
  return filtered.map((n, i) => ({ ...n, name: `${degreeLabels[i % pitchClassesFromC.length]}${n.octave}` }));
}

// Bhairav, the thaat (parent scale) most associated with dawn ragas in
// Hindustani classical music. Verified interval structure: Sa, komal Re,
// Ga, Ma, Pa, komal Dha, Ni -- semitone offsets from the tonic 0, 1, 4,
// 5, 7, 8, 11 (the two "komal"/flattened degrees, re and dha, are what
// give it its distinctive character against a plain major scale).
//
// Labeled with real Sargam solfège (S r G M P d N) rather than absolute
// pitch letters -- Hindustani notation is degree-relative, not staff-
// based, and lowercase marks a komal (flattened) degree, matching how
// it's actually written (conventionally an underline under the letter;
// simplified to case here since this is a plain-text label, not a staff).
const BHAIRAV_STEPS = [0, 1, 4, 5, 7, 8, 11];
const SARGAM_BHAIRAV_LABELS = ['S', 'r', 'G', 'M', 'P', 'd', 'N'];

export const BHAIRAV_NOTES: ScaleNote[] = subsetOfChromatic(BHAIRAV_STEPS, SARGAM_BHAIRAV_LABELS);
export const BHAIRAV_NOTE_NAMES = BHAIRAV_NOTES.map((n) => n.name);

// Miyako-bushi (also called the "in" scale), one of the two pentatonic
// scales most associated with Japanese koto and shamisen music. Verified
// interval structure: semitone offsets 0, 1, 5, 7, 8 from the tonic --
// a spare minor second and minor sixth above the root give it its
// characteristic sound, distinct from the more consonant "yo" scale.
//
// Kept with plain pitch-letter names here (used in review/PDF text and
// for playback) -- the interactive picker for this one is a numbered
// koto-string diagram (KotoStringDiagram.tsx) rather than a label-based
// row, since koto/shamisen music is traditionally notated by string
// number, not pitch name; that numbering is positional (string N = the
// Nth entry of this array) and doesn't need to live in the data itself.
export const MIYAKOBUSHI_NOTES: ScaleNote[] = subsetOfChromatic([0, 1, 5, 7, 8]);
export const MIYAKOBUSHI_NOTE_NAMES = MIYAKOBUSHI_NOTES.map((n) => n.name);

// The (minor) blues scale: the minor pentatonic (0, 3, 5, 7, 10) plus the
// "blue note" -- a flattened fifth (6 semitones, a tritone from the
// root) inserted as a chromatic passing tone between the fourth and
// fifth degrees. Verified six-note structure: 0, 3, 5, 6, 7, 10.
//
// Unlike Bhairav/Miyako-bushi, blues has no notation system of its own --
// it's conventionally just written on an ordinary staff -- so this stays
// as real staff-positioned notes (BLUES_STAFF_NOTES) for MusicalStaff to
// render directly, the same way Rast's staff notes work above.
export const BLUES_STAFF_NOTES: StaffNote[] = subsetOfChromatic([0, 3, 5, 6, 7, 10]);
export const BLUES_NOTES: ScaleNote[] = BLUES_STAFF_NOTES.map((n) => ({ name: n.name, freq: n.freq }));
export const BLUES_NOTE_NAMES = BLUES_NOTES.map((n) => n.name);

export type TonalSystem = 'western' | 'rast' | 'slendro' | 'bhairav' | 'miyakobushi' | 'blues';

const SCALES: Record<TonalSystem, ScaleNote[]> = {
  western: CHROMATIC_NOTES,
  rast: MAQAM_RAST_NOTES,
  slendro: SLENDRO_NOTES,
  bhairav: BHAIRAV_NOTES,
  miyakobushi: MIYAKOBUSHI_NOTES,
  blues: BLUES_NOTES,
};

const SCALE_NOTE_NAMES: Record<TonalSystem, string[]> = {
  western: WESTERN_NOTE_NAMES,
  rast: RAST_NOTE_NAMES,
  slendro: SLENDRO_NOTE_NAMES,
  bhairav: BHAIRAV_NOTE_NAMES,
  miyakobushi: MIYAKOBUSHI_NOTE_NAMES,
  blues: BLUES_NOTE_NAMES,
};

export function getScale(system: TonalSystem): ScaleNote[] {
  return SCALES[system];
}

export function getNoteNames(system: TonalSystem): string[] {
  return SCALE_NOTE_NAMES[system];
}

// The one place a tonal system's display name is spelled out -- shared by
// the Sound gateway's own toggle UI and the review/PDF report, so the name
// a melody was composed under and the name shown when reporting on it can
// never drift apart from each other.
export const TONAL_SYSTEM_LABELS: Record<TonalSystem, string> = {
  western: 'Western',
  rast: 'Arabic (Maqam Rast)',
  slendro: 'Javanese (Slendro)',
  bhairav: 'Hindustani (Bhairav)',
  miyakobushi: 'Japanese (Miyako-bushi)',
  blues: 'Blues',
};

export type Timbre = 'soft' | 'pure' | 'bell' | 'pluck' | 'bowl';

// Color<->melody translation is deliberately generic over scale length
// rather than hardcoded to CHROMATIC_NOTES: it maps an 8-bit channel value
// (0-255) onto whatever range of note indices [0, scaleLength) the active
// tonal system actually has, so the same algorithm produces a correct,
// in-range melody for Western (25 notes), Rast (15 notes), or any future
// tonal system without special-casing -- only the note count changes.

/** Maps a hex color's R/G/B channels to three note indices within [0, scaleLength). */
function hexToMelodyIndices(hex: string, scaleLength: number): number[] {
  const clean = hex.replace('#', '').padEnd(6, '0');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const max = scaleLength - 1;
  const toIndex = (v: number) => Math.min(max, Math.floor((v / 256) * scaleLength));
  return [toIndex(r), toIndex(g), toIndex(b)];
}

/** Combines two colors into a 6-note melody: first color's RGB, then second's. */
export function colorsToMelody(hex1: string, hex2: string, scaleLength: number = CHROMATIC_NOTES.length): number[] {
  return [...hexToMelodyIndices(hex1, scaleLength), ...hexToMelodyIndices(hex2, scaleLength)];
}

function indicesToHex(indices: number[], scaleLength: number): string {
  const max = scaleLength - 1;
  const toByte = (v: number) => Math.round((255 * v) / max);
  const toHexPair = (v: number) => v.toString(16).padStart(2, '0').toUpperCase();
  const r = toByte(indices[0] ?? 0);
  const g = toByte(indices[1] ?? 0);
  const b = toByte(indices[2] ?? 0);
  return `#${toHexPair(r)}${toHexPair(g)}${toHexPair(b)}`;
}

/** Reverses a 6-note melody back into its two seed colors. */
export function melodyToColors(indices: number[], scaleLength: number = CHROMATIC_NOTES.length): [string, string] {
  const filled = indices.map((v) => v ?? 0);
  return [indicesToHex(filled.slice(0, 3), scaleLength), indicesToHex(filled.slice(3, 6), scaleLength)];
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
