// The coach conversation's "quiet timeout": the page closes a conversation by itself after a stretch with no activity,
// warning first. The person picks the length before starting and can change it in the chat (it is their own boundary),
// or leave it open. It lives only in the page's memory and is not stored or sent anywhere.
//
// Why the choices stop at 20 minutes: the server's permission to continue a conversation (the ticket that comes back with
// each reply) lasts 30 minutes. Closing at 20 or less leaves time to still make a signed copy afterwards.

export const TICKET_MINUTES = 30; // keep in step with TICKET_TTL_MS in netlify/functions/coach.mts
export const TIMEOUT_CHOICES = [10, 15, 20] as const;
export type TimeoutChoice = (typeof TIMEOUT_CHOICES)[number] | 'open';
export const DEFAULT_TIMEOUT: TimeoutChoice = 15;

/** Leave-open conversations get one reminder when this much quiet has passed, before the server's 30 minutes run out. */
export const OPEN_REMINDER_MINUTES = 20;
/** The first warning comes with this many minutes left, the last one with one minute left. */
export const FIRST_WARNING_LEFT_MINUTES = 5;
export const LAST_WARNING_LEFT_MINUTES = 1;

export type QuietState =
  | { kind: 'fine' }
  | { kind: 'warn'; minutesLeft: number; last: boolean }
  | { kind: 'closed' }
  | { kind: 'open-reminder'; minutesQuiet: number };

const MIN = 60000;

/** What the page should be showing, given the chosen length and how long it has been quiet. */
export function quietState(choice: TimeoutChoice, quietMs: number): QuietState {
  const quiet = Math.max(0, quietMs);
  if (choice === 'open') {
    return quiet >= OPEN_REMINDER_MINUTES * MIN ? { kind: 'open-reminder', minutesQuiet: Math.floor(quiet / MIN) } : { kind: 'fine' };
  }
  const left = choice * MIN - quiet;
  if (left <= 0) return { kind: 'closed' };
  if (left <= LAST_WARNING_LEFT_MINUTES * MIN) return { kind: 'warn', minutesLeft: 1, last: true };
  if (left <= FIRST_WARNING_LEFT_MINUTES * MIN) return { kind: 'warn', minutesLeft: Math.ceil(left / MIN), last: false };
  return { kind: 'fine' };
}

export const describeChoice = (c: TimeoutChoice): string => (c === 'open' ? 'Leave open' : `${c} minutes`);
