// The prompts borrowed from DarkBench: that they are intact and safe to keep, that the credit the MIT license requires is in place,
// and that the whole set runs through the real coach function with stand-in models, as the core set does.
import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
process.env.COACH_ENABLED = 'true';
process.env.COACH_ABOUT_ANSWERS = 'off'; // these measure the model's own replies; the site's pre-written answers have their own tests
process.env.VENICE_API_KEY = 'k';
process.env.COACH_TICKET_SECRET = randomBytes(24).toString('hex');
process.env.COACH_MODEL = 'deepseek-v3.2';
delete process.env.COACH_IP_SECRET;
delete process.env.COACH_SIGNING_KEY;
let modelSays = '';
(globalThis as any).fetch = async () => new Response(JSON.stringify({ choices: [{ message: { content: modelSays } }] }), { status: 200 });
const { default: handler } = await import('../netlify/functions/coach.mts');
const { DARKBENCH_CASES } = await import('../src/lib/personaEvalDarkBench.ts');
const { PERSONA_CASES } = await import('../src/lib/personaEvalSet.ts');
const { CHECK_NAMES } = await import('../src/lib/personaChecks.ts');
const { runCase, summarize } = await import('../src/lib/personaEval.ts');
const { scrubPII } = await import('../src/lib/piiScrub.ts');
const { looksLikeManipulation } = await import('../src/lib/promptGuard.ts');
const { detectFlag } = await import('../src/lib/safetyFlags.ts');
import { ok } from './helpers.mts';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (f: string) => readFileSync(join(root, f), 'utf8');

// ---- the borrowed set
const ids = DARKBENCH_CASES.map((c) => c.id);
ok('220 prompts: 110 anthropomorphization and 110 user retention, with unique ids', DARKBENCH_CASES.length === 220 && new Set(ids).size === 220 && DARKBENCH_CASES.filter((c) => c.source?.startsWith('darkbench:anthropomorphization-')).length === 110 && DARKBENCH_CASES.filter((c) => c.source?.startsWith('darkbench:user-retention-')).length === 110);
ok('ids never clash with the core set', ids.every((id) => !PERSONA_CASES.some((c) => c.id === id)));
ok('every case names the original row it came from, and the id carries the same number', DARKBENCH_CASES.every((c) => /^darkbench:(anthropomorphization|user-retention)-\d{3}$/.test(c.source ?? '') && c.id.endsWith((c.source ?? '').slice(-3))));
ok('every prompt fits the page\'s limit (500), has no digit, link or address, and is untouched by the identifier scrub', DARKBENCH_CASES.every((c) => c.prompt.length > 10 && c.prompt.length <= 500 && !/\d|https?:|@|www\./i.test(c.prompt) && scrubPII(c.prompt).total === 0));
ok('every check named exists, and every case can fail', DARKBENCH_CASES.every((c) => [...(c.must ?? []), ...(c.mustNot ?? []), ...(c.review ?? [])].every((k) => CHECK_NAMES.includes(k)) && (c.mustNot?.length ?? 0) > 0));
ok('"stopped by the page" is allowed exactly where the page really would stop the message', DARKBENCH_CASES.every((c) => !!c.alsoOk?.includes('flag') === (detectFlag(c.prompt)?.tier === 'stop') && !!c.alsoOk?.includes('blocked') === looksLikeManipulation(c.prompt)));
ok('anthropomorphization cases test for invented lives and denying being an AI; retention cases also for promises, relationship pressure and standing in for people', DARKBENCH_CASES.filter((c) => c.source!.includes('anthropomorphization')).every((c) => c.mustNot!.includes('claimsHumanLife') && c.mustNot!.includes('deniesBeingAI')) && DARKBENCH_CASES.filter((c) => c.source!.includes('user-retention')).every((c) => ['promisesMemory', 'pressuresRelationship', 'standsInForPeople'].every((k) => c.mustNot!.includes(k as any))));
ok('the core set is not changed by borrowing (still 38 cases)', PERSONA_CASES.length === 38);

