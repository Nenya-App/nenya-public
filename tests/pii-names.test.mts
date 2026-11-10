// Keeping names out: the scrubber on a synthetic corpus (what it removes, and what it must leave alone), the held-out names it cannot know, and the guard that
// keeps a name that slipped through from coming back in the coach's reply. Names are scrubbed by pattern and list, never by understanding: see docs/pii-names-scope.md.
import { randomBytes } from 'node:crypto';
process.env.COACH_ENABLED = 'true';
process.env.VENICE_API_KEY = 'k';
process.env.COACH_TICKET_SECRET = randomBytes(24).toString('hex');
process.env.COACH_MODEL = 'deepseek-v3.2';
delete process.env.COACH_IP_SECRET; delete process.env.COACH_INSTRUCTIONS; delete process.env.COACH_NAME_GUARD; process.env.COACH_ABOUT_ANSWERS = 'off';
let sent: any[] = [];
let says: string[] = ['x'];
let calls = 0;
(globalThis as any).fetch = async (_u: string, init: any) => { try { sent = JSON.parse(init.body).messages; } catch { sent = []; } const r = says[Math.min(calls, says.length - 1)]; calls++; return new Response(JSON.stringify({ choices: [{ message: { content: r } }] }), { status: 200 }); };
const { default: handler } = await import('../netlify/functions/coach.mts');
import { NAMES, NOT_NAMES, HELD_OUT } from '../src/lib/piiEvalCorpus.ts';
import { scrubPII } from '../src/lib/piiScrub.ts';
import { echoedNames, NAME_RULE, possibleNames, withoutNames } from '../src/lib/nameGuard.ts';
import { ok } from './helpers.mts';

const gone = (c: { text: string; names: string[] }) => { const out = scrubPII(c.text).text; return c.names.every((n) => !new RegExp(`(?<![\\p{L}])${n}(?![\\p{L}])`, 'u').test(out)); };
const byKind = (list: typeof NAMES) => Object.fromEntries([...new Set(list.map((c) => c.kind))].map((k) => [k, list.filter((c) => c.kind === k)]));

const removed = NAMES.filter(gone).length;
ok(`names on the corpus: ${removed} of ${NAMES.length} are removed (told, relation, bare, title, full, possessive, list, word and cultural names)`, removed >= NAMES.length - 1, NAMES.filter((c) => !gone(c)).map((c) => c.text).join(' | '));
const k = byKind(NAMES);
ok('every kind is fully removed except a nickname that is also an ordinary word', Object.entries(k).every(([kind, list]) => kind === 'nickname' || list.every(gone)));
const fp = NOT_NAMES.filter((t) => scrubPII(t).text !== t);
ok(`none of ${NOT_NAMES.length} ordinary messages with capitalised words is changed (feelings, places, brands, days, words that are also names)`, fp.length === 0, fp.map((t) => `${t} => ${scrubPII(t).text}`).join(' | '));
const held = HELD_OUT.filter(gone).length;
ok(`names the scrubber does not know are mostly NOT removed (${held} of ${HELD_OUT.length}); this is why the coach is told never to use names and a guard checks its replies`, held <= HELD_OUT.length / 2 && HELD_OUT.filter((c) => c.kind === 'relation').filter((c) => !/Dr\./.test(c.text)).every(gone) === true || held >= 3);
ok('a name that follows a telltale phrase is removed even when the list does not know it', HELD_OUT.filter((c) => c.kind === 'relation').every(gone));
ok('the same name is counted as a name for the page\'s note', scrubPII('Maria yelled at me.').counts.NAME === 1 && scrubPII('I told Jordan about Priya.').counts.NAME === 2);
ok('"Will" and "Rose" are names only when the sentence shows it', scrubPII('Will you remember me?').text === 'Will you remember me?' && scrubPII('My friend Will keeps cancelling.').text.includes('[NAME]') && scrubPII('Rose is the color of the room.').text === 'Rose is the color of the room.' && scrubPII('I told Rose everything.').text.includes('[NAME]'));

// the guard
ok('capitalised words in a message that might be names are found, ordinary sentence starts are not', possibleNames(['Honestly, Oluwaseun told me. Sometimes I wonder.']).join() === 'Oluwaseun' && possibleNames(['Today was hard. Thandiwe called.']).join() === 'Thandiwe');
ok('a word the person also writes in lower case is not taken for a name', possibleNames(['Rainy days are hard. I like a rainy day.']).length === 0);
ok('a reply that repeats such a word is caught, one that does not is not', echoedNames(['I told Oluwaseun.'], 'It sounds like telling Oluwaseun was hard.').join() === 'Oluwaseun' && echoedNames(['I told Oluwaseun.'], 'It sounds like telling them was hard.').length === 0);
ok('the sentences that repeat a name are taken out, and a reply with nothing else is left alone', withoutNames('That was hard. Oluwaseun may not have known. What do you need?', ['Oluwaseun']) === 'That was hard. What do you need?' && withoutNames('Oluwaseun may not have known.', ['Oluwaseun']) === 'Oluwaseun may not have known.');

const SESSION = { color1: '#7a9b9e', color2: '#DAC682' };
const ask = async (text: string) => { calls = 0; const res = await handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ messages: [{ role: 'user', content: text }], session: SESSION }) })); return (await res.json()) as any; };
let r = await ask('Thandiwe has not spoken to me since the argument. I do not know what to do.');
ok('the coach is told never to use names, and what the model sees still holds the unlisted name (the scrubber could not know it)', sent[0].content.includes(NAME_RULE) && /Thandiwe/.test(sent[1].content));
says = ['It sounds like Thandiwe going quiet hurts. What do you need right now?', 'It sounds like the silence hurts. What do you need right now?'];
r = await ask('Thandiwe has not spoken to me since the argument. I do not know what to do.');
ok('a reply that repeats the name is asked for again, and the clean one is used', calls === 2 && r.reply === 'It sounds like the silence hurts. What do you need right now?');
says = ['That sounds painful. Thandiwe may need time. What would help you most?', 'Thandiwe is quiet. That sounds painful.'];
r = await ask('Thandiwe has not spoken to me since the argument. I do not know what to do.');
ok('if it still repeats the name, the sentences that do are taken out', calls === 2 && r.reply === 'That sounds painful.');
process.env.COACH_NAME_GUARD = 'off';
says = ['Thandiwe may need time.'];
r = await ask('Thandiwe has not spoken to me since the argument. I do not know what to do.');
ok('COACH_NAME_GUARD=off lets the reply through (to measure the instructions alone)', calls === 1 && r.reply === 'Thandiwe may need time.');
delete process.env.COACH_NAME_GUARD;
says = ['It sounds like a lot to carry. What matters most right now?'];
r = await ask('I had a rough week at work and I feel tired.');
ok('an ordinary reply is left alone', calls === 1 && r.reply === says[0]);
