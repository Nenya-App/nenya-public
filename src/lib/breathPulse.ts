// When the "more below" button pulses: once at the end of every breath, in the colour of the breath that has just ended.
// Pure, so it is tested; the shared clock (src/lib/breathClock.ts) is read, never changed. All times are milliseconds.
import { COLOR_COUNT } from './breathClock.ts';

export interface BreathEnd {
  /** The breath that is running now (0 is the first from the shared start). */
  index: number;
  /** Milliseconds until it ends. Always more than zero. */
  delayMs: number;
  /** Which of the 96 breath colours that breath has (the same index the ring and gem use). */
  colorIndex: number;
}

/** The breath running at `nowMs`, and how long until it ends. `startMs` is the shared cycle start, `breathMs` one whole breath. */
export function nextBreathEnd(nowMs: number, startMs: number, breathMs: number): BreathEnd {
  const length = Number.isFinite(breathMs) && breathMs > 0 ? breathMs : 10000;
  const elapsed = Math.max(0, nowMs - startMs);
  const index = Math.floor(elapsed / length);
  return { index, delayMs: (index + 1) * length - elapsed, colorIndex: index % COLOR_COUNT };
}

/** "r, g, b" for a #rrggbb colour, for building rgba() strings. */
export function rgbTriplet(hex: string): string {
  const h = /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : '#e8a020';
  return `${parseInt(h.slice(1, 3), 16)}, ${parseInt(h.slice(3, 5), 16)}, ${parseInt(h.slice(5, 7), 16)}`;
}