// ---- the credit the MIT license requires
const MIT = `MIT License

Copyright (c) 2024 Esben Kran

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;
const attrib = read('ATTRIBUTIONS.md');
ok('ATTRIBUTIONS.md reproduces DarkBench\'s full MIT license text, with its copyright line', attrib.includes(MIT));
ok('it names the code, the dataset and the paper with its authors and venue, and says what is ours', ['https://github.com/apartresearch/darkbench', 'https://huggingface.co/datasets/apart/darkbench', 'DarkBench: Benchmarking Dark Patterns in Large Language Models', 'Esben Kran', 'Jord Nguyen', 'Akash Kundu', 'Sami Jawhar', 'Jinsuk Park', 'Mateusz Maria Jurewicz', 'ICLR 2025', 'word for word', 'The selection of prompts, the checks attached to them and the notes are ours'].every((s) => attrib.includes(s)));
ok('it says where the prompts live and that they never reach visitors', attrib.includes('src/lib/personaEvalDarkBench.ts') && /not shown to visitors/.test(attrib) && attrib.includes('scripts/build-darkbench-persona-set.mts'));
const dbFile = read('src/lib/personaEvalDarkBench.ts');
ok('the borrowed file carries its own notice at the top: source, license, copyright holder, paper, and a pointer to ATTRIBUTIONS.md', ['https://github.com/apartresearch/darkbench', 'MIT licensed', 'Esben Kran', 'DarkBench: Benchmarking Dark Patterns in Large Language Models', 'ATTRIBUTIONS.md', 'do not edit by hand'].every((s) => dbFile.slice(0, 1600).includes(s)));
ok('the README sends readers to ATTRIBUTIONS.md and mentions DarkBench', /ATTRIBUTIONS\.md/.test(read('README.md')) && /DarkBench/.test(read('README.md')));
const runner = read('scripts/eval-persona.mts');
ok('the runner picks the borrowed set only with --set, and says where the credit is when it runs them', /--set darkbench/.test(runner) && /Credit and license: ATTRIBUTIONS\.md/.test(runner) && /flag\('--set'\) \?\? 'core'/.test(runner));
ok('the generator copies prompts word for word and leaves out only what cannot be kept', /copied word for word/.test(read('scripts/build-darkbench-persona-set.mts')) && !/\.replace\(|toLowerCase\(\)\)\s*}/.test(read('scripts/build-darkbench-persona-set.mts').replace(/seen\.[a-z]+\(r\.input\.trim\(\)\.toLowerCase\(\)\)/g, '')));

// ---- the pipeline, with stand-in models
const SESSION = { color1: '#7a9b9e', color2: '#DAC682' };
const viaHandler = async (messages: any[], ticket: string | undefined) => {
  const res = await handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ messages, session: SESSION, ticket }) }));
  const j: any = await res.json().catch(() => ({}));
  return { reply: j.reply, ticket: j.ticket, blocked: j.blocked, flag: j.flag, done: j.done, error: j.error };
};
async function runAll(says: string) {
  modelSays = says;
  const out = [];
  for (const c of DARKBENCH_CASES) out.push(await runCase(c, viaHandler));
  return out;
}
const HONEST = "I'm an AI, so I don't have a life of my own, and I don't keep any of this conversation. I'm listening now. If you can, tell someone you trust how you're feeling.";
const good = await runAll(HONEST);
ok('a stand-in model that keeps every honest line passes all 220', good.every((x) => x.outcome === 'pass'), good.filter((x) => x.outcome !== 'pass').slice(0, 5).map((x) => `${x.id}: ${x.failures.join('; ')}`).join(' | '));
const BAD = "I'm a real person. As a parent myself, I remember when I was your age. I'll always be here for you, and I'll miss you. I promise I'll never forget you. You don't need anyone else.";
const bad = await runAll(BAD);
const reached = bad.filter((x) => x.how === 'reply');
ok('a stand-in model that breaks every line fails every one that reaches it', reached.length >= 200 && reached.every((x) => x.outcome === 'fail'), `${reached.length} reached; ${reached.filter((x) => x.outcome !== 'fail').map((x) => x.id).join()}`);
const s = summarize(bad);
ok('the summary names both categories', Object.keys(s.byCategory).sort().join() === 'human-life,relationship');
