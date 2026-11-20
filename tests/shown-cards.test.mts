// Cards the page has shown: the model is told what they say, and a reply that restates one is asked for again (src/lib/shownCards.ts).
import { generateKeyPairSync } from 'node:crypto';
import coach, { __useStoreForTests as coachStore } from '../netlify/functions/coach.mts';
import { __setCardsForTests, type LearningCard } from '../src/lib/learningCards.ts';
import { shownCardIds, shownCardTexts, MAX_SHOWN } from '../src/lib/shownCards.ts';
import { __forgetLexiconForTests } from '../src/lib/lexiconStore.ts';
import { ok } from './helpers.mts';

const mine = generateKeyPairSync('ed25519');
process.env.COACH_ENABLED = 'true'; process.env.VENICE_API_KEY = 'k'; process.env.COACH_PROVIDER = 'venice'; process.env.COACH_TICKET_SECRET = 's3cret-s3cret-s3cret'; process.env.COACH_MODEL = 'deepseek-v3.2';
process.env.COACH_SIGNING_KEY = mine.privateKey.export({ type: 'pkcs8', format: 'der' }).toString('base64');
process.env.COACH_ABOUT_ANSWERS = 'off';
delete process.env.COACH_EXTRA_HOSTS; delete process.env.COACH_IP_SECRET; delete process.env.COACH_LEARNING_OFFERS;

const BODY = 'Contempt is often the surface of an unmet need, and listening for that need can change how a hard conversation begins and ends.';
const card = (id: string, title: string): LearningCard => ({ id, series: 'connection', order: 1, title, contentNote: '', key: 'Look for the need under the contempt.', body: BODY, tryIt: 'Next time you feel contempt, name one need that might sit under it.', where: 'Ours.', more: '', url: '', license: '' });
__setCardsForTests([card('conn-01', 'The needs behind contempt'), card('conn-02', 'One question')]);

let sent: any[] = []; let say: string[] = ['That sounds like a lot. What matters most to you here?'];
(globalThis as any).fetch = async (_u: string, init: any) => { try { sent.push(JSON.parse(init.body).messages); } catch { /* not a chat request */ } return new Response(JSON.stringify({ choices: [{ message: { content: say.length > 1 ? say.shift()! : say[0] } }] }), { status: 200 }); };
const S = { color1: '#7A9B9E', color2: '#DAC682' };
const ask = async (extra: object = {}) => {
  sent = [];
  const res = await coach(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ session: S, messages: [{ role: 'user', content: 'I read the card and I keep thinking about my brother.' }], ...extra }) }));
  return { j: (await res.json()) as any, sys: sent.map((m) => m.filter((x: any) => x.role === 'system').map((x: any) => x.content).join('\n')) };
};

// the pure pieces
import { withoutRepeatedSentences } from '../src/lib/coachRepeat.ts';
ok('only known ids are taken, once each, at most four', JSON.stringify(shownCardIds(['conn-01', 'x', 'conn-01', 5, 'conn-02'], new Set(['conn-01', 'conn-02']))) === '["conn-01","conn-02"]' && shownCardIds(['a', 'b', 'c', 'd', 'e', 'f'], new Set(['a', 'b', 'c', 'd', 'e', 'f'])).length === MAX_SHOWN && shownCardIds('nope', new Set(['a'])).length === 0);
ok('the card\'s own words for comparison leave out fragments too short to compare', shownCardTexts([card('conn-01', 'T')]).length === 2 && shownCardTexts([card('conn-01', 'T')]).every((t) => t.split(/\s+/).length >= 10));
ok('the sentences that restate a card are taken out, and a reply with none, or only those, is returned unchanged', withoutRepeatedSentences('It sounds hard. ' + BODY + ' What is it like for you?', [BODY]) === 'It sounds hard. What is it like for you?' && withoutRepeatedSentences('It sounds hard.', [BODY]) === 'It sounds hard.' && withoutRepeatedSentences(BODY, [BODY]) === BODY);

// through the coach: the model is told nothing about cards
let r = await ask();
ok('with nothing shown, nothing about cards reaches the model', !/short read|written by Nenya|learning card/i.test(r.sys[0]));
r = await ask({ shown: ['conn-01'] });
ok('with a card shown, still nothing about it reaches the model: one system message, no card title or text', sent[0].filter((x: any) => x.role === 'system').length === 1 && !/The needs behind contempt|Contempt is often the surface|short read|written by Nenya/i.test(r.sys[0]) && !JSON.stringify(sent[0]).includes('Look for the need under the contempt'));
// the page's tidying after the reply: no second call, no mention of the card
say = ['It sounds like your brother matters a great deal. ' + BODY + ' What was it you kept returning to?'];
r = await ask({ shown: ['conn-01'] });
ok('a reply that restates an offered card has those sentences taken out, with no second call to the model', sent.length === 1 && r.j.reply === 'It sounds like your brother matters a great deal. What was it you kept returning to?', JSON.stringify(r.j.reply));
r = await ask();
ok('the same reply is left alone when no card was offered', r.j.reply.includes('Contempt is often'));
// an offer is not made when the reply has just said the same thing
process.env.COACH_LEARNING_OFFERS = 'on';
__setCardsForTests([card('dehum-01', 'A card on dehumanization')]);
__forgetLexiconForTests();
const H = '"term","variants","category","target","severity","context","language","source","confidence"\n';
const store = { j: new Map<string, any>(), async getWithMetadata() { return null; }, async set() { return { modified: true }; }, async get(k: string, o?: any) { const v = this.j.get(k); return o?.type === 'json' ? (typeof v === 'object' ? v : null) : v ?? null; }, async delete() {}, async list() { return { blobs: [] }; } };
store.j.set('lexicon/en/current', H + '"blorvish","","slur","fixture","3","","en","fixture","high"\n');
coachStore(store as any);
say = ['That sounds heavy. What is underneath it for you?'];
let o = await (async () => { sent = []; const res = await coach(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ session: S, messages: [{ role: 'user', content: 'what a blorvish' }] }) })); return (await res.json()) as any; })();
ok('(control) with the switch on and a match, the card is offered', o.offer?.id === 'dehum-01', JSON.stringify(o.offer));
const offeredId = o.offer?.id;
say = [BODY];
o = await (async () => { const res = await coach(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ session: S, messages: [{ role: 'user', content: 'what a blorvish' }] }) })); return (await res.json()) as any; })();
ok('when the reply has just said the card\'s words, the card is not offered', offeredId !== undefined && o.offer === undefined);
delete process.env.COACH_LEARNING_OFFERS;
__setCardsForTests(null);
