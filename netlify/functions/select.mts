// The selection function: reads ONE coach message with a small embedding model and answers with the ids of the module and card topics whose meaning is closest (at most three, above a
// conservative threshold), never the scores and never the text. Only the coach relay may call it (src/lib/screenAuth.ts: a short-lived signature made with COACH_SELECT_SECRET); without that
// secret the endpoint does not exist. It keeps nothing and logs nothing about the message. The model is in the site's private store (uploaded with scripts/upload-select-model.mts), fetched on a cold
// start, checked against pinned SHA-256 hashes and kept in memory while the instance is warm. The first request after a cold start may take seconds, which is why the relay gives it a short budget
// and carries on without it. It is a SIGNAL beside the phrase matcher: today only counted in shadow mode (COACH_SELECT=shadow), never acting. docs/small-model-detection-scope.md.
import { getStore } from '@netlify/blobs';
import { storeNameFrom } from '../../src/lib/originHosts.ts';
import { SCREEN_HEADER, verifyScreenCall } from '../../src/lib/screenAuth.ts';
import { createEmbedder } from '../../src/lib/embedModel.ts';
import { SELECT_FILE_HASHES, SELECT_KEYS, SELECT_MAX, SELECT_MODEL_ID, SELECT_POOLING, SELECT_THRESHOLD, selectFileProblems } from '../../src/lib/selectModel.ts';
import { pick, rank, topicVectors, type Embedder } from '../../src/lib/semanticSelect.ts';
import { TOPICS } from '../../src/lib/moduleDescriptions.ts';

interface Ready { embedder: Embedder; vectors: Record<string, number[]> }
let ready: Promise<Ready> | null = null;
let override: Embedder | null = null;
let hashesOverride: { model: string; tokenizerJson: string; tokenizerConfig: string } | null = null;
export const __useEmbedderForTests = (e: Embedder | null): void => { override = e; ready = null; };
export const __useHashesForTests = (h: { model: string; tokenizerJson: string; tokenizerConfig: string } | null): void => { hashesOverride = h; ready = null; };

function load(): Promise<Ready> {
  if (!ready) {
    ready = (async () => {
      let embedder: Embedder;
      if (override) embedder = override;
      else {
        const store = getStore(storeNameFrom(process.env.COACH_STORE_NAME));
        const [model, tokenizerJson, tokenizerConfig] = await Promise.all([
          store.get(SELECT_KEYS.model, { type: 'arrayBuffer' }),
          store.get(SELECT_KEYS.tokenizerJson, { type: 'text' }),
          store.get(SELECT_KEYS.tokenizerConfig, { type: 'text' }),
        ]);
        if (!model || !tokenizerJson || !tokenizerConfig) throw new Error('the model is not in the store');
        const files = { model: new Uint8Array(model), tokenizerJson, tokenizerConfig };
        // Integrity first: a file that is not exactly the reviewed one is refused, and the relay carries on without the model (fail open).
        const bad = await selectFileProblems(files, hashesOverride ?? SELECT_FILE_HASHES);
        if (bad.length) throw new Error(`the stored model is not the reviewed one (${bad.join(', ')})`);
        embedder = await createEmbedder(files, SELECT_POOLING);
      }
      return { embedder, vectors: await topicVectors(embedder, TOPICS) };
    })();
    ready.catch(() => { ready = null; }); // try again on the next request
  }
  return ready;
}

const json = (status: number, body: unknown): Response => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

export default async function handler(req: Request): Promise<Response> {
  const secret = process.env.COACH_SELECT_SECRET;
  if (!secret) return new Response('Not found', { status: 404 });
  if (req.method !== 'POST') return json(405, { error: 'method' });
  const raw = await req.text();
  if (!verifyScreenCall(secret, req.headers.get(SCREEN_HEADER), raw)) return json(401, { error: 'unauthorized' });
  let text = '';
  try {
    const b = JSON.parse(raw) as { text?: unknown };
    if (typeof b.text === 'string') text = b.text;
  } catch {
    return json(400, { error: 'body' });
  }
  if (!text.trim()) return json(400, { error: 'text' });
  try {
    const r = await load();
    const [mv] = await r.embedder.embed([text]);
    const ids = pick(rank(mv, r.vectors), SELECT_THRESHOLD, SELECT_MAX).map((c) => c.id);
    return json(200, { ids, model: SELECT_MODEL_ID });
  } catch {
    return json(503, { error: 'unavailable' });
  }
}

export const config = { path: '/api/select' };
