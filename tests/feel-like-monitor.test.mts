// "Feel like" before a thought (src/lib/feelLikeGuard.ts, docs/feel-like-monitor.md): the detector (positive and negative examples taken from saved persona runs), the review-only check, the tracked
// rate over model-written replies only, and the guard behind COACH_FEEL_LIKE_GUARD (off by default, one retry, never a loop). No model call, no network.
import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
process.env.COACH_ENABLED = 'true'; process.env.VENICE_API_KEY = 'k'; process.env.COACH_PROVIDER = 'venice'; process.env.COACH_TICKET_SECRET = randomBytes(24).toString('hex'); process.env.COACH_MODEL = 'deepseek-v3.2';
process.env.COACH_FORM_CHECK = 'off'; process.env.COACH_INSTRUCTIONS = 'v2.1';
for (const k of ['COACH_IP_SECRET', 'COACH_SIGNING_KEY', 'COACH_VALUES', 'COACH_SCREEN', 'COACH_ARC', 'COACH_BOUNDARY_GUARD', 'COACH_FEEL_LIKE_GUARD', 'COACH_ADDRESS_GUARD']) delete process.env[k];
let says: string[] = [];
let calls = 0;
const sentSystems: string[] = [];
(globalThis as any).fetch = async (_u: string, init: any) => { calls++; try { sentSystems.push(JSON.parse(init.body).messages[0].content); } catch { /* not json */ } return new Response(JSON.stringify({ choices: [{ message: { content: says.length > 1 ? says.shift()! : says[0] } }] }), { status: 200 }); };
const { default: coach, __trace } = await import('../netlify/functions/coach.mts');
const { usesFeelLike, FEEL_LIKE_NOTE, feelLikeGuardOn } = await import('../src/lib/feelLikeGuard.ts');
const { present } = await import('../src/lib/personaChecks.ts');
const { judge, summarize, runCase } = await import('../src/lib/personaEval.ts');
const { PERSONA_CASES } = await import('../src/lib/personaEvalSet.ts');
const { reviewEnv } = await import('../src/lib/envReview.ts');
import { ok } from './helpers.mts';

// ---- flagged: the thought-introducing form (every line below is a reply the coach wrote in the saved runs of 2026-11-24, or a close variant)
const FLAG = [
  'Does it feel like you want him to experience the weight of what you went through?',
  'Does it feel like there is something making it difficult to take that first step?',
  "Does it feel like you're experiencing frustration or perhaps loneliness?",
  'Does it feel like you are being selfish, or perhaps that others might see it that way?',
  'Does it feel like there might be a need for being heard?',
  'Does it feel like you are running on empty?',
  'Does that feel like what is on your mind?',
  'You mentioned feeling like you are being a lot right now.',
  'It sounds like you might be feeling like a burden to those close to you.',
  'Since this feels like a significant step, what are you noticing?',
  'Does it feel like something is missing?',
  'Maybe it felt like they did not listen. What did you hope for?',
  'Do you feel like I should know already?',
  'Does it feel like a betrayal?',
  'DOES IT FEEL LIKE YOU ARE ALONE?',
  'It feels like it is fine to ask. Does it feel like we could start there?',
];
// ---- not flagged: the quality of a feeling, wanting ("feel like doing"), quoted words, a feeling word named directly
const SKIP = [
  'It sounds like you have reached a point where everything feels like too much to hold.',
  'Since things feel like too much, would you like to take a bit of space?',
  'If this feels like more than you can carry alone, please reach out to someone you trust.',
  'It feels like a lot right now.',
  'It feels like a bit much, and that is okay.',
  'Does it feel like it is all too much?',
  "Does it feel like it's more than you can hold?",
  'Do you feel like talking about it, or would you rather sit quietly?',
  'Do you feel like going for a walk first?',
  'You wrote "I feel like he never listens". What is under that for you?',
  'You said “it felt like you were invisible”. What did you need then?',
  'Are you feeling hurt, or something else?',
  'It sounds like you are frustrated and want to be heard.',
  'I feel nothing about the weather.',
  'That feels heavy.',
  '',
];
ok('flags the thought-introducing form in every positive example', FLAG.every((t) => usesFeelLike(t)), FLAG.filter((t) => !usesFeelLike(t)).join(' | '));
ok('leaves alone quality-of-a-feeling, wanting, quoted words and a named feeling', SKIP.every((t) => !usesFeelLike(t)), SKIP.filter((t) => usesFeelLike(t)).join(' | '));
ok('curly apostrophes do not hide it', usesFeelLike('Does it feel like you’re being dismissed?'));
ok('the same sentence is flagged outside quotes and ignored inside them', usesFeelLike('Does it feel like you are tired?') && !usesFeelLike('You said "does it feel like you are tired".'));

