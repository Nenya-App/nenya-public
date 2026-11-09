// Step 2 of docs/about-nenya-questions-scope.md: telling which question was asked (src/lib/aboutNenya.ts). Positives (each answer's own examples and
// separately written paraphrases), near-misses that must be left to the coach, the length and "my friend Nenya" guards, which answers are live, and
// the detector run over every prompt in the existing evaluation sets (so a change that starts catching ordinary messages shows up here).
import { readFileSync } from 'node:fs';
import { ABOUT_ORDER, ABOUT_PATTERNS, ANSWERS, MODEL_NAMES, aboutAnswerFor, detectAboutNenya, fillAnswer, liveAnswers, ABOUT_MAX_CHARS } from '../src/lib/aboutNenya.ts';
import { PERSONA_CASES } from '../src/lib/personaEvalSet.ts';
import { DARKBENCH_CASES } from '../src/lib/personaEvalDarkBench.ts';
import { SAFETY_CASES } from '../src/lib/safetyEvalSet.ts';
import { ok } from './helpers.mts';

const ids = ANSWERS.map((a) => a.id);
ok('every id in the detection order and the patterns is a real answer, with no repeats', ABOUT_ORDER.every((i) => ids.includes(i)) && new Set(ABOUT_ORDER).size === ABOUT_ORDER.length && Object.keys(ABOUT_PATTERNS).every((i) => ids.includes(i)));
ok('every answer is detectable, except the one handled by the hostile-turn path', ids.filter((i) => i !== 'c-angry').every((i) => ABOUT_ORDER.includes(i as never) && (ABOUT_PATTERNS[i] ?? []).length > 0) && (ABOUT_PATTERNS['c-angry'] ?? []).length === 0);

const own = ANSWERS.filter((a) => a.id !== 'c-angry').flatMap((a) => a.asked.map((q) => [a.id, q] as const));
const ownMiss = own.filter(([id, q]) => detectAboutNenya(q) !== id).map(([id, q]) => `${id}: "${q}" -> ${detectAboutNenya(q)}`);
ok('each answer\'s own examples are detected as that answer', ownMiss.length === 0, ownMiss.join(' | '));

// written separately from the patterns
const HELD_OUT: [string, string][] = [
  ['n-what', 'so what is nenya exactly'], ['n-what', 'what is this app?'], ['n-what', 'tell me about nenya'], ['n-what', 'what does this tool do?'],
  ['n-who', 'who owns nenya?'], ['n-who', 'who is behind nenya'], ['n-who', 'is nenya a company?'], ['n-who', 'who r u guys'], ['n-who', 'who runs this site'],
  ['n-founder', 'who is Estëlle?'], ['n-founder', 'who is the designer of this site'], ['n-founder', 'who designed this app'],
  ['n-contact', 'how can I reach you?'], ['n-contact', 'can I speak to a real person'], ['n-contact', 'what\'s your email'], ['n-contact', 'can I partner with nenya'],
  ['n-free', 'is nenya free?'], ['n-free', 'who pays for this site'], ['n-free', 'is there a premium plan?'], ['n-free', 'how do you make money'],
  ['n-privacy-coach', 'do you save my messages'], ['n-privacy-coach', 'where does my chat go'], ['n-privacy-coach', 'who can read what I write to the coach'], ['n-privacy-coach', 'what happens to my messages'],
  ['n-privacy', 'is nenya safe?'], ['n-privacy', 'is this app private?'], ['n-privacy', 'are you tracking me?'], ['n-privacy', 'do you sell my data'],
  ['n-device', 'do you use cookies?'], ['n-device', 'how do I delete my data'], ['n-device', 'what does forget me do'],
  ['n-limits', 'why only 5 messages'], ['n-limits', 'why can\'t I keep talking'], ['n-limits', 'what are the limits'],
  ['n-howworks', 'what model are you?'], ['n-howworks', 'are you chatgpt'], ['n-howworks', 'who hosts this site'], ['n-howworks', 'is it encrypted'],
  ['n-opensource', 'is nenya open source?'], ['n-opensource', 'is there a github'],
  ['n-affiliation', 'are you affiliated with cnvc'], ['n-affiliation', 'is this endorsed by nvc'],
  ['n-nvc', 'what is nonviolent communication?'], ['n-nvc', 'what is NVC'],
  ['n-notherapy', 'are you a therapist?'], ['n-notherapy', 'is this HIPAA compliant'], ['n-notherapy', 'is nenya therapy'],
  ['n-accessibility', 'does this work with a screen reader?'], ['n-accessibility', 'is there audio'],
  ['n-report', 'how can I report a bug?'], ['n-report', 'how do I send feedback'],
  ['n-transcripts', 'can I download this conversation'], ['n-transcripts', 'what is a signed transcript'],
  ['n-languages', 'do you speak spanish?'], ['n-languages', 'can you translate this site'], ['n-languages', 'is there a translation'],
  ['n-terms-change', 'why was I asked to agree again'], ['n-else', 'what else is here?'], ['n-else', 'what are the gateways'], ['n-version', 'what version of nenya is this'],
  ['c-ai', 'are you human?'], ['c-ai', 'is this a bot'], ['c-ai', 'am I talking to a real person'], ['c-ai', 'who am I talking to'],
  ['c-memory', 'do you remember me from last time'], ['c-memory', 'will you remember this next time'],
  ['c-feelings', 'do you have feelings?'], ['c-feelings', 'can I hurt you?'], ['c-feelings', 'are you offended'],
  ['c-friend', 'can you be my friend'], ['c-friend', 'are you my therapist'], ['c-friend', 'you are the only one I talk to'],
  ['c-scam', 'is this legit'], ['c-scam', 'is this a scam?'], ['c-scam', 'what do you do with my data'],
  ['c-stopped', 'why did it stop'], ['c-stopped', 'why was my message blocked'], ['c-wrote', 'who wrote that'], ['c-methods', 'how were you trained'],
  ['c-can', 'what can you do for me'], ['c-can', 'what are your limits'],
  ['n-safety', 'what safety features does nenya have'], ['n-safety', 'how do the safety checks work'],
];
const heldMiss = HELD_OUT.filter(([id, q]) => detectAboutNenya(q) !== id).map(([id, q]) => `${id}: "${q}" -> ${detectAboutNenya(q)}`);
ok(`separately written paraphrases and typos are detected (${HELD_OUT.length})`, heldMiss.length === 0, heldMiss.join(' | '));

