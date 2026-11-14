// The screening model (docs/coach-screening-flow-scope.md, sections 10 to 13): cardiffnlp/twitter-roberta-base-hate-latest, converted to ONNX and quantized to 8-bit (scripts/export-onnx.py), run on the
// server with onnxruntime-web (WebAssembly, so there is no native binary to ship) and a pure-JavaScript tokenizer. It scores ONE message for how likely it is to be hate speech and returns a band, not
// the score. Nothing is kept. The bands come from the bake-off: "high" is the score above which 2% of ordinary cases (HateCheck non-hateful and ETHOS non-hate) were flagged (held-out, median 2.0%);
// "mid" is the 5% line. The model is a second signal: on its own it only changes the tone of a reply or offers a card; it never ends a conversation.
export const SCREEN_MODEL_ID = 'cardiffnlp-twitter-roberta-base-hate-latest, int8 (2026-11-12)';
export const SCREEN_BANDS = { high: 0.993, mid: 0.985 } as const;
export type Band = 'high' | 'mid' | 'low';
export const bandOf = (p: number): Band => (p > SCREEN_BANDS.high ? 'high' : p > SCREEN_BANDS.mid ? 'mid' : 'low');

/**
 * The files the screening model is made of, by SHA-256. The function checks every one before using it and refuses the whole model if any differs, so a damaged, swapped or tampered file in the private
 * store is never run. A new model version is a new set of hashes in a reviewed code change, never a silent change in storage. Made by scripts/export-onnx.py (the ONNX file) and downloaded from the
 * model's page (the tokenizer files); the same values are in docs/coach-screening-flow-scope.md.
 */
export const SCREEN_FILE_HASHES = {
  model: '66062a4bcaea5b38eec5acdcd786aacfea72e28a64da2a1414f83ceb928d93ff',
  tokenizerJson: '3045f84d35d20dfe74630b9c0f7f98d83295915f9d064d0dd9dc73b858ba4bfc',
  tokenizerConfig: 'f64a0b9cc0e15d4c5db67d76c8bdd6bfa414c68a4f355e90116b109fe0bde972',
} as const;

/** The names of the files whose hash does not match (empty when the model is intact). */
export async function screenFileProblems(files: { model: Uint8Array; tokenizerJson: string; tokenizerConfig: string }, expected: { model: string; tokenizerJson: string; tokenizerConfig: string } = SCREEN_FILE_HASHES): Promise<string[]> {
  const { createHash } = await import('node:crypto');
  const sha = (d: Uint8Array | string): string => createHash('sha256').update(d).digest('hex');
  const bad: string[] = [];
  if (sha(files.model) !== expected.model) bad.push('model');
  if (sha(files.tokenizerJson) !== expected.tokenizerJson) bad.push('tokenizer');
  if (sha(files.tokenizerConfig) !== expected.tokenizerConfig) bad.push('tokenizer config');
  return bad;
}

export interface Screener {
  /** The model's hate probability for the text, 0 to 1. */
  hate(text: string): Promise<number>;
}

export interface ScreenFiles {
  model: Uint8Array;
  tokenizerJson: string;
  tokenizerConfig: string;
}

const MAX_TOKENS = 128;

export async function createScreener(files: ScreenFiles): Promise<Screener> {
  const ort = await import('onnxruntime-web');
  const { Tokenizer } = await import('@huggingface/tokenizers');
  ort.env.wasm.numThreads = 1; // no worker threads in a function
  const tokenizer = new Tokenizer(JSON.parse(files.tokenizerJson), JSON.parse(files.tokenizerConfig));
  const session = await ort.InferenceSession.create(files.model, { executionProviders: ['wasm'] });
  return {
    async hate(text: string): Promise<number> {
      const enc = tokenizer.encode(text.slice(0, 2000));
      let ids = enc.ids as number[];
      let mask = enc.attention_mask as number[];
      if (ids.length > MAX_TOKENS) {
        ids = [...ids.slice(0, MAX_TOKENS - 1), ids[ids.length - 1]]; // keep the closing token
        mask = mask.slice(0, MAX_TOKENS);
      }
      const out = await session.run({
        input_ids: new ort.Tensor('int64', BigInt64Array.from(ids.map(BigInt)), [1, ids.length]),
        attention_mask: new ort.Tensor('int64', BigInt64Array.from(mask.map(BigInt)), [1, ids.length]),
      });
      const l = out.logits.data as Float32Array;
      const m = Math.max(l[0], l[1]);
      const e0 = Math.exp(l[0] - m), e1 = Math.exp(l[1] - m);
      return e1 / (e0 + e1);
    },
  };
}
