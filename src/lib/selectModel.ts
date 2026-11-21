// The model that selects modules and cards by meaning (docs/small-model-detection-scope.md): sentence-transformers/all-MiniLM-L6-v2 (Apache-2.0), in the 8-bit ONNX conversion published by
// Xenova (https://huggingface.co/Xenova/all-MiniLM-L6-v2, file onnx/model_quantized.onnx, 22,972,370 bytes), with the model's own tokenizer files. Chosen in the bake-off of 2026-11-20
// (scripts/eval-select.mts on the invented set in src/lib/selectionEvalSet.ts): on the module topics it found 44% of fitting messages at a 5% false rate at threshold 0.24 (the phrase matcher: 40%
// at a rate that the set exaggerates), with a gentle fall-off either side. The threshold is a starting point to be read against real counts in shadow mode, not a finding.
// Files are pinned by SHA-256: a file that differs is refused and the relay carries on without the model (fail open). A new model is a new set of hashes in a reviewed change.
export const SELECT_MODEL_ID = 'sentence-transformers/all-MiniLM-L6-v2, int8 ONNX by Xenova (2026-11-20)';
export const SELECT_POOLING = 'mean' as const;
export const SELECT_THRESHOLD = 0.24;
export const SELECT_MAX = 3;

export const SELECT_FILE_HASHES = {
  model: 'afdb6f1a0e45b715d0bb9b11772f032c399babd23bfc31fed1c170afc848bdb1',
  tokenizerJson: 'da0e79933b9ed51798a3ae27893d3c5fa4a201126cef75586296df9b4d2c62a0',
  tokenizerConfig: '9261e7d79b44c8195c1cada2b453e55b00aeb81e907a6664974b4d7776172ab3',
} as const;

export const SELECT_KEYS = { model: 'select/model_int8.onnx', tokenizerJson: 'select/tokenizer.json', tokenizerConfig: 'select/tokenizer_config.json' } as const;

/** The names of the files whose hash does not match (empty when the model is intact). */
export async function selectFileProblems(files: { model: Uint8Array; tokenizerJson: string; tokenizerConfig: string }, expected: { model: string; tokenizerJson: string; tokenizerConfig: string } = SELECT_FILE_HASHES): Promise<string[]> {
  const { createHash } = await import('node:crypto');
  const sha = (d: Uint8Array | string): string => createHash('sha256').update(d).digest('hex');
  const bad: string[] = [];
  if (sha(files.model) !== expected.model) bad.push('model');
  if (sha(files.tokenizerJson) !== expected.tokenizerJson) bad.push('tokenizer');
  if (sha(files.tokenizerConfig) !== expected.tokenizerConfig) bad.push('tokenizer config');
  return bad;
}