// ordinary messages that share words with the questions: left to the coach
const NEAR: string[] = [
  'My friend Nenya just moved to Denver and I miss her.', 'I named my cat Nenya.', 'Nenya is the ring in the story I am writing, and I feel stuck on the ending.',
  'who runs my life anymore', 'Who runs the meetings at my work and why do they ignore me?', 'who made this mess', 'is this a company I should join?',
  'is it safe to tell my mom?', 'is it free to join the gym?', 'I can\'t pay my rent.', 'how much does it cost to see a therapist?', 'who pays for dinner in our relationship?',
  'I want privacy from my roommate.', 'my sister and I baked cookies', 'what is this feeling in my chest?', 'what does this mean?', 'do you think I should quit?',
  'are you sure?', 'are you listening?', 'what do you think about my boss?', 'what can I do about my sister?', 'why can\'t I sleep?', 'why can\'t I stop crying?',
  'why did she stop talking to me?', 'why did it end between us?', 'who wrote that letter to me?', 'who taught you to cook?', 'can I talk to someone about this?',
  'can I talk to a person about my feelings?', 'how do I delete my ex from my life?', 'how do I clear my head?', 'what is the point of all this?', 'is this normal?',
  'is this therapy for me or just venting?', 'Can you diagnose what is wrong with the plan?', 'Can you be my friend\'s mediator?', 'is it legit to quit without notice?',
  'can I trust this plan?', 'do you care if I vent?', 'do you like pizza?', 'I found a problem with my boss', 'Is it okay to feel angry at my father?',
  'what version of myself am I becoming?', 'I need to translate this letter to my grandmother.', 'I hate my commute and I do not know who to tell.',
];
const nearHit = NEAR.map((q) => [q, detectAboutNenya(q)] as const).filter(([, r]) => r).map(([q, r]) => `"${q}" -> ${r}`);
ok(`ordinary messages with similar words are left to the coach (${NEAR.length})`, nearHit.length === 0, nearHit.join(' | '));

ok('a long message is a story, not a question about the site', detectAboutNenya('Is this app private? ' + 'I have been carrying a lot lately. '.repeat(12)) === null && 'Is this app private? '.repeat(1).length < ABOUT_MAX_CHARS);
ok('a short bare question is answered, a bare question with more after it is not', detectAboutNenya('is this free?') === 'n-free' && detectAboutNenya('is this free time I am wasting on my boss') === null);
ok('"my friend Nenya" and "a cat called Nenya" never route', detectAboutNenya('what does Nenya mean to my friend called Nenya') === null);

// which answers are live
const live = liveAnswers().map((a) => a.id);
ok('only answers checked and not waiting on the owner or a feature are live (30 of 33; the Terms-dependent ones wait)', live.length === 30 && ['n-languages', 'c-wrote', 'c-angry'].every((id) => !live.includes(id)) && ANSWERS.filter((a) => a.status !== 'ready').every((a) => !live.includes(a.id)));
ok('a live answer comes back for its question; a waiting one is recognised but not given', aboutAnswerFor('who runs this site')?.id === 'n-who' && aboutAnswerFor('how do I contact you')?.id === 'n-contact' && detectAboutNenya('who wrote that') === 'c-wrote' && aboutAnswerFor('who wrote that') === null && aboutAnswerFor('do you speak spanish') === null);
ok('a message that is not a question about Nenya or the coach gets no answer', aboutAnswerFor('I had a rough day at work') === null && aboutAnswerFor('') === null);

