// Signs a real transcript through the function, then checks that scripts/verify-transcript.mjs accepts it
// and rejects every kind of tampering.
import handler from '../netlify/functions/coach.mts';
import { generateKeyPairSync } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ok } from './helpers.mts';

process.env.COACH_ENABLED = 'true';
process.env.VENICE_API_KEY = 'k';
process.env.COACH_TICKET_SECRET = 's3cret-s3cret-s3cret';
process.env.COACH_MODEL = 'deepseek-v3.2'; // these tests use the plain request path; the default encrypted model is covered in venice-e2ee.test.mts
process.env.COACH_SIGNING_KEY = generateKeyPairSync('ed25519').privateKey.export({ type: 'pkcs8', format: 'der' }).toString('base64');
(globalThis as any).fetch = async () => new Response(JSON.stringify({ choices: [{ message: { content: 'I hear that.' } }] }), { status: 200 });

const S = { color1: '#7A9B9E', color2: '#DAC682' };
const post = async (body: any) => {
  const r = await handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ session: S, ...body }) }));
  return r.json() as Promise<any>;
};

const m: any[] = [{ role: 'user', content: 'first' }];
const a1 = await post({ messages: m });
m.push({ role: 'assistant', content: a1.reply }, { role: 'user', content: 'second' });
const a2 = await post({ messages: m, ticket: a1.ticket });
m.push({ role: 'assistant', content: a2.reply });
const { receipt } = await post({ action: 'receipt', messages: m, ticket: a2.ticket });
ok('the function issued a receipt', !!receipt?.signature);

const dir = mkdtempSync(join(tmpdir(), 'nenya-verify-'));
const transcript = { v: 2, session: S, messages: m.map((x) => ({ role: x.role, content: x.content })) };
const write = (name: string, data: any) => { const p = join(dir, name); writeFileSync(p, JSON.stringify(data)); return p; };
const run = (file: string, keyId?: string) => spawnSync(process.execPath, ['scripts/verify-transcript.mjs', file, ...(keyId ? [keyId] : [])], { encoding: 'utf8' });

try {
  const good = run(write('good.json', { transcript, receipt }), receipt.keyId);
  ok('a genuine signed transcript verifies', good.status === 0 && /VALID/.test(good.stdout));
  ok('it also verifies without an expected key id', run(write('good2.json', { transcript, receipt })).status === 0);

  const edited = structuredClone(transcript); edited.messages[1].content = 'Totally different reply';
  ok('an edited reply is rejected', run(write('edited.json', { transcript: edited, receipt })).status === 1);
  const recolored = structuredClone(transcript); recolored.session.color1 = '#111111';
  ok('changed session colors are rejected', run(write('recolored.json', { transcript: recolored, receipt })).status === 1);
  ok('a changed date is rejected', run(write('redated.json', { transcript, receipt: { ...receipt, issuedAt: '2020-01-01T00:00:00.000Z' } })).status === 1);
  ok('a signature from a different key is rejected', run(write('wrongkey.json', { transcript, receipt: { ...receipt, publicKey: generateKeyPairSync('ed25519').publicKey.export({ type: 'spki', format: 'der' }).toString('base64') } })).status === 1);
  ok('the wrong expected key id is rejected', run(write('good3.json', { transcript, receipt }), 'deadbeefdeadbeef').status === 1);
  ok('a file that is not JSON is rejected', (() => { const p = join(dir, 'junk.json'); writeFileSync(p, 'not json'); return run(p).status === 1; })());
  ok('no file argument is a usage error', spawnSync(process.execPath, ['scripts/verify-transcript.mjs'], { encoding: 'utf8' }).status === 2);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
