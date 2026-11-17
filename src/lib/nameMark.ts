// The mark's settings (owner, 2026-11-15; resting positions reset 2026-11-17), kept apart from the component so tests can read them. See src/app/components/NenyaMark.tsx.

export const nameMarkOn = (): boolean => import.meta.env?.VITE_NAME_MARK === 'on';

export type MarkFace = 'body' | 'lyric';

/** Where the turned e rests, per face (em): sideways, up, and the space after the pair. */
export const MARK_SETTINGS: Record<MarkFace, { nudge: number; rise: number; after: number }> = {
  lyric: { nudge: 0.145, rise: 0.03, after: 0.075 }, // Cormorant Garamond (owner, 2026-11-17)
  body: { nudge: 0.085, rise: 0.015, after: 0 }, // Manrope (owner, 2026-11-17)
};
/** The turn: counterclockwise half turn, 3.5 s after a 0.5 s wait, easing that settles. */
export const MARK_MOTION = { degrees: -180, durationMs: 3500, delayMs: 500, easing: 'cubic-bezier(.2, .8, .2, 1)' };

