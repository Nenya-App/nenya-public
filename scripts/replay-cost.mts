// Same call, two sizes of model, through Venice: replays the exact request the coach sent to a small model (captured by
// `scripts/bakeoff-workers-ai.mts --capture calls.jsonl`) to each model named, and reports the tokens and dollars each used.
//
//   read -rs "VENICE_API_KEY?Venice testing key: "; echo; export VENICE_API_KEY      # zsh; the key is never printed or written
//   node scripts/replay-cost.mts --capture calls.jsonl --models google-gemma-4-26b-a4b-it,claude-opus-5-5 [--json out.json]
//
// A model whose id starts with @cf/ is a Workers AI model: it goes through the signed-in Cloudflare CLI (`cf ai run`, free allowance, no key here),
// and its price is read from `cf ai models list`. Those runs spend Neurons, not Venice credit, and need no VENICE_API_KEY.
// Every model sees the identical messages (system text and history); nothing is fed back. Prices are read live from Venice's public
// /models list (USD per million tokens). With VENICE_ADMIN_KEY also set (an admin key; hidden prompt, never printed), it reads GET /billing/balance
// before and after the run and prints every number that changed, so the billed cost sits next to the token-based estimate (the balance can lag
// a little, so a zero difference may only mean it has not settled; run it again after a minute). Tokens come from each response's own `usage`. This spends Venice credit (a few cents for a
// handful of calls) and uses invented text only: do not point it at a capture made with the private text, or at anything personal.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';

const args = process.argv.slice(2);
const flag = (n: string): string | undefined => (args.includes(n) ? args[args.indexOf(n) + 1] : undefined);
const captureFile = flag('--capture');
const models = (flag('--models') ?? '').split(',').filter(Boolean);
const jsonOut = flag('--json');
// --openrouter sends every model that is not a @cf/ one through OpenRouter instead of Venice (OPENROUTER_API_KEY; ids such as anthropic/claude-haiku-5.5). The request asks for hosts that do not collect data; add --zdr to require zero-data-retention hosts.
const viaOpenRouter = args.includes('--openrouter');
const key = viaOpenRouter ? process.env.OPENROUTER_API_KEY : process.env.VENICE_API_KEY;
if (!captureFile || models.length === 0 || (!key && models.some((m) => !m.startsWith('@cf/')))) {
  console.error('Needs --capture <file>, --models a,b and VENICE_API_KEY (or OPENROUTER_API_KEY with --openrouter) in the environment (see the top of this file).');
  process.exit(2);
}
const CF = process.env.CF_BIN ?? join(homedir(), '.npm-global/bin/cf');
const list: any = models.some((m) => !m.startsWith('@cf/')) ? await (await fetch(viaOpenRouter ? 'https://openrouter.ai/api/v1/models' : 'https://api.venice.ai/api/v1/models')).json() : { data: [] };
let cfList: any[] | null = null;
const priceOf = (id: string): [number, number] => {
  if (id.startsWith('@cf/')) {
    cfList ??= JSON.parse(spawnSync(CF, ['ai', 'models', 'list'], { encoding: 'utf8', maxBuffer: 1 << 28 }).stdout);
    const pr = cfList!.find((m) => m.name === id)?.properties?.find((p: any) => p.property_id === 'price')?.value;
    const f = (u: string) => Number(pr?.find((x: any) => String(x.unit).endsWith(u))?.price);
    // Some models carry no per-token price in the list: their cost is then taken from the Neurons at the paid rate ($0.011 per 1,000, from memory: check it), marked by NaN.
    if (!pr || Number.isNaN(f('input tokens'))) return [NaN, NaN];
    return [f('input tokens'), f('output tokens') || 0];
  }
  if (viaOpenRouter) {
    // OpenRouter lists USD per token.
    const o = list.data?.find((m: any) => m.id === id)?.pricing;
    if (!o) throw new Error(`No OpenRouter price for ${id}`);
    return [Number(o.prompt) * 1e6, Number(o.completion) * 1e6];
  }
  const p = list.data?.find((m: any) => m.id === id)?.model_spec?.pricing;
  if (!p) throw new Error(`No Venice price for ${id}`);
  return [Number(p.input.usd), Number(p.output.usd)];
};
const adminKey = process.env.VENICE_ADMIN_KEY;
// The balance response's field names are not fixed here: every numeric field is flattened to a path, so whatever the endpoint returns is compared.
const flat = (v: unknown, path = ''): Record<string, number> =>
  typeof v === 'number' ? { [path]: v } : v && typeof v === 'object' ? Object.assign({}, ...Object.entries(v).map(([k, x]) => flat(x, path ? `${path}.${k}` : k))) : {};
