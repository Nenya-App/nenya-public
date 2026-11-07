// Plain daily totals: how many times a named event happened today. Numbers only, with no information about who
// produced them. Event names come from a fixed list in this file, so nothing a visitor sends can become one.
// One key per event per day, so two events never contend for the same write.
import { capDay, type CounterStore } from './dailyCap.ts';

/** Why a coach turn was refused. A code, never message text. */
export const BLOCK_REASONS = ['manipulation', 'context', 'crisis', 'cap', 'ip'] as const;

export const FIXED_EVENTS = [
  'coach.turn.sent', // a well-formed message reached the function
  'coach.turn.answered', // the message went to the model and a reply came back
  'coach.conversation.started', // a first exchange was accepted
  'coach.conversation.finished', // the last exchange (the fifth) was answered
] as const;

export function isKnownEvent(name: string): boolean {
  if ((FIXED_EVENTS as readonly string[]).includes(name)) return true;
  const prefix = 'coach.turn.blocked.';
  return name.startsWith(prefix) && (BLOCK_REASONS as readonly string[]).includes(name.slice(prefix.length));
}

export const eventKey = (day: string, event: string): string => `m/${day}/${event}`;

const ATTEMPTS = 8;

/**
 * Adds one to today's total for a known event. Never throws: a count that cannot be written is simply lost, and
 * nothing else is affected. Returns whether the count was recorded.
 */
export async function addCount(store: CounterStore, event: string, now = new Date()): Promise<boolean> {
  if (!isKnownEvent(event)) return false;
  const key = eventKey(capDay(now), event);
  try {
    for (let i = 0; i < ATTEMPTS; i++) {
      const cur = await store.getWithMetadata(key, { type: 'text' });
      const next = String((Number(cur?.data) || 0) + 1);
      const res = cur?.etag ? await store.set(key, next, { onlyIfMatch: cur.etag }) : await store.set(key, next, { onlyIfNew: true });
      if (res.modified) return true;
    }
  } catch {
    /* lost, not fatal */
  }
  return false;
}

/** Today's (or any day's) totals for the given events, for the admin view. Events with no count read as 0. */
export async function readCounts(store: CounterStore, day: string, events: string[]): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  for (const e of events) {
    try {
      const cur = await store.getWithMetadata(eventKey(day, e), { type: 'text' });
      out[e] = Number(cur?.data) || 0;
    } catch {
      out[e] = 0;
    }
  }
  return out;
}
