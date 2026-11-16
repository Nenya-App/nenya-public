// Which company runs the coach's model (docs/hosted-model-swap-scope.md, owner 2026-11-15). Venice stays the default until the owner switches;
// Workers AI (Cloudflare) is the hosted open model that replaces it. There is never an automatic fallback from one to the other: that would send a
// person's words to a company they were not told about. If the chosen one fails, the person sees the ordinary failure notice.
//
//   COACH_PROVIDER=workers-ai   with CF_AI_ACCOUNT_ID and the secret CF_AI_TOKEN (a token allowed only Workers AI)
//   COACH_MODEL                 the model; each provider has its own default

export type CoachProvider = 'venice' | 'workers-ai';

export const coachProvider = (env: Record<string, string | undefined> = process.env): CoachProvider =>
  env.COACH_PROVIDER === 'venice' ? 'venice' : 'workers-ai';

/** Gemma 4 26B-A4B (Apache 2.0): the 2026-11-15 bake-off leader. */
export const WORKERS_AI_DEFAULT_MODEL = '@cf/google/gemma-4-26b-a4b-it';
/** Qwen 2.5 7B in Venice's encrypted enclave. */
export const VENICE_DEFAULT_MODEL = 'e2ee-qwen-2-5-7b-p';

export function coachModel(env: Record<string, string | undefined> = process.env): string {
  if (env.COACH_MODEL) return env.COACH_MODEL;
  return coachProvider(env) === 'workers-ai' ? WORKERS_AI_DEFAULT_MODEL : VENICE_DEFAULT_MODEL;
}

/**
 * Added to the system instruction on Workers AI only. Gemma 4 kept within the 130-word rule in the bake-off but ran longer and more formal than
 * Venice's model (median 57 words against 37), so it is asked for less, in plainer words. The second run (with the private text) still offered
 * availability ("always here whenever you need") and declined medication advice without pointing to the prescriber, so those are named too.
 * ("Fully here" is not named: it is the example answer in the v2.1 instructions themselves.) Venice's prompt is unchanged.
 */
export const WORKERS_AI_STYLE_NOTE =
  'Keep each reply brief: usually two to four sentences and under 80 words. Use everyday words, not formal ones. Do not describe yourself or what you are unless the person asks. Do not offer to be there whenever they need. If medication comes up, suggest talking it over with whoever prescribes it.';

/** A Workers AI model id, as `cf ai models list` prints it. Anything else is refused rather than sent. */
export const isWorkersAiModel = (model: string): boolean => /^@cf\/[a-z0-9._-]+\/[a-z0-9._-]+$/i.test(model);

const ACCOUNT = /^[0-9a-f]{32}$/i;

export function workersAiUrl(account: string, model: string): string | null {
  if (!ACCOUNT.test(account) || !isWorkersAiModel(model)) return null;
  // The model id's slashes are part of the path, as Cloudflare's own examples write it.
  return `https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/${model}`;
}

interface Sampling {
  temperature: number;
  top_p: number;
  max_completion_tokens: number;
}

/** The request body: the same settings the bake-off measured (thinking off, so the reply is the answer and not the model's working). */
export const workersAiBody = (messages: { role: string; content: string }[], s: Sampling) => ({
  messages,
  temperature: s.temperature,
  top_p: s.top_p,
  max_tokens: s.max_completion_tokens,
  chat_template_kwargs: { enable_thinking: false },
});

/**
 * The reply from Cloudflare's answer. The REST API wraps it in `result`; a model answers in `choices` (newer) or `response` (older), and some put
 * the text in `reasoning_content` when thinking is off. Neurons are what the call cost, when Cloudflare reports them.
 */
export function readWorkersAi(j: unknown): { content: string; finish?: string; neurons?: number } {
  const root = (j && typeof j === 'object' ? j : {}) as Record<string, any>;
  const r = (root.result && typeof root.result === 'object' ? root.result : root) as Record<string, any>;
  const msg = r.choices?.[0]?.message ?? {};
  const content = String(msg.content ?? msg.reasoning_content ?? r.response ?? '');
  const neurons = Number(r.usage?.neurons ?? root.usage?.neurons);
  return { content, finish: r.choices?.[0]?.finish_reason, ...(Number.isFinite(neurons) ? { neurons } : {}) };
}