const balance = async (): Promise<Record<string, number> | null> => {
  if (!adminKey) return null;
  const r = await fetch('https://api.venice.ai/api/v1/billing/balance', { headers: { authorization: `Bearer ${adminKey}` } });
  if (!r.ok) {
    console.error(`Balance read failed: ${r.status} (the admin key may be wrong; the run goes on without it).`);
    return null;
  }
  return flat(await r.json());
};
const before = await balance();
const rows = readFileSync(captureFile, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
const summary: Record<string, unknown>[] = [];
for (const model of models) {
  const [pin, pout] = priceOf(model);
  let tin = 0, tout = 0, secs = 0, neurons = 0;
  let lastReply = '';
  for (const r of rows) {
    const t0 = Date.now();
    let j: any;
    if (model.startsWith('@cf/')) {
      const dir = mkdtempSync(join(tmpdir(), 'nenya-replay-'));
      const f = join(dir, 'req.json');
      writeFileSync(f, JSON.stringify({ messages: r.messages, max_tokens: 2000 }));
      const o = spawnSync(CF, ['ai', 'run', model, '--body', `@${f}`], { encoding: 'utf8', timeout: 180_000 });
      rmSync(dir, { recursive: true, force: true });
      try {
        j = JSON.parse(o.stdout);
      } catch {
        console.error(`${model}: no answer (${(o.stdout + o.stderr).slice(0, 300)})`);
        process.exit(1);
      }
      j = j.result ?? j;
      neurons += Number(j.usage?.neurons ?? 0);
    } else {
      const res = await fetch(viaOpenRouter ? 'https://openrouter.ai/api/v1/chat/completions' : 'https://api.venice.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
        body: JSON.stringify(viaOpenRouter ? { model, messages: r.messages, max_tokens: 2000, provider: { data_collection: 'deny', ...(args.includes('--zdr') ? { zdr: true } : {}) } } : { model, messages: r.messages, max_tokens: 2000, venice_parameters: { include_venice_system_prompt: false } }),
      });
      j = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error(`${model}: ${res.status} ${JSON.stringify(j).slice(0, 300)}`);
        process.exit(1);
      }
    }
    secs += (Date.now() - t0) / 1000;
    tin += j.usage?.prompt_tokens ?? 0;
    tout += j.usage?.completion_tokens ?? 0;
    lastReply = j.choices?.[0]?.message?.content ?? j.response ?? '';
  }
  const usd = Number.isNaN(pin) ? (neurons * 0.011) / 1000 : (tin * pin + tout * pout) / 1e6;
  const row = { model, calls: rows.length, inputTokens: tin, outputTokens: tout, usdPerMillion: Number.isNaN(pin) ? 'not listed: cost from Neurons' : { in: pin, out: pout }, usd: +usd.toFixed(6), usdPerCall: +(usd / rows.length).toFixed(6), seconds: +secs.toFixed(1), ...(model.startsWith('@cf/') ? { neurons: +neurons.toFixed(2) } : {}), lastReplyWords: lastReply.split(/\s+/).filter(Boolean).length };
  summary.push(row);
  console.log(JSON.stringify(row));
  console.log(`  reply: ${lastReply.replace(/\n+/g, ' ').slice(0, 400)}`);
}
if (before) {
  await new Promise((r) => setTimeout(r, 15000));
  const after = await balance();
  if (after) {
    const changes = Object.keys(after).filter((k) => after[k] !== before[k]).map((k) => ({ field: k, before: before[k], after: after[k], change: +(after[k] - before[k]).toFixed(6) }));
    console.log(`\nBalance change over the run (${changes.length ? 'fields that moved' : 'nothing moved yet: it may not have settled'}):`);
    for (const c of changes) console.log(`  ${c.field}: ${c.before} -> ${c.after} (${c.change})`);
    summary.push({ balanceChanges: changes });
  }
}
if (jsonOut) writeFileSync(jsonOut, JSON.stringify({ ranAt: new Date().toISOString(), summary }, null, 2));
