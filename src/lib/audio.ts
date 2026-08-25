// Sound gateway audio engine: maps colors to a 6-note pentatonic melody and
// plays notes/melodies via the Web Audio API.

export const PENTATONIC_FREQS = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25, 783.99, 880];
export const NOTE_NAMES = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5', 'A5'];

export type Timbre = 'soft' | 'pure' | 'bell' | 'pluck' | 'bowl';

/** Maps a hex color's R/G/B channels to three note indices (0-9 each). */
function hexToMelodyIndices(hex: string): number[] {
  const clean = hex.replace('#', '').padEnd(6, '0');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return [Math.min(9, Math.floor(r / 25.6)), Math.min(9, Math.floor(g / 25.6)), Math.min(9, Math.floor(b / 25.6))];
}

/** Combines two colors into a 6-note melody: first color's RGB, then second's. */
export function colorsToMelody(hex1: string, hex2: string): number[] {
  return [...hexToMelodyIndices(hex1), ...hexToMelodyIndices(hex2)];
}

function indicesToHex(indices: number[]): string {
  const toByte = (v: number) => Math.round((255 * v) / 9);
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
export function playNote(noteIndex: number) {
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
      osc.frequency.value = PENTATONIC_FREQS[noteIndex];
      const modOsc = ctx.createOscillator();
      const modGain = ctx.createGain();
      modOsc.type = 'sine';
      modOsc.frequency.value = PENTATONIC_FREQS[noteIndex] * 5;
      modGain.gain.value = PENTATONIC_FREQS[noteIndex] * 6;
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
      osc.frequency.value = PENTATONIC_FREQS[noteIndex];
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
      osc.frequency.value = PENTATONIC_FREQS[noteIndex];
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
      osc.frequency.value = PENTATONIC_FREQS[noteIndex];
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
export function playMelody(indices: (number | null)[], onComplete?: () => void) {
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
        osc.frequency.value = PENTATONIC_FREQS[noteIndex];
        const modOsc = ctx.createOscillator();
        const modGain = ctx.createGain();
        modOsc.type = 'sine';
        modOsc.frequency.value = PENTATONIC_FREQS[noteIndex] * 5;
        modGain.gain.value = PENTATONIC_FREQS[noteIndex] * 6;
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
        osc.frequency.value = PENTATONIC_FREQS[noteIndex];
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
        osc.frequency.value = PENTATONIC_FREQS[noteIndex];
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
        osc.frequency.value = PENTATONIC_FREQS[noteIndex];
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
