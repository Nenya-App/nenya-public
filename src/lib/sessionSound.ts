// The "sound" half of a session key. Each color's red, green, and blue values pick
// a note from a pentatonic scale, so two colors give a six-note signature. It is
// derived entirely from the colors, never stored, and played only when asked.

const FREQS = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25, 783.99, 880];
const NAMES = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5', 'A5'];
const STEP_SECONDS = 0.39;

/** Two random, mid-range colors: the temporary session key when none comes from the gateways. */
export function randomSessionKey(): { color1: string; color2: string } {
  const bytes = new Uint8Array(6);
  try {
    crypto.getRandomValues(bytes);
  } catch {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  // Kept away from near-black and near-white so the page stays readable.
  const hex = (b: Uint8Array) =>
    '#' + Array.from(b, (v) => (60 + (v % 160)).toString(16).padStart(2, '0')).join('').toUpperCase();
  return { color1: hex(bytes.slice(0, 3)), color2: hex(bytes.slice(3)) };
}

export const isHex = (c: string): boolean => /^#[0-9A-Fa-f]{6}$/.test(c);

/** Three scale positions (0-9) for one color. */
const positions = (hex: string): number[] => {
  const h = hex.replace('#', '').padEnd(6, '0');
  return [0, 2, 4].map((i) => Math.min(9, Math.floor(parseInt(h.slice(i, i + 2), 16) / 25.6)));
};

/** Note names for a color pair: three for each color. */
export function signatureNotes(hex1: string, hex2: string): { first: string[]; second: string[] } {
  return { first: positions(hex1).map((p) => NAMES[p]), second: positions(hex2).map((p) => NAMES[p]) };
}

/** Plays the signature once. Returns a function that stops it early. */
export function playSignature(hex1: string, hex2: string, onEnd?: () => void): () => void {
  const Ctx: typeof AudioContext | undefined =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) {
    onEnd?.();
    return () => {};
  }
  const ctx = new Ctx();
  const steps = [...positions(hex1), ...positions(hex2)];
  steps.forEach((p, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2000;
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.value = FREQS[p];
    const t = ctx.currentTime + STEP_SECONDS * i;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
    osc.start(t);
    osc.stop(t + 0.37);
  });
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    ctx.close().catch(() => {});
    onEnd?.();
  };
  const timer = window.setTimeout(finish, STEP_SECONDS * steps.length * 1000 + 500);
  return () => {
    window.clearTimeout(timer);
    finish();
  };
}
