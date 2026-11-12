// The screening function: scores ONE coach message with a small hate-speech model and answers with a band ("high", "mid" or "low"), never the score and never the text. Only the coach relay may call it
// (src/lib/screenAuth.ts: a short-lived signature made with COACH_SCREEN_SECRET); without that secret the endpoint does not exist. It keeps nothing and logs nothing about the message. The model is in
// the site's private store (uploaded with scripts/upload-screen-model.mts), fetched on a cold start and kept in memory while the instance is warm: the first request after a cold start may take
// several seconds, which is why the relay gives it a short budget and carries on without it. Switched on by the relay with COACH_SCREEN=shadow (docs/coach-screening-flow-scope.md).
import { getStore } from '@netlify/blobs';
import { storeNameFrom } from '../../src/lib/originHosts.ts';
import { SCREEN_HEADER, verifyScreenCall } from '../../src/lib/screenAuth.ts';
import { SCREEN_MODEL_ID, bandOf, createScreener, type Screener } from '../../src/lib/screenModel.ts';

export const MODEL_KEYS = { model: 'screen/model_int8.onnx', tokenizerJson: 'screen/tokenizer.json', tokenizerConfig: 'screen/tokenizer_config.json' } as const;

let screener: Promise<Screener> | null = null;
let override: Screener | null = null;
export const __useScreenerForTests = (s: Screener | null): void => { override = s; screener = null; };

function load(): Promise<Screener> {
  if (override) return Promise.resolve(override);
  if (!screener) {
    screener = (async () => {
      const store = getStore(storeNameFrom(process.env.COACH_STORE_NAME));
      const [model, tokenizerJson, tokenizerConfig] = await Promise.all([
        store.get(MODEL_KEYS.model, { type: 'arrayBuffer' }),
        store.get(MODEL_KEYS.tokenizerJson, { type: 'text' }),
        store.get(MODEL_KEYS.tokenizerConfig, { type: 'text' }),
      ]);
      if (!model || !tokenizerJson || !tokenizerConfig) throw new Error('the model is not in the store');
      return createScreener({ model: new Uint8Array(model), tokenizerJson, tokenizerConfig });
    })();
    screener.catch(() => { screener = null; }); // try again on the next request
  }
  return screener;
}

const json = (status: number, body: unknown): Response => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

export default async function handler(req: Request): Promise<Response> {
  const secret = process.env.COACH_SCREEN_SECRET;
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
    const s = await load();
    const p = await s.hate(text);
    return json(200, { band: bandOf(p), model: SCREEN_MODEL_ID });
  } catch {
    return json(503, { error: 'unavailable' });
  }
}

export const config = { path: '/api/screen' };
