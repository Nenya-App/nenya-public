// The screening model (docs/coach-screening-flow-scope.md, sections 10 to 13): cardiffnlp/twitter-roberta-base-hate-latest, converted to ONNX and quantized to 8-bit (scripts/export-onnx.py), run on the
// server with onnxruntime-web (WebAssembly, so there is no native binary to ship) and a pure-JavaScript tokenizer. It scores ONE message for how likely it is to be hate speech and returns a band, not
// the score. Nothing is kept. The bands come from the bake-off: "high" is the score above which 2% of ordinary cases (HateCheck non-hateful and ETHOS non-hate) were flagged (held-out, median 2.0%);
// "mid" is the 5% line. The model is a second signal: on its own it only changes the tone of a reply or offers a card; it never ends a conversation.
export const SCREEN_MODEL_ID = 'cardiffnlp-twitter-roberta-base-hate-latest, int8 (2026-11-12)';
export const SCREEN_BANDS = { high: 0.993, mid: 0.985 } as const;
export type Band = 'high' | 'mid' | 'low';
export const bandOf = (p: number): Band => (p > SCREEN_BANDS.high ? 'high' : p > SCREEN_BANDS.mid ? 'mid' : 'low');

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
