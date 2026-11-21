// The small sentence-embedding model that selects modules and cards by meaning (docs/small-model-detection-scope.md). Run on OUR server like the screening model
// (src/lib/screenModel.ts): an int8 ONNX file with onnxruntime-web (WebAssembly, nothing native) and a JavaScript tokenizer, files pinned by SHA-256 and refused if different,
// text kept only in memory, a vector out and never the text. This file is the loader and the pooling; the choice of model and its hashes are in src/lib/selectModel.ts.
import type { Embedder } from './semanticSelect.ts';

export interface EmbedFiles {
  model: Uint8Array;
  tokenizerJson: string;
  tokenizerConfig: string;
}

export type Pooling = 'mean' | 'cls';
const MAX_TOKENS = 128;

/** Pools the model's token vectors into one unit-length vector. `hidden` is [tokens x dim], row-major; `mask` marks real tokens. */
export function pool(hidden: Float32Array, tokens: number, dim: number, mask: number[], pooling: Pooling): number[] {
  const out = new Array<number>(dim).fill(0);
  if (pooling === 'cls') for (let d = 0; d < dim; d++) out[d] = hidden[d];
  else {
    let n = 0;
    for (let t = 0; t < tokens; t++) if (mask[t]) { n++; for (let d = 0; d < dim; d++) out[d] += hidden[t * dim + d]; }
    if (n > 0) for (let d = 0; d < dim; d++) out[d] /= n;
  }
  const norm = Math.sqrt(out.reduce((s, x) => s + x * x, 0));
  return norm === 0 ? out : out.map((x) => x / norm);
}

export async function createEmbedder(files: EmbedFiles, pooling: Pooling): Promise<Embedder> {
  const ort = await import('onnxruntime-web');
  const { Tokenizer } = await import('@huggingface/tokenizers');
  ort.env.wasm.numThreads = 1; // no worker threads in a function
  const tokenizer = new Tokenizer(JSON.parse(files.tokenizerJson), JSON.parse(files.tokenizerConfig));
  const session = await ort.InferenceSession.create(files.model, { executionProviders: ['wasm'] });
  const wantsTypes = session.inputNames.includes('token_type_ids');
  const one = async (text: string): Promise<number[]> => {
    const enc = tokenizer.encode(text.slice(0, 2000));
    let ids = enc.ids as number[];
    let mask = enc.attention_mask as number[];
    if (ids.length > MAX_TOKENS) { ids = [...ids.slice(0, MAX_TOKENS - 1), ids[ids.length - 1]]; mask = mask.slice(0, MAX_TOKENS); }
    const shape = [1, ids.length];
    const feeds: Record<string, unknown> = {
      input_ids: new ort.Tensor('int64', BigInt64Array.from(ids.map(BigInt)), shape),
      attention_mask: new ort.Tensor('int64', BigInt64Array.from(mask.map(BigInt)), shape),
    };
    if (wantsTypes) feeds.token_type_ids = new ort.Tensor('int64', new BigInt64Array(ids.length), shape);
    const out = await session.run(feeds as Parameters<typeof session.run>[0]);
    const hidden = (out.last_hidden_state ?? Object.values(out)[0]) as { data: Float32Array; dims: readonly number[] };
    return pool(hidden.data, hidden.dims[1], hidden.dims[2], mask, pooling);
  };
  return { async embed(texts: string[]): Promise<number[][]> { const r: number[][] = []; for (const t of texts) r.push(await one(t)); return r; } };
}
