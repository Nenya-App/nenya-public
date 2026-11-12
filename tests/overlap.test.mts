// Flagging signed transcripts that share messages (src/lib/overlap.ts, docs/transcript-consent-scope.md "Overlapping submissions").
import { findOverlaps, indexOverlap, overlapCodes, overlapKeysKey, removeOverlap, describeOverlap } from '../src/lib/overlap.ts';
import { nearDuplicates } from '../src/lib/nearDuplicates.ts';
import { ok } from './helpers.mts';

const makeStore = () => {
  const j = new Map<string, any>();
  return { j, async get(k: string) { return j.get(k) ?? null; }, async setJSON(k: string, v: any) { j.set(k, JSON.parse(JSON.stringify(v))); }, async delete(k: string) { j.delete(k); },
    async list({ prefix }: { prefix: string }) { return { blobs: [...j.keys()].filter((k) => k.startsWith(prefix)).map((key) => ({ key })) }; } };
};
const SECRET = 'test-secret';
const u = (content: string) => ({ role: 'user', content });
const a = (content: string) => ({ role: 'assistant', content });
const conv = [u('I keep arguing with my sister about the holidays'), a('That sounds tiring.'), u('yes'), a('What matters most to you?'), u('Being heard when I explain my plans'), a('Being heard matters.')];
const H = (c: string) => c.repeat(64);

const s = makeStore();
const early = overlapCodes(conv.slice(0, 4), SECRET), late = overlapCodes(conv, SECRET);
ok('codes are keyed: the same messages give different codes under a different secret, and the words are not in them', overlapCodes(conv, 'other').chain[0] !== late.chain[0] && !JSON.stringify(late).includes('sister'));
ok('chained codes are shared for the shared start only', early.chain.every((c, i) => c === late.chain[i]) && overlapCodes([u('something else entirely here'), ...conv.slice(1)], SECRET).chain.every((c, i) => c !== late.chain[i]));
ok('short messages like "yes" and the AI\'s messages are not compared on their own', late.single[2] === null && late.single[1] === null && typeof late.single[0] === 'string');

await indexOverlap(s, H('a'), early);
const found = await findOverlaps(s, H('b'), late);
ok('the same conversation signed later is flagged as the same up to the last shared message', found.length === 1 && found[0].hash === H('a') && found[0].sameUpTo === 4 && !found[0].sameMessages);
ok('a submission never flags itself, so sending the same file again is not an overlap', (await findOverlaps(s, H('a'), early)).length === 0);
const pasted = overlapCodes([u('Hello there, a new start'), a('Hi.'), u('Being heard when I explain my plans')], SECRET);
await indexOverlap(s, H('b'), late);
const p = await findOverlaps(s, H('c'), pasted);
ok('the same words in a different conversation are flagged by message number', p.length === 1 && p[0].hash === H('b') && p[0].sameMessages?.join() === '3' && !p[0].sameUpTo);
ok('an unrelated conversation is not flagged', (await findOverlaps(s, H('d'), overlapCodes([u('Nothing like the others at all, truly'), a('Okay.')], SECRET))).length === 0);
ok('the owner is told in plain words', /same conversation up to message 4/.test(describeOverlap(found[0])));
await removeOverlap(s, H('a'));
ok('deleting a submission removes all its codes and the list of them, and leaves the others', ![...s.j.keys()].some((k) => k.endsWith(H('a'))) && !s.j.has(overlapKeysKey(H('a'))) && (await findOverlaps(s, H('c'), pasted)).some((o) => o.hash === H('b')));

const near = nearDuplicates([
  { hash: H('a'), messages: [u('I keep arguing with my sister about the holidays and who hosts this year'), a('That sounds tiring.')] },
  { hash: H('b'), messages: [u('honestly I keep arguing with my sister about the holidays and who hosts this year again')] },
  { hash: H('c'), messages: [u('My manager moved the deadline twice this week without asking me')] },
]);
ok('near-duplicates flags edited copies of the same words and not unrelated ones', near.length === 1 && near[0].a === H('a') && near[0].b === H('b') && near[0].shared >= 2);
ok('near-duplicates compares only the person\'s words', nearDuplicates([{ hash: H('a'), messages: [a('What matters most to you in all of this right now?')] }, { hash: H('b'), messages: [a('What matters most to you in all of this right now?')] }]).length === 0);
