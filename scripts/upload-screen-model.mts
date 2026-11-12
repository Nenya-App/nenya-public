// Uploads the screening model (the int8 ONNX file and the tokenizer files from the research folder) to the site's private storage (run on your own computer; the files never go in the repository).
//   NETLIFY_SITE_ID=... NETLIFY_API_TOKEN=... node scripts/upload-screen-model.mts [store-name]
// Use the same store name as the site (COACH_STORE_NAME, or the default). Staging and production keep separate stores: upload to each on purpose. The model is CC-BY-4.0 (credited in ATTRIBUTIONS.md).
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { getStore } from '@netlify/blobs';
import { storeNameFrom } from '../src/lib/originHosts.ts';
import { researchPaths } from '../src/lib/researchDir.ts';
import { MODEL_KEYS } from '../netlify/functions/screen.mts';

if (!process.env.NETLIFY_SITE_ID || !process.env.NETLIFY_API_TOKEN) { console.error('needs NETLIFY_SITE_ID and NETLIFY_API_TOKEN'); process.exit(1); }
const models = join(researchPaths().root, 'models');
const files: [string, string][] = [[MODEL_KEYS.model, join(models, 'cardiffnlp-onnx/model_int8.onnx')], [MODEL_KEYS.tokenizerJson, join(models, 'cardiffnlp-hate-latest/tokenizer.json')], [MODEL_KEYS.tokenizerConfig, join(models, 'cardiffnlp-hate-latest/tokenizer_config.json')]];
for (const [, f] of files) if (!existsSync(f)) { console.error('missing', f); process.exit(1); }
const store = getStore({ name: storeNameFrom(process.argv[2] ?? process.env.COACH_STORE_NAME), siteID: process.env.NETLIFY_SITE_ID, token: process.env.NETLIFY_API_TOKEN });
for (const [key, f] of files) {
  const data = readFileSync(f);
  await store.set(key, key.endsWith('.onnx') ? (data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer) : data.toString('utf8'));
  console.log(`uploaded ${key} (${Math.round(data.length / 1000)} KB, sha256 ${createHash('sha256').update(data).digest('hex').slice(0, 12)})`);
}