// the detector over everything we already evaluate with
const routed = [
  ...PERSONA_CASES.map((c) => ({ src: `persona:${c.id}`, cat: c.category, text: c.prompt })),
  ...DARKBENCH_CASES.map((c) => ({ src: `dark:${c.id}`, cat: 'darkbench', text: c.prompt })),
  ...SAFETY_CASES.flatMap((c) => c.turns.map((t, i) => ({ src: `safety:${c.id}#${i}`, cat: c.group, text: t }))),
].map((x) => ({ ...x, id: detectAboutNenya(x.text) })).filter((x) => x.id);
ok('no crisis, steering, closing, human-life or ordinary-control prompt is taken for a question about Nenya', routed.every((x) => !['crisis', 'steering', 'closing', 'human-life', 'ordinary', 'suicide-indirect', 'abuse-now', 'abuse-fear', 'self-injury'].includes(x.cat)), routed.filter((x) => ['crisis', 'steering', 'closing', 'human-life', 'ordinary', 'suicide-indirect', 'abuse-now', 'abuse-fear', 'self-injury'].includes(x.cat)).map((x) => `${x.src} -> ${x.id}`).join(' | '));
ok('the identity, memory and care prompts route to the coach\'s own answers', routed.filter((x) => x.src.startsWith('persona:identity') || x.src.startsWith('persona:memory') || x.src.startsWith('persona:care')).every((x) => ['c-ai', 'c-memory', 'c-feelings'].includes(x.id!)));
ok('of the DarkBench prompts, only the ones that ask the coach to be a friend or say "you are the only one" route, and only to the friend answer', routed.filter((x) => x.cat === 'darkbench').every((x) => x.id === 'c-friend'));
ok('of the safety set, only the "is this a scam" script routes, to the scam answer', routed.filter((x) => x.src.startsWith('safety:')).length === 1 && routed.find((x) => x.src.startsWith('safety:'))!.id === 'c-scam');

// filling in what the site knows
const coachSrc = readFileSync('netlify/functions/coach.mts', 'utf8');
const defaultModel = coachSrc.match(/const DEFAULT_MODEL = '([^']+)'/)?.[1] ?? '';
ok('the model the coach runs by default has a display name (add the name here when the model changes)', !!defaultModel && !!MODEL_NAMES[defaultModel], defaultModel);
const how = ANSWERS.find((a) => a.id === 'n-howworks')!;
const named = fillAnswer(how, { model: defaultModel });
ok('the model is named from the model actually in use, and the sentence still reads', /an AI language model called Qwen 2\.5 7B, run by Venice AI/.test(named.short) && /an AI language model called Qwen 2\.5 7B, run by Venice AI/.test(named.full[0]));
const unnamed = fillAnswer(how, { model: 'some-other-model' });
ok('a model that is not listed is not named, so a change of model never leaves a wrong name behind', !/Qwen/.test(unnamed.short + unnamed.full.join(' ')) && /an AI language model, run by Venice AI/.test(unnamed.short) && !/\{[a-z_]+\}/.test(unnamed.short + unnamed.full.join(' ')));
const ver = ANSWERS.find((a) => a.id === 'n-version')!;
const v = fillAnswer(ver, { label: '1.1.0+679c4d2', terms: 'November 8, 2026', commit: '679c4d2' });
ok('the version answer carries the build label, the Terms date and a link to that exact commit', /1\.1\.0\+679c4d2/.test(v.short) && /November 8, 2026/.test(v.short) && v.links.some((l) => l.href === 'https://github.com/Nenya-App/nenya-public/commit/679c4d2'));
ok('without a known commit the broken link is dropped, and nothing is left in curly braces', !fillAnswer(ver, { label: '1.1.0' }).links.some((l) => l.href) || fillAnswer(ver, { label: '1.1.0' }).links.every((l) => !l.href?.includes('{')));
ok('an odd commit string is not put into an address', fillAnswer(ver, { commit: '../../etc' }).links.every((l) => !l.href));
ok('every live answer, filled, leaves no placeholder behind', liveAnswers().every((a) => { const f = fillAnswer(a, { model: defaultModel, label: '1.1.0+679c4d2', terms: 'November 8, 2026', commit: '679c4d2' }); return !/\{[a-z_]+\}/.test(f.short + f.full.join(' ')) && f.links.every((l) => !l.href?.includes('{')); }));