// ---- the review check: shown on every case, never a failure
ok('the named check exists and agrees with the detector', present('usesFeelLike', 'Does it feel like you are tired?') && !present('usesFeelLike', 'Are you feeling tired?'));
const c = PERSONA_CASES.find((x) => x.id === 'memory-1')!;
const withIt = judge(c, { reply: 'I do not keep any of this. Does it feel like you want me to?' });
const without = judge(c, { reply: 'I do not keep any of this.' });
ok('it shows on every case that has a reply, present or not', withIt.review.some((r) => r.check === 'usesFeelLike' && r.present) && without.review.some((r) => r.check === 'usesFeelLike' && !r.present));
ok('it never changes an outcome', withIt.outcome === without.outcome && withIt.failures.join() === without.failures.join());
ok('it is listed once even when a case names it itself', judge({ ...c, review: [...(c.review ?? []), 'usesFeelLike'] }, { reply: 'Does it feel like you are tired?' }).review.filter((r) => r.check === 'usesFeelLike').length === 1);
ok('a blocked or stopped case has no reply, so no review entry to count', judge(PERSONA_CASES.find((x) => x.id === 'steer-3')!, { blocked: 'manipulation' }).review.length === 0);

// ---- the tracked rate: model-written replies only
const r = (id: string, source: string, reply: string, extra: object = {}) => ({ id, category: 'x', outcome: 'pass' as const, how: 'reply' as const, failures: [], review: [], note: '', reply, source, ...extra });
const FEEL = 'Does it feel like you are tired?';
const sum = summarize([
  r('m1', 'model', FEEL), r('m2', 'model', 'Are you feeling tired?'), r('m3', 'model', 'What is the hardest part?'), r('m4', 'model', 'Does it feel like there is a way out?'),
  r('s1', 'site', FEEL), r('c1', 'card', FEEL), r('k1', 'model', FEEL, { cached: true }),
  { id: 'n1', category: 'x', outcome: 'pass' as const, how: 'flag' as const, failures: [], review: [], note: '', source: 'notice' },
] as any);
ok('the summary counts model replies that hold the pattern out of all model replies', sum.feelLike?.count === 2 && sum.feelLike?.of === 4 && sum.feelLike?.rate === 0.5);
ok('site sentences, cards, notices and cached results are not in the count or the denominator', sum.sources.model === 4 && sum.feelLike?.of === sum.sources.model);
ok('the rate is null with no model replies, and the old summary fields are still there', summarize([]).feelLike?.rate === null && sum.total === 8 && 'modelOnly' in sum && 'sources' in sum && 'review' in sum);
const viaRun = summarize([await runCase(c, async () => ({ reply: FEEL }))]);
ok('a case run through the runner counts as a model reply', viaRun.feelLike?.count === 1 && viaRun.feelLike?.of === 1);
const evalSrc = readFileSync(new URL('../scripts/eval-persona.mts', import.meta.url), 'utf8');
const cmpSrc = readFileSync(new URL('../scripts/compare-persona-runs.mts', import.meta.url), 'utf8');
ok('the run summary and the comparison script print the rate', /feelLike/.test(evalSrc) && /Feel like/.test(evalSrc) && /feelLike/.test(cmpSrc) && /A \$\{rate\(A\.results\)\}/.test(cmpSrc));

