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
const store = { j: new Map<string, string>(), async getWithMetadata() { return null; }, async set() { return { modified: true }; }, async get(k: string) { return this.j.get(k) ?? null; }, async list() { return { blobs: [] }; } };
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
ok('the offer carries only the card id, nothing about the words matched', JSON.stringify(r.offer) === '{"id":"dehum-01"}');
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
