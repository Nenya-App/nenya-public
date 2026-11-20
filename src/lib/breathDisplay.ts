// How the breathing animation is shown (owner, 2026-11-19): a small saved choice of display style. Every style is drawn from the same shared clock (src/lib/breathClock.ts), so the picture, the
// counter and the tones stay in phase; nothing here has a clock of its own, and the ring's lock to the clock is untouched.
import { breathCounter, breathEnvelope, breathFractions, type BreathPhase, type BreathTiming } from './breathClock.ts';

export const DISPLAY_STYLES = ['gem', 'ring', 'circle', 'text'] as const;
export type DisplayStyle = (typeof DISPLAY_STYLES)[number];
export const DEFAULT_DISPLAY_STYLE: DisplayStyle = 'gem';

export const isDisplayStyle = (v: unknown): v is DisplayStyle => typeof v === 'string' && (DISPLAY_STYLES as readonly string[]).includes(v);

/** The names and one-line descriptions shown in the selector. */
export const DISPLAY_STYLE_INFO: Record<DisplayStyle, { name: string; description: string }> = {
  gem: { name: 'Gem with petals', description: 'The gem and its petals, with the glowing ring that grows and shrinks around it.' },
  ring: { name: 'Ring only', description: 'Just the glowing ring that grows as you breathe in and shrinks as you breathe out.' },
  circle: { name: 'Plain circle', description: 'One plain circle that grows as you breathe in and shrinks as you breathe out.' },
  text: { name: 'Words and count only', description: 'No picture: the phase and the count, as text.' },
};

/** Whether this style draws the gem at all, and so the gem may be shown (the visitor can also hide the gem on its own). */
export const styleHasGem = (style: DisplayStyle): boolean => style === 'gem';
/** Whether this style draws the colour-changing ring. */
export const styleHasRing = (style: DisplayStyle): boolean => style === 'gem' || style === 'ring';

/** Is the gem on screen? Only in the gem style, and only if the visitor has not hidden it. */
export const gemShown = (style: DisplayStyle, logoVisible: boolean): boolean => styleHasGem(style) && logoVisible;

/**
 * THE rule for the inner (and outer) orbs: they belong to the gem, so they show only when the gem shows and the orbit setting is on. They never render, animate or take focus on their own.
 * NenyaLogo applies this once for everything it draws, so no page can show orbs round a hidden gem.
 */
export const orbsVisible = (gemIsShown: boolean, orbitEnabled: boolean): boolean => gemIsShown && orbitEnabled;
/** The same rule from the display style: orbs for a given style, gem setting and orbit setting. */
export const orbsShownFor = (style: DisplayStyle, logoVisible: boolean, orbitEnabled: boolean): boolean => orbsVisible(gemShown(style, logoVisible), orbitEnabled);

const PHASE_WORD: Record<BreathPhase, string> = { i: 'Inhale', h: 'Hold', e: 'Exhale' };

/** The phase and count as text, read from the shared clock: "Inhale, 3". Used by the text style and as the visible caption under the others. */
export function breathText(elapsedMs: number, t: BreathTiming): { phase: BreathPhase; word: string; count: number; text: string } {
  const { count, phase } = breathCounter(elapsedMs, t);
  const word = PHASE_WORD[phase];
  return { phase, word, count, text: `${word}, ${count}` };
}

/** How big the plain circle is, 0.25 at rest to 1 at full inhale, from the same envelope as the ring. */
export function circleScale(elapsedMs: number, t: BreathTiming, minScale = 0.25): number {
  const cycle = t.ih + (t.hi || 0) + t.ex + (t.ho || 0);
  if (!(cycle > 0) || !Number.isFinite(elapsedMs)) return minScale;
  const p = (((elapsedMs % cycle) + cycle) % cycle) / cycle;
  return minScale + (1 - minScale) * breathEnvelope(p, breathFractions(t));
}

/** A description that does not change from second to second, for screen readers: what is drawn and how to follow it. */
export function styleSummary(style: DisplayStyle): string {
  switch (style) {
    case 'gem': return 'Breathing guide: a gem with a ring that grows as you breathe in, holds, then shrinks as you breathe out.';
    case 'ring': return 'Breathing guide: a ring that grows as you breathe in, holds, then shrinks as you breathe out.';
    case 'circle': return 'Breathing guide: a circle that grows as you breathe in, holds, then shrinks as you breathe out.';
    case 'text': return 'Breathing guide: the word for the current phase, inhale, hold or exhale, with its count.';
  }
}
