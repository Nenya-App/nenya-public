// The selection function and its pieces (src/lib/selectModel.ts, selectClient.ts, embedModel.ts, netlify/functions/select.mts). A fake embedder stands in for the model here; a check against the REAL
// model runs only if its files are in the private research folder (they are not in the repository).
import { randomBytes, createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { SCREEN_HEADER, signScreenCall } from '../src/lib/screenAuth.ts';
import { askSelect } from '../src/lib/selectClient.ts';
import { SELECT_FILE_HASHES, SELECT_MAX, SELECT_THRESHOLD, selectFileProblems } from '../src/lib/selectModel.ts';
import { pool } from '../src/lib/embedModel.ts';
import { lexicalEmbedder } from '../src/lib/semanticSelect.ts';
import { TOPICS } from '../src/lib/moduleDescriptions.ts';
import { ok } from './helpers.mts';

// pooling
const hidden = new Float32Array([3, 0, 0, 4, 1, 1]); // 3 tokens x 2 dims; the third is padding
const mean = pool(hidden, 3, 2, [1, 1, 0], 'mean');
const cls = pool(hidden, 3, 2, [1, 1, 0], 'cls');
ok('mean pooling averages the real tokens only and returns a unit vector', Math.abs(Math.hypot(...mean) - 1) < 1e-9 && Math.abs(mean[0] - 1.5 / Math.hypot(1.5, 2)) < 1e-9);
ok('cls pooling takes the first token and returns a unit vector', Math.abs(Math.hypot(...cls) - 1) < 1e-9 && cls[0] === 1 && cls[1] === 0);
ok('pooling a zero vector does not divide by zero', pool(new Float32Array([0, 0]), 1, 2, [1], 'mean').every((x) => x === 0));

// the pinned files
const files = { model: new Uint8Array([1, 2, 3]), tokenizerJson: '{"a":1}', tokenizerConfig: '{"b":2}' };
const sha = (d: Uint8Array | string) => createHash('sha256').update(d).digest('hex');
const mine = { model: sha(files.model), tokenizerJson: sha(files.tokenizerJson), tokenizerConfig: sha(files.tokenizerConfig) };
ok('files that match their hashes are accepted', (await selectFileProblems(files, mine)).length === 0);
ok('a changed file is named and refused', (await selectFileProblems({ ...files, tokenizerJson: '{"a":2}' }, mine)).join() === 'tokenizer' && (await selectFileProblems({ ...files, model: new Uint8Array([9]) }, mine)).join() === 'model');
ok('the reviewed hashes are SHA-256 values', Object.values(SELECT_FILE_HASHES).every((h) => /^[0-9a-f]{64}$/.test(h)));

// the function, with a fake embedder
const secret = randomBytes(16).toString('hex');
process.env.COACH_SELECT_SECRET = secret;
const { default: select, __useEmbedderForTests } = await import('../netlify/functions/select.mts');
__useEmbedderForTests(lexicalEmbedder);
const call = (text: string, opts: { sign?: boolean; method?: string } = {}) => {
  const b = JSON.stringify({ text });
  return select(new Request('https://nenya.biz/api/select', { method: opts.method ?? 'POST', headers: { 'content-type': 'application/json', ...(opts.sign === false ? {} : { [SCREEN_HEADER]: signScreenCall(secret, b) }) }, body: opts.method === 'GET' ? undefined : b }));
};
const reserves = TOPICS.find((t) => t.id === 'reserves')!;
let r = await call(reserves.description);
let j = (await r.json()) as any;
ok('a signed call returns the ids of the closest topics, at most three, and no scores or text', r.status === 200 && Array.isArray(j.ids) && j.ids.includes('reserves') && j.ids.length <= SELECT_MAX && !('scores' in j) && !JSON.stringify(j).includes(reserves.description));
ok('a message about nothing in particular selects nothing', ((await (await call('what a lovely afternoon for a walk')).json()) as any).ids.length === 0);
ok('an unsigned call is refused', (await call('hello there', { sign: false })).status === 401);
ok('a GET is refused and an empty text is a bad request', (await call('x', { method: 'GET' })).status === 405 && (await call('   ')).status === 400);
delete process.env.COACH_SELECT_SECRET;
ok('without the secret the endpoint does not exist', (await call('hello')).status === 404);
process.env.COACH_SELECT_SECRET = secret;
__useEmbedderForTests({ async embed() { throw new Error('boom'); } });
ok('a failing model is a 503, which the relay treats as unavailable', (await call('hello there friend')).status === 503);
__useEmbedderForTests(null);

// the client: never throws, never blocks
const jsonRes = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status });
ok('the client returns the ids it is given', (await askSelect({ origin: 'https://x', secret, text: 'hi', fetchImpl: async () => jsonRes({ ids: ['a', 'b'] }) }))?.ids.join() === 'a,b');
ok('the client gives null for an error status, a malformed answer, or a thrown error', (await askSelect({ origin: 'https://x', secret, text: 'hi', fetchImpl: async () => jsonRes({}, 503) })) === null && (await askSelect({ origin: 'https://x', secret, text: 'hi', fetchImpl: async () => jsonRes({ ids: [1] }) })) === null && (await askSelect({ origin: 'https://x', secret, text: 'hi', fetchImpl: async () => { throw new Error('x'); } })) === null);
ok('the client gives up after its budget', (await askSelect({ origin: 'https://x', secret, text: 'hi', budgetMs: 30, fetchImpl: (async (_u: string, init: any) => new Promise((_res, rej) => init.signal.addEventListener('abort', () => rej(new Error('aborted'))))) as any })) === null);

// the real model, if its files are here
const dir = join(homedir(), 'Downloads', 'Nenya (private)', 'embed-bakeoff', 'minilm');
if (existsSync(join(dir, 'model_quantized.onnx'))) {
  const real = { model: new Uint8Array(readFileSync(join(dir, 'model_quantized.onnx'))), tokenizerJson: readFileSync(join(dir, 'tokenizer.json'), 'utf8'), tokenizerConfig: readFileSync(join(dir, 'tokenizer_config.json'), 'utf8') };
  ok('the downloaded files are exactly the reviewed ones', (await selectFileProblems(real)).length === 0);
  const { createEmbedder } = await import('../src/lib/embedModel.ts');
  const { rank, pick, topicVectors } = await import('../src/lib/semanticSelect.ts');
  const emb = await createEmbedder(real, 'mean');
  const vecs = await topicVectors(emb, TOPICS);
  const [v] = await emb.embed(['I have nothing left in me, I am completely worn out by all of it.']);
  ok('the real model gives a unit vector and finds the depletion topic for a paraphrase', Math.abs(Math.hypot(...v) - 1) < 1e-6 && pick(rank(v, vecs), SELECT_THRESHOLD, 3).some((c) => c.id === 'reserves' || c.id === 'care_depleted'));
  const [w] = await emb.embed(['what is the capital of France']);
  ok('the real model selects nothing for an unrelated question', pick(rank(w, vecs), SELECT_THRESHOLD, 3).length === 0);
}
