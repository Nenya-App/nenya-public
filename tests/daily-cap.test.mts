import { claimConversationSlot, capFromEnv } from '../src/lib/dailyCap.ts';
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

let st = makeStore();
let granted = 0;
for (let i = 0; i < 100; i++) if (await claimConversationSlot(st, 100)) granted++;
ok('the first 100 sequential starts are granted', granted === 100);
ok('the 101st is refused', (await claimConversationSlot(st, 100)) === false);

st = makeStore();
const burst = await Promise.all(Array.from({ length: 60 }, () => claimConversationSlot(st, 20)));
ok('a burst of simultaneous starts never exceeds the cap', burst.filter(Boolean).length <= 20);

st = makeStore();
const batches: boolean[] = [];
for (let b = 0; b < 10; b++) batches.push(...(await Promise.all(Array.from({ length: 3 }, () => claimConversationSlot(st, 20)))));
ok('small concurrent batches reach exactly the cap', batches.filter(Boolean).length === 20 && st.peek()?.endsWith(':20') === true);

st = makeStore();
await claimConversationSlot(st, 1, new Date('2026-11-03T18:00:00Z'));
ok('same Minnesota day: refused', (await claimConversationSlot(st, 1, new Date('2026-11-04T02:00:00Z'))) === false);
ok('next Minnesota day: allowed again', (await claimConversationSlot(st, 1, new Date('2026-11-04T07:00:00Z'))) === true);
ok('an unreachable store lets visitors through', (await claimConversationSlot({ getWithMetadata: async () => { throw new Error('x'); }, set: async () => ({ modified: false }) } as any, 1)) === true);
ok('COACH_DAILY_CAP parsing', capFromEnv(undefined) === 100 && capFromEnv('250') === 250 && capFromEnv('abc') === 100 && capFromEnv('0') === 100 && capFromEnv('-5') === 100 && capFromEnv('1.5') === 100);
