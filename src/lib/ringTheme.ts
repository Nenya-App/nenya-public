// Which theme the breathing colors are chosen for (owner, 2026-11-26: switching between light and dark mid-breath keeps the color, to avoid a jump).
// The page changes theme at once; the breath's color follows from the next breath. A breath belongs to a theme by the time it started, so the ring, the
// gem and the "more below" button agree without timers of their own. Held in memory only; nothing is stored or sent.
import type { RingTheme } from './ringVisibility.ts';

export interface HeldTheme {
  /** The theme of breaths that started before `switchAt`, and of those that started from it on. */
  before: RingTheme;
  after: RingTheme;
  /** When the new theme's first breath starts (ms epoch). */
  switchAt: number;
}
export interface RingClock {
  start: number;
  breathMs: number;
}

export const themeForBreath = (held: HeldTheme, breathStartMs: number): RingTheme => (breathStartMs >= held.switchAt ? held.after : held.before);

/** What is held after the page's theme becomes `theme` at `now`. The same object when nothing changes. */
export function nextHeld(held: HeldTheme | null, theme: RingTheme, now: number, clock: RingClock | null): HeldTheme {
  if (held && theme === held.after) return held;
  if (!held || !clock || !(clock.breathMs > 0)) return { before: theme, after: theme, switchAt: 0 };
  const current = clock.start + Math.floor(Math.max(0, now - clock.start) / clock.breathMs) * clock.breathMs;
  return { before: themeForBreath(held, current), after: theme, switchAt: current + clock.breathMs };
}

let held: HeldTheme | null = null;
let clock: RingClock | null = null;
const listeners = new Set<() => void>();

/** The page's one breathing clock (useBreathRhythm in PortableBreath.tsx). */
export function setRingClock(start: number, breathMs: number): void {
  clock = { start, breathMs };
}
/** The page's theme (ThemeProvider.tsx). */
export function setRingTheme(theme: RingTheme, now: number = Date.now()): void {
  const next = nextHeld(held, theme, now, clock);
  if (next === held) return;
  held = next;
  listeners.forEach((l) => l());
}
export const getRingTheme = (): HeldTheme | null => held;
export function subscribeRingTheme(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
