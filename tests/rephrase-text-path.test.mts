// Ordinary cell messages (kind 'text') and the rephrasing safety handling (src/lib/cellClient.ts): with VITE_REPHRASE on they behave
// like the rephrasing kinds (only danger to self or others pauses; abuse-category findings never reach the reader); with it off,
// exactly as before (any stop-tier finding pauses). The mailbox is untouched either way.
import handler, { __useStoresForTests } from '../netlify/functions/cell.mts';
import { CellClient } from '../src/lib/cellClient.ts';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ok } from './helpers.mts';

class MemStore {
  m = new Map<string, string>();
  async get(k: string, o?: { type?: string }) { const v = this.m.get(k); return v === undefined ? null : o?.type === 'json' ? JSON.parse(v) : v; }
  async setJSON(k: string, v: unknown, o?: { onlyIfNew?: boolean }) { if (o?.onlyIfNew && this.m.has(k)) return { modified: false }; this.m.set(k, JSON.stringify(v)); return { modified: true, etag: 'x' }; }
  async getWithMetadata(k: string) { const v = this.m.get(k); return v === undefined ? null : { data: v, etag: 'e' + v }; }
  async set(k: string, v: string, o?: { onlyIfNew?: boolean }) { if (o?.onlyIfNew && this.m.has(k)) return { modified: false }; this.m.set(k, v); return { modified: true }; }
  async delete(k: string) { this.m.delete(k); }
  async list(o: { prefix?: string } = {}) { return { blobs: [...this.m.keys()].filter((k) => k.startsWith(o.prefix ?? '')).map((key) => ({ key, etag: 'x' })) }; }
}
const cells = new MemStore();
__useStoresForTests(cells, new MemStore());
process.env.CELL_ENABLED = 'true';
delete process.env.COACH_EXTRA_HOSTS;
const post = (body: unknown) => handler(new Request('https://nenya.biz/api/cell', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify(body) }));
const fetchImpl = (async (_u: string, init: RequestInit) => post(JSON.parse(String(init.body)))) as unknown as typeof fetch;

async function reads(rephrase: boolean, text: string) {
  const o = { fetchImpl, schedule: () => undefined, hidden: () => false, rephrase };
  const A = await CellClient.create(o);
  const B = await CellClient.join(A.code, o);
  await A.connect(); await B.connect();
  const got: string[] = []; const flags: string[] = [];
  B.listen({ onMessage: (m) => got.push(m.text), onFlag: (f) => flags.push(f.category) });
  await A.send({ kind: 'text', text });
  await B.pollOnce();
  return { got, flags, store: [...cells.m.values()].join('\n') };
}

const abuse = 'he hits me and I am afraid of him';
const danger = 'I want to kill myself.';
const calm = 'I would like to talk about last night.';

const offAbuse = await reads(false, abuse);
ok('switch off: an abuse-category message pauses the reader, as before', offAbuse.flags.includes('abuse') && offAbuse.got[0] === abuse);
const onAbuse = await reads(true, abuse);
ok('switch on: the same message reaches the reader with no pause and no notice', onAbuse.flags.length === 0 && onAbuse.got[0] === abuse);
ok('switch off: danger to self pauses', (await reads(false, danger)).flags.includes('self-harm'));
ok('switch on: danger to self pauses, exactly as for the rephrasing kinds', (await reads(true, danger)).flags.includes('self-harm'));
ok('either way an ordinary message raises nothing', (await reads(false, calm)).flags.length === 0 && (await reads(true, calm)).flags.length === 0);
ok('the mailbox holds nothing readable either way, and what it sees is unchanged', !/hits me|kill myself|last night/.test(offAbuse.store + onAbuse.store));

// The page: the new handling exists only behind the switch.
const root = fileURLToPath(new URL('..', import.meta.url));
const page = readFileSync(root + 'src/cell/CellPage.tsx', 'utf8');
const client = readFileSync(root + 'src/lib/cellClient.ts', 'utf8');
ok('the writer\'s private check on a typed message runs only with the switch on', /if \(rephraseOn\(\) && !privateFlag\)/.test(page) && /checkOutgoing\(\[text\]\)/.test(page));
ok('the reader\'s notice is the cell\'s own with the switch on and the old one with it off', /rephraseOn\(\) \? <ReaderNotice flag=\{paused\.flag\} \/> : <FlagNotice/.test(page));
ok('the client\'s default follows the switch', /o\.rephrase \?\? rephraseOn\(\)/.test(client));
const notice = readFileSync(root + 'src/cell/ReaderNotice.tsx', 'utf8') + readFileSync(root + 'src/lib/rephraseWords.ts', 'utf8');
ok('the reader\'s wording does not speak as an AI, repeat the message, or name the writer', !/I.m an AI|I am an AI|AI systems/.test(notice) && !/flaggedMessage/.test(readFileSync(root + 'src/cell/ReaderNotice.tsx', 'utf8')));
