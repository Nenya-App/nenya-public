// The offer through the real coach function, with an invented list and an invented card. The switch is off by default; nothing is stored.
import { generateKeyPairSync } from 'node:crypto';
import coach, { __useStoreForTests as coachStore } from '../netlify/functions/coach.mts';
import { __setCardsForTests, type LearningCard } from '../src/lib/learningCards.ts';
import { __forgetLexiconForTests } from '../src/lib/lexiconStore.ts';
import { ok } from './helpers.mts';

const mine = generateKeyPairSync('ed25519');
process.env.COACH_ENABLED = 'true'; process.env.VENICE_API_KEY = 'k'; process.env.COACH_TICKET_SECRET = 's3cret-s3cret-s3cret'; process.env.COACH_MODEL = 'deepseek-v3.2';
process.env.COACH_SIGNING_KEY = mine.privateKey.export({ type: 'pkcs8', format: 'der' }).toString('base64');
process.env.COACH_ABOUT_ANSWERS = 'off';
delete process.env.COACH_EXTRA_HOSTS; delete process.env.COACH_IP_SECRET; delete process.env.COACH_LEARNING_OFFERS; delete process.env.COACH_LEARNING_MIN_SEVERITY;
(globalThis as any).fetch = async () => new Response(JSON.stringify({ choices: [{ message: { content: 'That sounds heavy. What is underneath it for you?' } }] }), { status: 200 });

const H = '"term","variants","category","target","severity","context","language","source","confidence"\n';
const CSV = H + '"blorvish","","slur","fixture","3","","en","fixture","high"\n' + '"grimble","","harassing-insult","fixture","1","","en","fixture","low"\n';
const store = { j: new Map<string, any>(), async getWithMetadata() { return null; }, async set() { return { modified: true }; }, async get(k: string, o?: any) { const v = this.j.get(k); return o?.type === 'json' ? (typeof v === 'object' ? v : null) : (typeof v === 'string' ? v : null); }, async setJSON(k: string, v: any) { this.j.set(k, JSON.parse(JSON.stringify(v))); }, async delete(k: string) { this.j.delete(k); }, async list() { return { blobs: [] }; } };
store.j.set('lexicon/en/current', CSV);
coachStore(store);
const card = (id: string): LearningCard => ({ id, series: 'dehumanization', order: 1, title: 'A card', contentNote: '', key: 'k.', body: 'b', tryIt: 't', where: 'w', more: '', url: 'https://example.org', license: '' });

const S = { color1: '#7A9B9E', color2: '#DAC682' };
const ask = async (text: string, extra: object = {}) => {
  const res = await coach(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ session: S, messages: [{ role: 'user', content: text }], ...extra }) }));
  return (await res.json()) as any;
};

__setCardsForTests([card('dehum-01'), card('dehum-04'), card('conn-01')]);
ok('with the switch off, nothing is offered', (await ask('what a blorvish')).offer === undefined);
process.env.COACH_LEARNING_OFFERS = 'on';
let r = await ask('what a blorvish');
ok('with the switch on, a match at severity 3 gets the offer alongside the AI\'s own reply', r.offer?.id === 'dehum-01' && /heavy/.test(r.reply));
ok('the offer carries only the card id and a proof, nothing about the words matched', Object.keys(r.offer).sort().join() === 'id,proof' && r.offer.id === 'dehum-01');
ok('a card already offered is not offered again; the next one is', (await ask('what a blorvish', { shown: ['dehum-01'] })).offer?.id === 'dehum-04' && (await ask('what a blorvish', { shown: ['dehum-01', 'dehum-04'] })).offer === undefined);
ok('a low-severity match gets nothing by default, and a card when the owner lowers the minimum', (await ask('such a grimble')).offer === undefined && (process.env.COACH_LEARNING_MIN_SEVERITY = '1', (await ask('such a grimble')).offer !== undefined));
delete process.env.COACH_LEARNING_MIN_SEVERITY;
ok('someone reporting what was said to them is not offered a card', (await ask('my boss called me a blorvish today')).offer === undefined);
ok('a message the crisis check flags is never offered one', (await ask('I want to kill myself, I am a blorvish')).offer === undefined);
ok('ordinary messages get nothing', (await ask('I had a long week and I feel tired')).offer === undefined);
__setCardsForTests([]);
ok('with no approved card, nothing is offered even with the switch on', (await ask('what a blorvish')).offer === undefined);
__setCardsForTests([card('dehum-01')]);
store.j.delete('lexicon/en/current'); __forgetLexiconForTests();
ok('with no list in storage, language in the text offers nothing and the reply is unaffected', (await ask('what a blorvish')).offer === undefined);
ok('abuse aimed at the coach is offered its card even with no list', (__setCardsForTests([card('ai-01')]), (await ask('you are a useless stupid piece of garbage bot')).offer?.id === 'ai-01'));
__setCardsForTests(null);

