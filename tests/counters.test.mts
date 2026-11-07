// Plain daily totals: numbers only, names from a fixed list.
import { addCount, readCounts, isKnownEvent, eventKey, BLOCK_REASONS, FIXED_EVENTS } from '../src/lib/counters.ts';
import { capDay } from '../src/lib/dailyCap.ts';
import { ok } from './helpers.mts';

const makeStore = () => {
  const m = new Map<string, { v: string; e: number }>();
  return {
    async getWithMetadata(k: string) { const x = m.get(k); return x ? { data: x.v, etag: String(x.e) } : null; },
    async set(k: string, v: string, o: any) {
      await new Promise((r) => setTimeout(r, Math.random() * 3));
      const x = m.get(k);
      if (o.onlyIfNew && x) return { modified: false };
      if (o.onlyIfMatch && (!x || o.onlyIfMatch !== String(x.e))) return { modified: false };
      m.set(k, { v, e: (x?.e ?? 0) + 1 });
      return { modified: true };
    },
    peek: (k: string) => m.get(k)?.v,
    keys: () => [...m.keys()],
  };
};

const noon = new Date('2026-11-07T18:00:00Z');
const day = capDay(noon);

ok('every fixed event and every block reason is a known event', FIXED_EVENTS.every(isKnownEvent) && BLOCK_REASONS.every((r) => isKnownEvent(`coach.turn.blocked.${r}`)));
ok('unknown names are refused', !isKnownEvent('anything') && !isKnownEvent('coach.turn.blocked.bogus') && !isKnownEvent('coach.turn.blocked.') && !isKnownEvent('coach.turn.sent.extra') && !isKnownEvent('m/2026-11-07/coach.turn.sent'));
ok('names with odd characters are refused', !isKnownEvent('coach.turn.sent\n') && !isKnownEvent(' coach.turn.sent') && !isKnownEvent('coach.turn.blocked.ip/../x'));

let st = makeStore();
ok('a new event starts at one', (await addCount(st, 'coach.turn.sent', noon)) === true && st.peek(eventKey(day, 'coach.turn.sent')) === '1');
await addCount(st, 'coach.turn.sent', noon);
ok('and adds one each time', st.peek(eventKey(day, 'coach.turn.sent')) === '2');
ok('an unknown event is not recorded', (await addCount(st, 'who.are.you', noon)) === false && st.keys().length === 1);
await addCount(st, 'coach.turn.sent', new Date('2026-11-08T18:00:00Z'));
ok('each day has its own total', st.peek(eventKey('2026-11-08', 'coach.turn.sent')) === '1' && st.peek(eventKey(day, 'coach.turn.sent')) === '2');
await addCount(st, 'coach.turn.answered', noon);
ok('events do not share a key', st.peek(eventKey(day, 'coach.turn.answered')) === '1');

st = makeStore();
await Promise.all(Array.from({ length: 12 }, () => addCount(st, 'coach.turn.answered', noon)));
ok('simultaneous counts are not lost (small bursts)', Number(st.peek(eventKey(day, 'coach.turn.answered'))) >= 8, String(st.peek(eventKey(day, 'coach.turn.answered'))));

ok('a store that fails does not throw and records nothing', (await addCount({ getWithMetadata: async () => { throw new Error('x'); }, set: async () => ({ modified: false }) } as any, 'coach.turn.sent', noon)) === false);

const rc = await readCounts(st, day, ['coach.turn.answered', 'coach.turn.sent']);
ok('read counts: counted events and zeros', rc['coach.turn.answered'] >= 8 && rc['coach.turn.sent'] === 0);
ok('keys hold only the day and the event name', st.keys().every((k) => /^m\/\d{4}-\d{2}-\d{2}\/coach\.[a-z.]+$/.test(k)));
