// The models Nenya tests or runs (docs/expanded-buildout-scope.md, workstream A/B): what each one is, where it runs, and what has been checked about it. Reports label runs from here, and the
// conformance suite will run the same cases for every entry. Nothing here is a claim to the public: `checked` says what was verified, from where, and when; null means not stated or not checked.
// Add an entry before testing a model, and say who tuned it and under what license, or write null.

export type Tuning = 'instruct' | 'refusals-removed' | 'unknown';
export type RunsOn = 'venice' | 'workers-ai' | 'local';
export type Privacy = 'venice-e2ee-private' | 'provider-reads' | 'on-device';

export interface ModelEntry {
  /** The id the runner sees: Venice's id, a Workers AI id, or the local server's model name. */
  id: string;
  label: string;
  family: 'gemma-4' | 'qwen-2.5' | 'apertus' | 'llama-3.2';
  /** Parameters in billions, stored and active per token (null if not stated). */
  totalB: number | null;
  activeB: number | null;
  tuning: Tuning;
  runsOn: RunsOn;
  /** Hardware-attested encryption (Venice's E2EE mode). */
  attested: boolean;
  privacy: Privacy;
  /** Who made this build and tuned it, if known. */
  tuner: string | null;
  license: string | null;
  quantization: string | null;
  /** What was checked and when; null = not checked. */
  checked: string | null;
  notes?: string;
}

export const MODEL_REGISTRY: ModelEntry[] = [
  { id: 'e2ee-gemma-4-26b-a4b-uncensored-p', label: 'Gemma 4 26B A4B Uncensored (Venice, encrypted)', family: 'gemma-4', totalB: 26, activeB: 4, tuning: 'refusals-removed', runsOn: 'venice', attested: true, privacy: 'venice-e2ee-private', tuner: null, license: null, quantization: null,
    checked: "Venice's model page, 2026-11-16: E2EE and Private, 64K context; the page does not say who tuned it or its license", notes: 'The production default since 2026-11-16 (src/lib/coachProvider.ts).' },
  { id: 'e2ee-qwen-2-5-7b-p', label: 'Qwen 2.5 7B (Venice, encrypted)', family: 'qwen-2.5', totalB: 7.6, activeB: 7.6, tuning: 'instruct', runsOn: 'venice', attested: true, privacy: 'venice-e2ee-private', tuner: 'Alibaba (Qwen)', license: 'Apache-2.0 (not rechecked)', quantization: null,
    checked: null, notes: 'The coach model until 2026-11-16; kept for older transcripts.' },
  { id: '@cf/google/gemma-4-26b-a4b-it', label: 'Gemma 4 26B A4B instruct (Workers AI)', family: 'gemma-4', totalB: 26, activeB: 4, tuning: 'instruct', runsOn: 'workers-ai', attested: false, privacy: 'provider-reads', tuner: 'Google', license: 'Apache-2.0 (stated by the owner, 2026-11-15)', quantization: null,
    checked: 'Cloudflare data-usage page, 2026-11-15: not trained on, not kept after the request', notes: 'The Workers AI default (kept as a toggle); about 25 Neurons a turn with the private text.' },
  { id: '@cf/swiss-ai/apertus-v1.5-8b', label: 'Apertus 1.5 8B (Workers AI)', family: 'apertus', totalB: 8, activeB: 8, tuning: 'instruct', runsOn: 'workers-ai', attested: false, privacy: 'provider-reads', tuner: 'Swiss AI Initiative', license: null, quantization: null,
    checked: null, notes: 'Access requested from Cloudflare 2026-11-15; not granted as of 2026-11-17 (the canary candidate task errors until it is).' },
  { id: 'gemma-4-e2b-it-uncensored', label: 'Gemma 4 E2B uncensored (local, Q4_K_M)', family: 'gemma-4', totalB: 5, activeB: 2, tuning: 'refusals-removed', runsOn: 'local', attested: false, privacy: 'on-device', tuner: 'TrevorJS (abliteration of Google gemma-4-E2B-it)', license: 'Apache-2.0 (the model page, 2026-11-17)', quantization: 'Q4_K_M GGUF (3.43 GB)',
    checked: 'Hugging Face model page, 2026-11-17: 3 refusals in 686 prompts after abliteration; a Q8_0 build (4.97 GB) also exists', notes: 'LM Studio server name; the target for the on-device direction.' },
  { id: 'google/gemma-4-e2b', label: 'Gemma 4 E2B instruct (local, MLX 4-bit)', family: 'gemma-4', totalB: 5, activeB: 2, tuning: 'instruct', runsOn: 'local', attested: false, privacy: 'on-device', tuner: 'Google (lmstudio-community MLX build)', license: 'Apache-2.0 (the base model)', quantization: 'MLX 4-bit',
    checked: null, notes: 'The instruct control for the E2B comparison; the matched pair is the GGUF Q4_K_M of the same model (not yet run).' },
  { id: 'apertus-8b-instruct-2509', label: 'Apertus 8B instruct 2509 (local, Q4_K_S)', family: 'apertus', totalB: 8, activeB: 8, tuning: 'instruct', runsOn: 'local', attested: false, privacy: 'on-device', tuner: 'Swiss AI Initiative (unsloth GGUF build)', license: null, quantization: 'Q4_K_S GGUF (about 4.4 GB)',
    checked: null, notes: 'The September 2025 release; the Workers AI one is 1.5. Label results by version.' },
  { id: 'llama-3.2-1b-instruct', label: 'Llama 3.2 1B instruct (local, MLX 4-bit)', family: 'llama-3.2', totalB: 1.2, activeB: 1.2, tuning: 'instruct', runsOn: 'local', attested: false, privacy: 'on-device', tuner: 'Meta (mlx-community build)', license: 'Llama 3.2 Community License (custom terms and use policy, not Apache)', quantization: 'MLX 4-bit',
    checked: null, notes: 'The smallest data point; a very weak model.' },
];

export const modelEntry = (id: string): ModelEntry | undefined => MODEL_REGISTRY.find((m) => m.id === id);

/** A short label for reports: "Gemma 4 E2B uncensored (local, Q4_K_M)" or, for an unknown id, the id itself. */
export const modelLabel = (id: string): string => modelEntry(id)?.label ?? id;

/** Problems with the registry itself (duplicate ids, a model with no label), for a test. */
export function registryProblems(): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const m of MODEL_REGISTRY) {
    if (seen.has(m.id)) out.push(`duplicate id ${m.id}`);
    seen.add(m.id);
    if (!m.label.trim()) out.push(`${m.id}: no label`);
    if (m.activeB !== null && m.totalB !== null && m.activeB > m.totalB) out.push(`${m.id}: active parameters exceed total`);
    if (m.runsOn === 'local' && m.privacy !== 'on-device') out.push(`${m.id}: a local model must be on-device`);
    if (m.attested && m.privacy !== 'venice-e2ee-private') out.push(`${m.id}: only the Venice E2EE mode is attested`);
  }
  return out;
}
