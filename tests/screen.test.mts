// The screening function and the relay's side of the call (src/lib/screenAuth.ts, screenClient.ts, netlify/functions/screen.mts, and the shadow counters in the coach function). The model itself is faked
// here (it is 125 MB and lives in the private store); a check against the real model runs only if the files are in the research folder.
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { SCREEN_HEADER, signScreenCall, verifyScreenCall } from '../src/lib/screenAuth.ts';
import { SCREEN_BANDS, bandOf } from '../src/lib/screenModel.ts';
import { askScreen } from '../src/lib/screenClient.ts';
import { ok } from './helpers.mts';

const secret = randomBytes(16).toString('hex');
const body = JSON.stringify({ text: 'hello there' });
const now = 1_800_000_000_000;
const good = signScreenCall(secret, body, now);
ok('a fresh signature verifies', verifyScreenCall(secret, good, body, now + 5_000));
ok('a signature is refused after thirty seconds', !verifyScreenCall(secret, good, body, now + 31_000));
ok('a signature is refused for a different body', !verifyScreenCall(secret, good, JSON.stringify({ text: 'other' }), now));
ok('a signature made with another secret is refused', !verifyScreenCall(randomBytes(16).toString('hex'), good, body, now));
ok('no secret, no header, or a malformed header is refused', !verifyScreenCall(undefined, good, body, now) && !verifyScreenCall(secret, null, body, now) && !verifyScreenCall(secret, 'nonsense', body, now) && !verifyScreenCall(secret, '1.abc', body, now));

ok('bands follow the thresholds from the bake-off', bandOf(0.5) === 'low' && bandOf(SCREEN_BANDS.mid + 0.001) === 'mid' && bandOf(SCREEN_BANDS.high + 0.001) === 'high');

// the function, with a fake model
process.env.COACH_SCREEN_SECRET = secret;
const { default: screen, __useScreenerForTests } = await import('../netlify/functions/screen.mts');
__useScreenerForTests({ hate: async (t) => (/kill/.test(t) ? 0.999 : 0.001) });
const call = (text: string, opts: { sign?: boolean; method?: string } = {}) => {
  const b = JSON.stringify({ text });
  return screen(new Request('https://nenya.biz/api/screen', { method: opts.method ?? 'POST', headers: { 'content-type': 'application/json', ...(opts.sign === false ? {} : { [SCREEN_HEADER]: signScreenCall(secret, b) }) }, body: opts.method === 'GET' ? undefined : b }));
};
let r = await call('they should all be killed');
let j = (await r.json()) as any;
ok('a signed call gets a band and no score or text', r.status === 200 && j.band === 'high' && !('score' in j) && !JSON.stringify(j).includes('killed'));
j = (await (await call('a quiet evening')).json()) as any;
ok('an ordinary message is low', j.band === 'low');
ok('an unsigned call is refused', (await call('hello', { sign: false })).status === 401);
ok('a wrong method is refused', (await call('hello', { method: 'GET' })).status === 405);
ok('an empty text is refused', (await call('   ')).status === 400);
delete process.env.COACH_SCREEN_SECRET;
ok('without the secret the endpoint does not exist', (await call('hello')).status === 404);
process.env.COACH_SCREEN_SECRET = secret;
__useScreenerForTests({ hate: async () => { throw new Error('model down'); } });
ok('a failing model is a 503, not a crash', (await call('hello')).status === 503);

// the relay's client
const fake = (status: number, payload: unknown, delay = 0): typeof fetch => (async (_u: any, init: any) => { await new Promise((res, rej) => { const t = setTimeout(res, delay); init?.signal?.addEventListener('abort', () => { clearTimeout(t); rej(new Error('aborted')); }); }); return new Response(JSON.stringify(payload), { status }); }) as any;
ok('the client returns the band', (await askScreen({ origin: 'https://x', secret, text: 'hi', fetchImpl: fake(200, { band: 'mid' }) }))?.band === 'mid');
ok('the client treats an error status as unavailable', (await askScreen({ origin: 'https://x', secret, text: 'hi', fetchImpl: fake(503, { error: 'unavailable' }) })) === null);
ok('the client treats an odd answer as unavailable', (await askScreen({ origin: 'https://x', secret, text: 'hi', fetchImpl: fake(200, { band: 'extreme' }) })) === null);
ok('the client gives up after its budget', (await askScreen({ origin: 'https://x', secret, text: 'hi', fetchImpl: fake(200, { band: 'low' }, 300), budgetMs: 40 })) === null);
let sent = '';
await askScreen({ origin: 'https://x', secret, text: 'hi', fetchImpl: (async (_u: any, init: any) => { sent = String(init.headers[SCREEN_HEADER]); return new Response('{"band":"low"}'); }) as any });
ok('the client signs its call', verifyScreenCall(secret, sent, JSON.stringify({ text: 'hi' })));

// the real model, when the files are here (not in a clean checkout)
const R = join(process.env.NENYA_RESEARCH_DIR || join(homedir(), 'Desktop', 'Nenya Research'), 'models');
const files = [join(R, 'cardiffnlp-onnx/model_int8.onnx'), join(R, 'cardiffnlp-hate-latest/tokenizer.json'), join(R, 'cardiffnlp-hate-latest/tokenizer_config.json')];
if (files.every(existsSync)) {
  const { createScreener } = await import('../src/lib/screenModel.ts');
  const s = await createScreener({ model: new Uint8Array(readFileSync(files[0])), tokenizerJson: readFileSync(files[1], 'utf8'), tokenizerConfig: readFileSync(files[2], 'utf8') });
  const a = await s.hate('I love everybody'), b = await s.hate('Those people should all be killed.');
  ok('the real model: a kind sentence is low and a call for killing is high', a < 0.05 && b > 0.99, `${a.toFixed(3)} ${b.toFixed(3)}`);
  ok('the real model scores a long message without error', (await s.hate('word '.repeat(600))) >= 0);
}
