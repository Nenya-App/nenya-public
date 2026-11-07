import { countTurn, capFromEnv, DEFAULT_DAILY_CAP } from '../src/lib/dailyCap.ts';
import { ok } from './helpers.mts';

// A fake store with etags and conditional writes, like Netlify Blobs.
const makeStore = () => {
  let v: string | undefined;
  let e = 0;
  return {
    async getWithMetadata() { return v === undefined ? null : { data: v, etag: String(e) }; },
    async set(_k: string, val: string, o: any) {
      await new Promise((r) => setTimeout(r, Math.random() * 3));
      if (o.onlyIfNew && v !== undefined) return { modified: false };
      if (o.onlyIfMatch && (v === undefined || o.onlyIfMatch !== String(e))) return { modified: false };
      v = val; e++;
      return { modified: true };
    },
    peek: () => v,
  };
};

ok('the default cap is 500 turns a day (100 full conversations of five)', DEFAULT_DAILY_CAP === 500);

let st = makeStore();
let granted = 0;
for (let i = 0; i < 100; i++) if (await countTurn(st, 100, true)) granted++;
ok('the first 100 sequential counted starts are granted', granted === 100);
ok('the 101st is refused', (await countTurn(st, 100, true)) === false);
ok('a refused start counts nothing', st.peek()?.endsWith(':100') === true);

st = makeStore();
const burst = await Promise.all(Array.from({ length: 60 }, () => countTurn(st, 20, true)));
ok('a burst of simultaneous starts never exceeds the cap', burst.filter(Boolean).length <= 20);

st = makeStore();
const batches: boolean[] = [];
for (let b = 0; b < 10; b++) batches.push(...(await Promise.all(Array.from({ length: 3 }, () => countTurn(st, 20, true)))));
ok('small concurrent batches reach exactly the cap', batches.filter(Boolean).length === 20 && st.peek()?.endsWith(':20') === true);

// A conversation under way is never cut off, but its turns still count.
st = makeStore();
for (let i = 0; i < 5; i++) await countTurn(st, 5, true);
ok('a conversation under way is allowed even at the cap', (await countTurn(st, 5, false)) === true);
ok('and its turn is counted past the cap', st.peek()?.endsWith(':6') === true, String(st.peek()));
ok('a new conversation is still refused', (await countTurn(st, 5, true)) === false);

st = makeStore();
await countTurn(st, 1, true, new Date('2026-11-03T18:00:00Z'));
ok('same Minnesota day: refused', (await countTurn(st, 1, true, new Date('2026-11-04T02:00:00Z'))) === false);
ok('next Minnesota day: allowed again', (await countTurn(st, 1, true, new Date('2026-11-04T07:00:00Z'))) === true);
ok('an unreachable store lets visitors through', (await countTurn({ getWithMetadata: async () => { throw new Error('x'); }, set: async () => ({ modified: false }) } as any, 1, true)) === true);
ok('COACH_DAILY_CAP parsing', capFromEnv(undefined) === 500 && capFromEnv('250') === 250 && capFromEnv('abc') === 500 && capFromEnv('0') === 500 && capFromEnv('-5') === 500 && capFromEnv('1.5') === 500);
