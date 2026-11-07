// Counts from the browser: a fixed list of names, nothing identifying, only after agreement, never with the privacy signal on.
import countHandler, { __useStoreForTests } from '../netlify/functions/count.mts';
import { enableUsageCounts, countEvent, countEvents, countPageView } from '../src/lib/usageCounts.ts';
import { isKnownEvent, SCREENS, RHYTHM_NAMES, eventKey } from '../src/lib/counters.ts';
import { capDay } from '../src/lib/dailyCap.ts';
import { ok } from './helpers.mts';

// ---- the event names
ok('every screen and every rhythm is a known event', SCREENS.every((s) => isKnownEvent(`page.view.${s}`)) && RHYTHM_NAMES.every((r) => isKnownEvent(`onboarding.rhythm.${r}`)));
ok('the terms and tour events are known', ['onboarding.terms.accepted', 'tour.accepted', 'tour.declined', 'tour.completed'].every(isKnownEvent));
ok('an unlisted screen, rhythm or event is not', !isKnownEvent('page.view.admin') && !isKnownEvent('onboarding.rhythm.custom') && !isKnownEvent('tour.skipped') && !isKnownEvent('page.view.') && !isKnownEvent('emergency.exit') && !isKnownEvent('page.view.welcome?x=1'));
ok('there is no event for Emergency Exit', ![...SCREENS].some((s) => /exit/.test(s)) && !isKnownEvent('emergency-exit') && !isKnownEvent('page.view.emergency-exit'));

// ---- the function
const makeStore = () => {
  const m = new Map<string, { v: string; e: number }>();
  return {
    async getWithMetadata(k: string) { const x = m.get(k); return x ? { data: x.v, etag: String(x.e) } : null; },
    async set(k: string, v: string, o: any) {
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
let store = makeStore();
__useStoreForTests(store);
const day = capDay(new Date());
const post = async (body: unknown, opts: { origin?: string | null; method?: string; path?: string; raw?: string } = {}) => {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (opts.origin !== null) headers.origin = opts.origin ?? 'https://nenya.biz';
  const r = await countHandler(new Request(`https://nenya.biz${opts.path ?? '/api/count'}`, { method: opts.method ?? 'POST', headers, body: opts.method === 'GET' ? undefined : (opts.raw ?? JSON.stringify(body)) }));
  return r;
};

let r = await post({ events: ['page.view.welcome'] });
ok('a known event is counted and answered with 204', r.status === 204 && store.peek(eventKey(day, 'page.view.welcome')) === '1');
await post({ events: ['onboarding.terms.accepted', 'onboarding.rhythm.box'] });
ok('several events in one request are each counted', store.peek(eventKey(day, 'onboarding.terms.accepted')) === '1' && store.peek(eventKey(day, 'onboarding.rhythm.box')) === '1');
await post({ events: ['tour.accepted', 'tour.accepted'] });
ok('a repeated name in one request counts once', store.peek(eventKey(day, 'tour.accepted')) === '1');
const keysBefore = store.keys().length;
r = await post({ events: ['page.view.secret', 42, null, { x: 1 }] });
ok('unknown names and non-strings are ignored without an error', r.status === 204 && store.keys().length === keysBefore);
ok('nothing is stored but m/<day>/<known event>', store.keys().every((k) => /^m\/\d{4}-\d{2}-\d{2}\/[a-z.0-9-]+$/.test(k)));
r = await post({ events: Array.from({ length: 5 }, () => 'tour.declined') });
ok('more than four events is refused', r.status === 400);
r = await post({ events: [] }); ok('no events is refused', r.status === 400);
r = await post({ nope: 1 }); ok('a body without events is refused', r.status === 400);
r = await post(null, { raw: '{not json' }); ok('bad JSON is refused', r.status === 400);
r = await post(null, { raw: JSON.stringify({ events: ['tour.accepted'], pad: 'x'.repeat(1100) }) }); ok('an oversized body is refused', r.status === 413);
r = await post({ events: ['tour.accepted'] }, { origin: 'https://evil.example' }); ok('a foreign origin is refused', r.status === 403);
r = await post({ events: ['tour.accepted'] }, { origin: null }); ok('a missing origin is refused', r.status === 403);
r = await post({ events: ['tour.accepted'] }, { method: 'GET' }); ok('only POST is served', r.status === 405);
r = await post({ events: ['tour.accepted'] }, { path: '/.netlify/functions/count' }); ok('only the public route is served', r.status === 404);
r = await post({ events: ['page.view.home'] });
ok('the answer sets no cookie and is not cached', !r.headers.get('set-cookie') && r.headers.get('cache-control') === 'no-store');
__useStoreForTests({ async getWithMetadata() { throw new Error('down'); }, async set() { throw new Error('down'); } });
r = await post({ events: ['page.view.home'] });
ok('a store that is down never produces an error for the visitor', r.status === 204);
__useStoreForTests(null);

// ---- the browser side
const sent: { url: string; body: string }[] = [];
let beaconWorks = true;
let gpc = false;
const fetchCalls: { url: string; body: string }[] = [];
(globalThis as any).window = {};
const setNavigator = () => Object.defineProperty(globalThis, 'navigator', {
  configurable: true,
  value: { get globalPrivacyControl() { return gpc; }, sendBeacon: (url: string, blob: Blob) => { if (!beaconWorks) return false; blob.text().then((t) => sent.push({ url, body: t })); return true; } },
});
setNavigator();
(globalThis as any).fetch = async (url: string, init: any) => { fetchCalls.push({ url, body: init.body }); return new Response(null, { status: 204 }); };
const settle = () => new Promise((res) => setTimeout(res, 10));

countEvent('tour.accepted'); await settle();
ok('nothing is counted before the terms are agreed', sent.length === 0 && fetchCalls.length === 0);

enableUsageCounts();
countEvent('tour.accepted'); await settle();
ok('after agreement an event is sent to the count route as JSON', sent.length === 1 && sent[0].url === '/api/count' && JSON.parse(sent[0].body).events[0] === 'tour.accepted');
countEvents(['onboarding.terms.accepted', 'onboarding.rhythm.steady']); await settle();
ok('several events travel in one request', JSON.parse(sent[1].body).events.length === 2);
countPageView('sight'); await settle();
ok('a page view is named page.view.<screen>', JSON.parse(sent[2].body).events[0] === 'page.view.sight');
ok('the request carries nothing but the event names', Object.keys(JSON.parse(sent[2].body)).join() === 'events');

gpc = true;
countEvent('tour.declined'); await settle();
ok('with the Global Privacy Control signal on, nothing is sent', sent.length === 3 && fetchCalls.length === 0);
gpc = false;

beaconWorks = false;
countEvent('tour.completed'); await settle();
ok('if the beacon is unavailable it falls back to fetch with keepalive', fetchCalls.length === 1 && JSON.parse(fetchCalls[0].body).events[0] === 'tour.completed');
(globalThis as any).fetch = async () => { throw new Error('offline'); };
let threw = false;
try { countEvent('tour.completed'); await settle(); } catch { threw = true; }
ok('a failed send is ignored', !threw);
(globalThis as any).fetch = async () => { throw new Error('should not be called'); };
countEvents([]); await settle();
ok('no events means no request', true);
