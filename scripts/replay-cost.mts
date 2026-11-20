// Same call, two sizes of model, through Venice: replays the exact request the coach sent to a small model (captured by
// `scripts/bakeoff-workers-ai.mts --capture calls.jsonl`) to each model named, and reports the tokens and dollars each used.
//
//   read -rs "VENICE_API_KEY?Venice testing key: "; echo; export VENICE_API_KEY      # zsh; the key is never printed or written
//   node scripts/replay-cost.mts --capture calls.jsonl --models google-gemma-4-26b-a4b-it,claude-opus-5-5 [--json out.json]
//
// Every model sees the identical messages (system text and history); nothing is fed back. Prices are read live from Venice's public
// /models list (USD per million tokens). Tokens come from each response's own `usage`. This spends Venice credit (a few cents for a
// handful of calls) and uses invented text only: do not point it at a capture made with the private text, or at anything personal.
import { readFileSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const flag = (n: string): string | undefined => (args.includes(n) ? args[args.indexOf(n) + 1] : undefined);
const captureFile = flag('--capture');
const models = (flag('--models') ?? '').split(',').filter(Boolean);
const jsonOut = flag('--json');
const key = process.env.VENICE_API_KEY;
if (!captureFile || models.length === 0 || !key) {
  console.error('Needs --capture <file>, --models a,b and VENICE_API_KEY in the environment (see the top of this file).');
  process.exit(2);
}
const list: any = await (await fetch('https://api.venice.ai/api/v1/models')).json();
const priceOf = (id: string): [number, number] => {
  const p = list.data?.find((m: any) => m.id === id)?.model_spec?.pricing;
  if (!p) throw new Error(`No Venice price for ${id}`);
  return [Number(p.input.usd), Number(p.output.usd)];
};
const rows = readFileSync(captureFile, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
const summary: Record<string, unknown>[] = [];
for (const model of models) {
  const [pin, pout] = priceOf(model);
  let tin = 0, tout = 0, secs = 0;
  let lastReply = '';
  for (const r of rows) {
    const t0 = Date.now();
    const res = await fetch('https://api.venice.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model, messages: r.messages, max_tokens: 2000, venice_parameters: { include_venice_system_prompt: false } }),
    });
    const j: any = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error(`${model}: ${res.status} ${JSON.stringify(j).slice(0, 300)}`);
      process.exit(1);
    }
    secs += (Date.now() - t0) / 1000;
    tin += j.usage?.prompt_tokens ?? 0;
    tout += j.usage?.completion_tokens ?? 0;
    lastReply = j.choices?.[0]?.message?.content ?? '';
  }
  const usd = (tin * pin + tout * pout) / 1e6;
  const row = { model, calls: rows.length, inputTokens: tin, outputTokens: tout, usdPerMillion: { in: pin, out: pout }, usd: +usd.toFixed(6), usdPerCall: +(usd / rows.length).toFixed(6), seconds: +secs.toFixed(1), lastReplyWords: lastReply.split(/\s+/).filter(Boolean).length };
  summary.push(row);
  console.log(JSON.stringify(row));
  console.log(`  reply: ${lastReply.replace(/\n+/g, ' ').slice(0, 400)}`);
}
if (jsonOut) writeFileSync(jsonOut, JSON.stringify({ ranAt: new Date().toISOString(), summary }, null, 2));
