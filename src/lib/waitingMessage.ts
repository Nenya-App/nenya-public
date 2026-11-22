// What the coach page says while a reply is on its way (2026-11-22). On a phone connection a reply can take many seconds, and three dots with nothing else read as
// "is it broken?". The words come in steps so a quick reply never flashes text, and a long wait gets plain, calm information. They claim no feeling and no
// promise: the site is waiting for a model, and says so kindly. Spoken to screen readers through the existing status region; the first step is for them alone.
export const WAIT_STEPS = [
  { afterSec: 0, text: 'A reply is on its way.' },
  { afterSec: 4, text: 'Taking time with your words.' },
  { afterSec: 12, text: 'Still on its way. This can take longer on a phone connection. You can take a slow breath while you wait.' },
  { afterSec: 30, text: 'This is taking longer than usual. You can keep waiting, or try sending again in a moment.' },
] as const;

/** The words for a wait of this many seconds. */
export const waitingText = (elapsedSec: number): string => [...WAIT_STEPS].reverse().find((s) => elapsedSec >= s.afterSec)!.text;

/** Whether the words are shown on screen yet (before that, only screen readers get them). */
export const waitingShown = (elapsedSec: number): boolean => elapsedSec >= WAIT_STEPS[1].afterSec;
