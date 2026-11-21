// An Embedder for scripts/eval-select.mts made from a folder of downloaded files (model_quantized.onnx, tokenizer.json, tokenizer_config.json).
//   EMBED_DIR="/path/to/minilm" EMBED_POOLING=mean node scripts/eval-select.mts --embedder scripts/embedder-onnx.mts
// EMBED_POOLING is "mean" (MiniLM) or "cls" (bge-small). Reads files only; nothing is sent anywhere.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createEmbedder } from '../src/lib/embedModel.ts';

const dir = process.env.EMBED_DIR;
if (!dir) throw new Error('set EMBED_DIR to the folder with model_quantized.onnx and the tokenizer files');
const pooling = process.env.EMBED_POOLING === 'cls' ? 'cls' : 'mean';
export default await createEmbedder({ model: new Uint8Array(readFileSync(join(dir, 'model_quantized.onnx'))), tokenizerJson: readFileSync(join(dir, 'tokenizer.json'), 'utf8'), tokenizerConfig: readFileSync(join(dir, 'tokenizer_config.json'), 'utf8') }, pooling);