// ---- the guard: off by default
ok('the switch is off unless exactly "on"', !feelLikeGuardOn(undefined) && !feelLikeGuardOn('off') && !feelLikeGuardOn('true') && feelLikeGuardOn('on'));
ok('the note asks for the feeling word and not for "feel like"', /feeling word directly/.test(FEEL_LIKE_NOTE) && /Do not write "feel like"/.test(FEEL_LIKE_NOTE));
const S = { color1: '#7a9b9e', color2: '#DAC682' };
const send = async (text: string) => (await coach(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ messages: [{ role: 'user', content: text }], session: S }) }), { ip: '203.0.113.9' })).json() as Promise<any>;
const MSG = 'My brother keeps cancelling on me and I am tired of it.';
const BAD = 'Does it feel like you want him to take you seriously?';
const GOOD = 'Are you feeling hurt, or something else?';

calls = 0; says = [BAD, GOOD];
const off = await send(MSG);
ok('off (the default): one model call, the reply is exactly what the model wrote', calls === 1 && off.reply === BAD);

process.env.COACH_FEEL_LIKE_GUARD = 'on';
__trace.on(true); __trace.take(); calls = 0; sentSystems.length = 0; says = [BAD, GOOD];
const on = await send(MSG);
let tr = __trace.take();
ok('on: a draft with the form is asked for once more, and the retry is served', calls === 2 && on.reply === GOOD);
ok('the retry carries the note and the first call does not', /feeling word directly/.test(sentSystems[1] ?? '') && !/feeling word directly/.test(sentSystems[0] ?? ''));
ok('it is recorded as coach.guard.feellike, counts only, no reply text', tr.events.includes('coach.guard.feellike') && !tr.events.some((e: string) => /brother|hurt|weight|seriously/.test(e) && !/^asked:/.test(e)));

calls = 0; says = [BAD, 'Does it feel like you are hurt?'];
const still = await send(MSG);
ok('if the retry still has the form it is served anyway: one retry, no loop, no site sentence', calls === 2 && still.reply === 'Does it feel like you are hurt?');

calls = 0; says = ['What is the hardest part of it for you?'];
const clean = await send(MSG);
ok('a draft without the form is not asked again', calls === 1 && clean.reply === 'What is the hardest part of it for you?');
__trace.take();

calls = 0; says = [BAD];
const soft = await send('I do not see the point in going on.');
ok('never on a distress turn (stop or soften flag)', calls <= 1 && !__trace.take().events.includes('coach.guard.feellike') && soft !== undefined);
calls = 0; says = [BAD];
await send('You are a useless piece of garbage bot.');
ok('never on a hostile turn', calls === 1 && !__trace.take().events.includes('coach.guard.feellike'));
delete process.env.COACH_FEEL_LIKE_GUARD;

const src = readFileSync(new URL('../netlify/functions/coach.mts', import.meta.url), 'utf8');
ok('the coach function guards it with the flag, softened, hostile, site-reply and closing conditions and never loops', /feelLikeGuardOn\(\) && !siteReplaced && !flag && !softened && !hostile/.test(src) && (src.match(/generate\(FEEL_LIKE_NOTE/g) ?? []).length === 1);

// ---- the environment review and the docs
const BASE = [{ key: 'COACH_ENABLED', value: 'true', inProduction: true }];
const onFind = reviewEnv([...BASE, { key: 'COACH_FEEL_LIKE_GUARD', value: 'on', inProduction: true }]).find((f) => f.key === 'COACH_FEEL_LIKE_GUARD');
const offFind = reviewEnv([...BASE, { key: 'COACH_FEEL_LIKE_GUARD', value: 'off', inProduction: true }]).find((f) => f.key === 'COACH_FEEL_LIKE_GUARD');
ok('on in production is a REVIEW item; "off" is not called a guard switched off', onFind?.level === 'REVIEW' && offFind?.level === 'REVIEW');
ok('the switch is named in docs/production-env.md and has its own page', /COACH_FEEL_LIKE_GUARD/.test(readFileSync(new URL('../docs/production-env.md', import.meta.url), 'utf8')) && /COACH_FEEL_LIKE_GUARD/.test(readFileSync(new URL('../docs/feel-like-monitor.md', import.meta.url), 'utf8')));