// ── a signed transcript records the offers the server can prove it made
import report, { __useStoreForTests as reportStore } from '../netlify/functions/report.mts';
reportStore(store);
store.j.set('lexicon/en/current', CSV); __forgetLexiconForTests();
__setCardsForTests([{ ...card('dehum-01'), title: 'What blatant dehumanization is' }, card('dehum-04')]);
const m: any[] = []; let ticket: string | undefined; let offerAt = -1; let offerObj: any = null;
const turn = async (text: string) => {
  m.push({ role: 'user', content: text });
  const res = await coach(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ session: S, messages: m, ticket }) }));
  const j = (await res.json()) as any;
  m.push({ role: 'assistant', content: j.reply }); ticket = j.ticket;
  if (j.offer) { offerAt = m.length - 1; offerObj = j.offer; }
};
await turn('what a blorvish'); await turn('it was a long week'); await turn('my manager is hard to read'); await turn('I feel tired'); await turn('I want some calm');
ok('the server returns a proof with an offer', offerObj?.id === 'dehum-01' && typeof offerObj.proof === 'string' && offerObj.proof.length === 64 && offerAt === 1);
const receipt = async (offers: unknown) => (await (await coach(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ action: 'receipt', session: S, messages: m, ticket, offers }) }))).json()) as any;
const good = await receipt([{ after: offerAt, id: offerObj.id, proof: offerObj.proof }]);
const rec = good.transcript.site.filter((x: any) => x.kind === 'offer');
ok('a proven offer is recorded in the signed transcript, right after the reply, as written by Nenya and only an invitation', rec.length === 1 && rec[0].after === 1 && /What blatant dehumanization is/.test(rec[0].text) && /not by the AI/.test(rec[0].text) && /only an invitation/.test(rec[0].text));
ok('with no offers sent, none is recorded', (await receipt(undefined)).transcript.site.every((x: any) => x.kind !== 'offer'));
ok('a forged proof, a proof moved to another reply, or another card\'s id is ignored', (await receipt([{ after: offerAt, id: offerObj.id, proof: 'f'.repeat(64) }])).transcript.site.every((x: any) => x.kind !== 'offer') && (await receipt([{ after: 3, id: offerObj.id, proof: offerObj.proof }])).transcript.site.every((x: any) => x.kind !== 'offer') && (await receipt([{ after: offerAt, id: 'dehum-04', proof: offerObj.proof }])).transcript.site.every((x: any) => x.kind !== 'offer'));
ok('an offer for a card that no longer exists is not recorded', (__setCardsForTests([card('dehum-04')]), (await receipt([{ after: offerAt, id: offerObj.id, proof: offerObj.proof }])).transcript.site.every((x: any) => x.kind !== 'offer')));
__setCardsForTests([{ ...card('dehum-01'), title: 'What blatant dehumanization is' }]);
// the report function accepts the new kind
const sent = await report(new Request('https://nenya.biz/api/report', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ signed: { transcript: good.transcript, receipt: good.receipt }, choices: { keep: '30d', uses: [] } }) }));
ok('a signed transcript that records an offer is accepted when sent to Nenya', sent.status === 204);
__setCardsForTests(null);
