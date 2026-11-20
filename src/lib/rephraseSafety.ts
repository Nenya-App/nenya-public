// The two device-side checks for rephrasing (docs/dyad-rephrase-scope.md, section 7). Both are phrase matching on the device that
// runs them (src/lib/safetyFlags.ts): they miss things and misfire, and a person who edits their own page can skip them. Neither
// result is ever sent anywhere: not to the other person (except the reader's pause, below), not to the server.
//
//   Before sending (the writer's device): INFORMS the writer, privately, of anything the check finds, with the usual resources.
//     It never blocks, and it never tells the other person. A person writing about their own safety, or about being afraid of
//     the person they are in the cell with, must not cause a notice on that person's screen.
//   On receiving (the reader's device): pauses the cell for both people only for danger to self or others at the stop tier.
//     Abuse-category findings are for the writer's private check alone; a reader's device never shows them.
import { detectFlag, type FlagCategory, type SafetyFlag } from './safetyFlags.ts';

/** The categories that may pause both people when the reader's device finds them. */
export const PAUSING: readonly FlagCategory[] = ['self-harm', 'self-injury', 'harm-others'];

/** The writer's private check over every piece of free text about to be sent. The most serious finding, or null. */
export function checkOutgoing(texts: readonly string[]): SafetyFlag | null {
  let best: SafetyFlag | null = null;
  for (const t of texts) {
    const f = t.trim() ? detectFlag(t) : null;
    if (f && (!best || (f.tier === 'stop' && best.tier !== 'stop'))) best = f;
  }
  return best;
}

/** The reader's check over a received message's free text: a stop-tier finding of danger to self or others, or null. */
export function incomingDanger(texts: readonly string[]): SafetyFlag | null {
  for (const t of texts) {
    const f = t.trim() ? detectFlag(t) : null;
    if (f && f.tier === 'stop' && PAUSING.includes(f.category)) return f;
  }
  return null;
}
