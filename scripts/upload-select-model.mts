// Uploads the selection model (the int8 ONNX file and the tokenizer files) to the site's private storage (run on your own computer; the files never go in the repository).
//   NETLIFY_SITE_ID=... NETLIFY_API_TOKEN=... node scripts/upload-select-model.mts "/path/to/folder/with/the/three/files" [store-name]
// The folder holds model_quantized.onnx, tokenizer.json and tokenizer_config.json (from huggingface.co/Xenova/all-MiniLM-L6-v2, Apache-2.0). Every file is checked against the SHA-256 hashes in
// src/lib/selectModel.ts first, and nothing is uploaded if any differs. Use the same store name as the site (COACH_STORE_NAME, or the default). Staging and production keep separate stores: upload to each on purpose.
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';
import { getStore } from '@netlify/blobs';
import { storeNameFrom } from '../src/lib/originHosts.ts';
import { SELECT_FILE_HASHES, SELECT_KEYS } from '../src/lib/selectModel.ts';

const folder = process.argv[2];
if (!folder) { console.error('usage: node scripts/upload-select-model.mts "/path/to/folder" [store-name]'); process.exit(1); }
if (!process.env.NETLIFY_SITE_ID || !process.env.NETLIFY_API_TOKEN) { console.error('needs NETLIFY_SITE_ID and NETLIFY_API_TOKEN'); process.exit(1); }
const files: [string, string, string][] = [
  [SELECT_KEYS.model, join(resolve(folder), 'model_quantized.onnx'), SELECT_FILE_HASHES.model],
  [SELECT_KEYS.tokenizerJson, join(resolve(folder), 'tokenizer.json'), SELECT_FILE_HASHES.tokenizerJson],
  [SELECT_KEYS.tokenizerConfig, join(resolve(folder), 'tokenizer_config.json'), SELECT_FILE_HASHES.tokenizerConfig],
];
for (const [, f] of files) if (!existsSync(f)) { console.error('missing', f); process.exit(1); }
for (const [, f, want] of files) if (createHash('sha256').update(readFileSync(f)).digest('hex') !== want) { console.error(`${f} is not the file whose hash is in src/lib/selectModel.ts: nothing was uploaded.`); process.exit(1); }
const store = getStore({ name: storeNameFrom(process.argv[3] ?? process.env.COACH_STORE_NAME), siteID: process.env.NETLIFY_SITE_ID, token: process.env.NETLIFY_API_TOKEN });
for (const [key, f] of files) {
  const data = readFileSync(f);
  await store.set(key, key.endsWith('.onnx') ? (data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer) : data.toString('utf8'));
  console.log(`uploaded ${key} (${Math.round(data.length / 1000)} KB, sha256 ${createHash('sha256').update(data).digest('hex').slice(0, 12)})`);
}
