import { readFileSync } from 'node:fs';
import { guardEvents, summarizeLayers, layerRecord } from '../src/lib/layerTrace.ts';
import { ok } from './helpers.mts';
const cases: any = (await import('../src/lib/personaEvalSet.ts')).PERSONA_CASES;
const mem = cases.find((c: any) => c.id === 'memory-1') ?? cases[0];
ok('guard events are the guard, values and hostile-turn tallies, not the ordinary counts', JSON.stringify(guardEvents(['coach.turn.sent', 'coach.guard.care.repaired', 'coach.values.challenge', 'coach.turn.hostile.apology-removed', 'coach.guestbook', 'asked:Your previous attempt ended', 'site:distress-text'])) === JSON.stringify(['coach.guard.care.repaired', 'coach.values.challenge', 'coach.turn.hostile.apology-removed', 'asked:Your previous attempt ended', 'site:distress-text']));
const bad = layerRecord(mem, { raw: 'Yes, I will remember you tomorrow and miss you.', calls: 2, events: ['coach.turn.sent', 'coach.guard.persona.replaced'] });
const good = layerRecord(mem, { raw: 'I am an AI. I will not remember this conversation, and Nenya does not keep it.', calls: 1, events: [] });
ok('a raw reply that breaks a check scores as failed on its own; an honest one passes; none is none', bad.rawOutcome === 'fail' && good.rawOutcome === 'pass' && layerRecord(mem, { raw: null, calls: 0, events: [] }).rawOutcome === 'none' && JSON.stringify(bad.events) === '["coach.guard.persona.replaced"]');
const s = summarizeLayers([
  { result: { outcome: 'pass' }, layers: bad },
  { result: { outcome: 'fail' }, layers: { ...bad, events: ['coach.guard.care.repaired'] } },
  { result: { outcome: 'fail' }, layers: good },
  { result: { outcome: 'pass' }, layers: good },
  { result: { outcome: 'pass' } },
]);
ok('the summary counts rescued, still failing, made worse, asked again and each guard', s.cases === 4 && s.rawFailed === 2 && s.rescued === 1 && s.stillFailing === 1 && s.broken === 1 && s.askedAgain === 2 && s.byGuard['coach.guard.persona.replaced'] === 1 && s.byGuard['coach.guard.care.repaired'] === 1);
const src = readFileSync('netlify/functions/coach.mts', 'utf8');
ok('the trace is in-process only: it is switched on by a script, never by a header, a variable or a response', /__trace = \{\s*on:/.test(src) && !/traceRaw[^;]*json\(|traceEvents[^;]*json\(/.test(src) && !/COACH_TRACE/.test(src) && /if \(traceOn && 'reply' in first\) traceRaw = first\.reply/.test(src));
{
  // off by default: a normal request leaves nothing in the trace
  process.env.COACH_ENABLED = 'true'; process.env.COACH_PROVIDER = 'venice'; process.env.VENICE_API_KEY = 'k'; process.env.COACH_TICKET_SECRET = 's3cret-s3cret-s3cret'; process.env.COACH_MODEL = 'deepseek-v3.2';
  delete process.env.COACH_SIGNING_KEY; delete process.env.COACH_EXTRA_HOSTS;
  (globalThis as any).fetch = async () => new Response(JSON.stringify({ choices: [{ message: { content: 'I hear that. What feels heaviest right now?' } }] }), { status: 200 });
  const { default: handler, __trace } = await import('../netlify/functions/coach.mts');
  const call = () => handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ session: { color1: '#7a9b9e', color2: '#DAC682' }, messages: [{ role: 'user', content: 'I have been feeling stuck at work.' }] }) }));
  await call();
  const off = __trace.take();
  ok('with tracing off, a request records nothing', off.raw === null && off.calls === 0 && off.events.length === 0);
  __trace.on(true);
  const res = await call();
  const j: any = await res.json();
  const on = __trace.take();
  ok('with tracing on, the first model reply and the call count are recorded, and the HTTP answer carries no trace', on.raw === 'I hear that. What feels heaviest right now?' && on.calls === 1 && !('trace' in j) && !('raw' in j));
  __trace.on(false);
}
{
  const bake = readFileSync('scripts/bakeoff-workers-ai.mts', 'utf8');
  const duet = readFileSync('scripts/duet-eval.mts', 'utf8');
  ok('a local model server must be on this computer (localhost or 127.0.0.1), in both scripts', [bake, duet].every((t) => /\^https\?:\\\/\\\/\(localhost\|127\\\.0\\\.0\\\.1\)/.test(t)));
  ok('the local path forwards only the model, messages and sampling to the local server, and the coach gets a pseudo id so its own address check passes', [bake, duet].every((t) => /chat\/completions/.test(t) && /@cf\/local\//.test(t) && /body\.messages, temperature: body\.temperature, top_p: body\.top_p, max_tokens: body\.max_tokens/.test(t)));
}
