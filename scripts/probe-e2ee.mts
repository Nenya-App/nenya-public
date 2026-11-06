// Tries the encrypted Venice route once and prints exactly what happens, so a failing step can be seen without guessing.
//   VENICE_API_KEY=... node scripts/probe-e2ee.mts [model] [--minimal]
// The key is read from your own environment and is never printed. The test prompt is harmless and made up.
// --minimal sends the request without the extra sampling settings (temperature and so on), to show whether those are
// what Venice objects to.
import { e2eeChat, E2eeError } from '../src/lib/veniceE2ee.ts';

const apiKey = process.env.VENICE_API_KEY;
if (!apiKey) {
  console.error('Set VENICE_API_KEY in your environment first (do not paste it anywhere else).');
  process.exit(2);
}
const args = process.argv.slice(2);
const minimal = args.includes('--minimal');
const model = args.find((a) => !a.startsWith('--')) ?? 'e2ee-qwen-2-5-7b-p';
const params = minimal ? { max_completion_tokens: 80 } : { temperature: 0.7, top_p: 0.9, repetition_penalty: 1.1, max_completion_tokens: 80 };

console.log(`model: ${model}${minimal ? ' (minimal settings)' : ''}`);

// What the attestation says (all of it is public: keys, addresses and provider names; nothing secret is printed).
try {
  const { randomBytes } = await import('node:crypto');
  const nonce = randomBytes(32).toString('hex');
  const r = await fetch(`https://api.venice.ai/api/v1/tee/attestation?model=${encodeURIComponent(model)}&nonce=${nonce}`, { headers: { Authorization: `Bearer ${apiKey}` } });
  const a = (await r.json()) as Record<string, unknown>;
  const short = (v: unknown) => (typeof v === 'string' ? `${v.slice(0, 14)}… (${v.length} chars)` : JSON.stringify(v)?.slice(0, 60));
  console.log(`attestation: HTTP ${r.status}`);
  for (const [k, v] of Object.entries(a)) if (!/quote|payload|evidence|cert/i.test(k)) console.log(`  ${k}: ${short(v)}`);
  console.log('  (fields left out because they are large:', Object.keys(a).filter((k) => /quote|payload|evidence|cert/i.test(k)).join(', ') || 'none', ')');
} catch (e) {
  console.log('attestation: could not be read:', (e as Error).message);
}
try {
  const out = await e2eeChat({
    apiKey,
    model,
    params,
    messages: [
      { role: 'system', content: 'You are a friendly test assistant. Reply in one short sentence.' },
      { role: 'user', content: 'Can you tell me a bit about what you are for?' },
    ],
  });
  console.log('OK. Reply:', out.content, `(finish: ${out.finishReason ?? 'n/a'})`);
} catch (e) {
  if (e instanceof E2eeError) {
    console.error(`FAILED at step "${e.code}"${e.status ? `, HTTP status ${e.status}` : ''}`);
    if (e.detail) console.error(`Venice said: ${e.detail}`);
  } else {
    console.error('FAILED:', (e as Error).message);
  }
  process.exit(1);
}
