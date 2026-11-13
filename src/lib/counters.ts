// Plain daily totals: how many times a named event happened today. Numbers only, with no information about who
// produced them. Event names come from a fixed list in this file, so nothing a visitor sends can become one.
// One key per event per day, so two events never contend for the same write.
import { capDay, type CounterStore } from './dailyCap.ts';

/** Why a coach turn was refused. A code, never message text. */
export const BLOCK_REASONS = ['manipulation', 'context', 'crisis', 'cap', 'ip', 'form.short', 'form.unclear'] as const;

export const FIXED_EVENTS = [
  'coach.turn.sent', // a well-formed message reached the function
  'coach.turn.answered', // the message went to the model and a reply came back
  'coach.sealed.attested', // sealed mode: a browser was given an attestation to check (docs/ghost-footprint-stack.md)
  'coach.sealed.turn.sent', // sealed mode: an encrypted message reached the function (it cannot read it)
  'coach.sealed.turn.answered', // sealed mode: the encrypted reply was passed back
  'cell.opened', // partner practice: a two-person encrypted mailbox was opened (no content, no code)
  'cell.report.verified', // partner practice: a reported message's franking check passed
  'coach.turn.hostile.abuse', // the message was hostile toward the coach (contempt, insults, dares): the coach was told how to answer, a count and no content
  'coach.turn.hostile.critique', // the message was sharp feedback on the coach's reply: same
  'coach.turn.hostile.thanks-added', // the site opened a reply to critique with its thank-you
  'coach.turn.hostile.apology-removed', // an apologising sentence was taken out of a reply to a hostile message
  'coach.turn.distress-text', // a reply to a possible-distress message had the site's pointer to a person and a crisis line added
  'coach.conversation.started', // a first exchange was accepted
  'coach.conversation.finished', // the last exchange (the fifth) was answered
  'coach.report.verified', // a signed transcript sent to us passed the signature check
  'coach.report.rejected', // one did not (a code, never the content)
  'coach.report.alert-failed', // a transcript was kept but the owner's email alert could not be sent
  'transcript.deleted', // a transcript's copies were deleted at the end of the time its owner chose
  'transcript.needs-manual-deletion', // a deletion was due but did not go through (listed for the owner)
  'coach.offer.slur', // an educational card was offered (counts only, by kind of language; nothing about the words)
  'coach.offer.dehumanizing-metaphor',
  'coach.offer.dehumanizing-phrase',
  'coach.offer.coded-term',
  'coach.offer.harassing-insult',
  'coach.offer.ai-insult',
  // The coach's own stance, counted: a plain statement added to a reply (COACH_VALUES), the steering note given while a conversation carries contempt for a group or a call to harm one, and stacked questions.
  'coach.values.challenge',
  'coach.challenge.note.contempt',
  'coach.challenge.note.violence',
  'coach.turn.multi-question',
  // The screening model in shadow mode (docs/coach-screening-flow-scope.md): a count per band, whether the phrase matcher also acted, and how often the model could not answer in time. Counts only: no message, no score.
  'coach.screen.unavailable',
  'coach.screen.band.high',
  'coach.screen.band.mid',
  'coach.screen.band.low',
  ...(['high', 'mid', 'low'] as const).flatMap((b) => [`coach.screen.vs-list.${b}.list`, `coach.screen.vs-list.${b}.nolist`]),
] as const;

/** The screens a page view can be counted for (the app's own screen ids; the About pages count together as 'about'). */
export const SCREENS = ['welcome', 'home', 'sight', 'sound', 'touch', 'essence', 'movement', 'insight', 'color-selection', 'gateway-review', 'session', 'cell-creation', 'cell-interface', 'about'] as const;

/** The breathing rhythms of the opening flow, by a plain name. */
export const RHYTHM_NAMES = ['steady', 'calming', 'lively', 'deep-calm', 'box', '478'] as const;

/** Counted from the browser, and only after the visitor has agreed to the terms (see src/lib/usageCounts.ts). */
export const BROWSER_FIXED_EVENTS = ['onboarding.terms.accepted', 'tour.accepted', 'tour.declined', 'tour.completed', 'coach.pause.begun', 'coach.pause.returned.waited', 'coach.pause.returned.quiz'] as const;

const under = (name: string, prefix: string, allowed: readonly string[]): boolean =>
  name.startsWith(prefix) && allowed.includes(name.slice(prefix.length));

export function isKnownEvent(name: string): boolean {
  if ((FIXED_EVENTS as readonly string[]).includes(name) || (BROWSER_FIXED_EVENTS as readonly string[]).includes(name)) return true;
  if (/^coach\.receipt\.issued\.[0-9a-f]{16}$/.test(name)) return true; // one per signing key
  return under(name, 'coach.turn.blocked.', BLOCK_REASONS) || under(name, 'page.view.', SCREENS) || under(name, 'onboarding.rhythm.', RHYTHM_NAMES);
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

/** Every event name there is, for the admin view. */
export const ALL_EVENTS: string[] = [
  ...FIXED_EVENTS,
  ...BLOCK_REASONS.map((r) => `coach.turn.blocked.${r}`),
  ...BROWSER_FIXED_EVENTS,
  ...RHYTHM_NAMES.map((r) => `onboarding.rhythm.${r}`),
  ...SCREENS.map((sc) => `page.view.${sc}`),
];

/** The last `n` Minnesota days, newest first, each as YYYY-MM-DD. */
export function recentDays(n: number, now = new Date()): string[] {
  const out: string[] = [];
  for (let i = 0; out.length < n && i < n + 4; i++) {
    const d = capDay(new Date(now.getTime() - i * 86400000));
    if (!out.includes(d)) out.push(d);
  }
  return out;
}

/** The slice of a Blobs store the admin view needs. */
export interface RangeStore extends CounterStore {
  list(opts: { prefix: string }): Promise<{ blobs: { key: string }[] }>;
}

/** Totals for the given days: day -> event -> count. Days and events with no record are simply absent. */
export async function readRange(store: RangeStore, days: string[]): Promise<Record<string, Record<string, number>>> {
  const wanted = new Set(days);
  const out: Record<string, Record<string, number>> = {};
  const { blobs } = await store.list({ prefix: 'm/' });
  const keys = blobs.map((b) => b.key).filter((k) => wanted.has(k.split('/')[1]));
  for (let i = 0; i < keys.length; i += 20) {
    await Promise.all(
      keys.slice(i, i + 20).map(async (k) => {
        const [, d, e] = k.split('/');
        if (!d || !e || !isKnownEvent(e)) return;
        const cur = await store.getWithMetadata(k, { type: 'text' });
        (out[d] ??= {})[e] = Number(cur?.data) || 0;
      })
    );
  }
  return out;
}

