// Partner practice's encrypted channel (src/lib/cellCrypto.ts, src/lib/cellClient.ts) and its mailbox
// (netlify/functions/cell.mts, cell-cleanup.mts), with an in-memory store standing in for Netlify Blobs.
import handler, { __useStoresForTests, CELL_MAX_AGE_MS } from '../netlify/functions/cell.mts';
import { cleanupCells } from '../netlify/functions/cell-cleanup.mts';
import { cellIds, finishHandshake, newCellCode, normalizeCode, openMessage, sealMessage, startHandshake, verifyFranking } from '../src/lib/cellCrypto.ts';
import { CellClient, POLL_FAST_MS, POLL_SLOW_MS, nextPoll } from '../src/lib/cellClient.ts';
import { ok } from './helpers.mts';

class MemStore {
  m = new Map<string, string>();
  async get(k: string, o?: { type?: string }) { const v = this.m.get(k); return v === undefined ? null : o?.type === 'json' ? JSON.parse(v) : v; }
  async setJSON(k: string, v: unknown, o?: { onlyIfNew?: boolean }) { if (o?.onlyIfNew && this.m.has(k)) return { modified: false }; this.m.set(k, JSON.stringify(v)); return { modified: true, etag: 'x' }; }
  async getWithMetadata(k: string) { const v = this.m.get(k); return v === undefined ? null : { data: v, etag: 'e' + v }; }
  async set(k: string, v: string, o?: { onlyIfNew?: boolean; onlyIfMatch?: string }) {
    if (o?.onlyIfNew && this.m.has(k)) return { modified: false };
    if (o?.onlyIfMatch && 'e' + this.m.get(k) !== o.onlyIfMatch) return { modified: false };
    this.m.set(k, v); return { modified: true };
  }
  async delete(k: string) { this.m.delete(k); }
  async list(o: { prefix?: string } = {}) { return { blobs: [...this.m.keys()].filter((k) => k.startsWith(o.prefix ?? '')).map((key) => ({ key, etag: 'x' })) }; }
}
const cells = new MemStore();
const priv = new MemStore();
__useStoresForTests(cells, priv);
process.env.CELL_ENABLED = 'true';
delete process.env.COACH_EXTRA_HOSTS;

// ── Codes ──
const codes = Array.from({ length: 200 }, newCellCode);
ok('codes are 16 characters in four groups, from the unambiguous alphabet', codes.every((c) => /^[0-9A-HJKMNP-TV-Z]{4}(-[0-9A-HJKMNP-TV-Z]{4}){3}$/.test(c)));
ok('codes do not repeat (80 random bits)', new Set(codes).size === codes.length);
ok('a typed code is forgiving about case, spaces and look-alike letters', normalizeCode(codes[0].toLowerCase().replace(/-/g, ' ')) === codes[0] && normalizeCode('0000-0000-0000-000O') === '0000-0000-0000-0000' && normalizeCode('1111 IIII LLLL 1111') === '1111-1111-1111-1111');
ok('something that is not a code is refused', normalizeCode('hello') === null && normalizeCode('UUUU-UUUU-UUUU-UUUU') === null);
const ids = await cellIds(codes[0]);
ok('the mailbox name reveals nothing of the code', /^[0-9a-f]{32}$/.test(ids.box) && !ids.box.includes(codes[0].replace(/-/g, '').toLowerCase()) && (await cellIds(codes[1])).box !== ids.box);

// ── Key exchange and messages ──
const code = newCellCode();
const ha = await startHandshake(code, 'a');
const hb = await startHandshake(code, 'b');
const sa = await finishHandshake(ha, hb.hello);
const sb = await finishHandshake(hb, ha.hello);
ok('both people see the same safety colours', sa.safetyColors.join() === sb.safetyColors.join() && /^#[0-9A-F]{6}$/.test(sa.safetyColors[0]));
let threw = false;
try { await finishHandshake(await startHandshake(newCellCode(), 'b'), ha.hello); } catch { threw = true; }
ok('a key exchange made with a different code is refused (no one in the middle without the code)', threw);
threw = false;
const mallory = await startHandshake(newCellCode(), 'b');
try { await finishHandshake(ha, { pub: mallory.hello.pub, tag: hb.hello.tag }); } catch { threw = true; }
ok('a swapped public key is refused', threw);

const e1 = await sealMessage(sa, { kind: 'text', text: 'I felt unheard yesterday.', at: 1 });
const e2 = await sealMessage(sa, { kind: 'text', text: 'Can we try again?', assisted: 'I would like to try again. Would you be willing?', at: 2 });
ok('envelopes hold no readable text', !JSON.stringify([e1, e2]).includes('unheard') && !JSON.stringify([e1, e2]).includes('again'));
const o1 = await openMessage(sb, e1);
const o2 = await openMessage(sb, e2);
ok('the other person opens them in order', o1.text === 'I felt unheard yesterday.' && o2.assisted?.startsWith('I would like') && o2.text === 'Can we try again?');
threw = false;
try { await openMessage(sb, e1); } catch { threw = true; }
ok('a replayed message is refused', threw);
const e3 = await sealMessage(sa, { kind: 'text', text: 'third', at: 3 });
threw = false;
try { await openMessage(sb, { ...e3, ct: e3.ct.slice(0, -4) + 'AAA=' }); } catch { threw = true; }
ok('an altered message is refused, and does not spoil the next one', threw && (await openMessage(sb, e3)).text === 'third');
threw = false;
try { await openMessage(sb, { ...(await sealMessage(sa, { kind: 'text', text: 'x', at: 4 })), commit: e1.commit }); } catch { threw = true; }
ok('a message with someone else’s commitment is refused', threw);
ok("the sender's own messages cannot be opened with the sender's receiving key (one key chain per direction)", await (async () => { const e = await sealMessage(sb, { kind: 'text', text: 'y', at: 5 }); try { await openMessage(sb, e); return false; } catch { return true; } })());
ok('franking: the revealed text and key check out; an edited text does not', (await verifyFranking({ kind: 'text', text: o1.text, at: o1.at }, o1.frank, e1.commit)) && !(await verifyFranking({ kind: 'text', text: 'I felt heard.', at: o1.at }, o1.frank, e1.commit)));

// ── The mailbox ──
const post = (body: unknown, origin = 'https://nenya.biz') => handler(new Request('https://nenya.biz/api/cell', { method: 'POST', headers: { 'content-type': 'application/json', origin }, body: JSON.stringify(body) }));
const fetchImpl = (async (_url: string, init: RequestInit) => post(JSON.parse(String(init.body)))) as unknown as typeof fetch;
let r = await post({ action: 'hello', box: 'f'.repeat(32), role: 'b', hello: hb.hello });
ok('no one can join a cell that has not been opened', r.status === 404);
r = await post({ action: 'peer', box: 'f'.repeat(32), role: 'a' }, 'https://evil.example');
ok('a foreign site is refused', r.status === 403);

const queue: (() => void)[] = [];
const opts = { fetchImpl, schedule: (fn: () => void) => void queue.push(fn), hidden: () => false };
const A = await CellClient.create(opts);
ok('making a cell opens a mailbox and counts it, with nothing about who', [...cells.m.keys()].some((k) => k.endsWith('/meta')) && [...priv.m.keys()].some((k) => k.endsWith('/cell.opened')));
ok('before the other person joins there is no session', (await A.connect()) === null);
const B = await CellClient.join(A.code.toLowerCase(), opts);
const third = await startHandshake(A.code, 'b');
r = await post({ action: 'hello', box: third.ids.box, role: 'b', hello: third.hello });
ok('a third person with the code cannot take a seat', r.status === 409);
const colorsA = await A.connect();
const colorsB = await B.connect();
ok('the two clients connect and see the same safety colours', !!colorsA && colorsA.join() === colorsB?.join());
const gotB: string[] = [];
const flagged: string[] = [];
B.listen({ onMessage: (m) => gotB.push(m.text), onFlag: (f) => flagged.push(f.category) });
await A.send({ kind: 'text', text: 'Hello, I am here.' });
await A.send({ kind: 'text', text: 'I want to kill myself.' });
while (queue.length) { const fn = queue.shift()!; await fn(); if (gotB.length >= 2) break; }
await new Promise((res) => setTimeout(res, 20));
ok('messages travel through the mailbox and arrive in order', gotB.join('|') === 'Hello, I am here.|I want to kill myself.', gotB.join('|'));
ok('a crisis message is caught on the reader’s device', flagged.includes('self-harm'));
ok('the mailbox never held readable text', [...cells.m.values()].every((v) => !v.includes('kill') && !v.includes('Hello')));
r = await post({ action: 'send', box: third.ids.box, role: 'a', env: { seq: 0, iv: 'AAAA', ct: 'AAAA', commit: 'AAAA' } });
ok('a message out of sequence is refused', r.status === 409 && (await r.json()).next === 2);

// Report: B reveals A's first message.
const reportable: any[] = [];
const C = await CellClient.create(opts);
const D = await CellClient.join(C.code, opts);
await C.connect(); await D.connect();
D.listen({ onMessage: (m) => reportable.push(m) });
await C.send({ kind: 'text', text: 'You are worthless.' });
while (queue.length && !reportable.length) await queue.shift()!();
await new Promise((res) => setTimeout(res, 20));
const ref = await D.report(reportable[0]);
ok('a reported message whose franking checks out is kept for the owner', /^[0-9a-f]{16}$/.test(ref) && [...priv.m.entries()].some(([k, v]) => k.startsWith('cell-report/') && v.includes('You are worthless.') && !v.includes(D.session!.box)));
r = await post({ action: 'report', box: D.session!.box, role: 'b', seq: 0, message: { kind: 'text', text: 'You are wonderful.', at: reportable[0].at }, frank: reportable[0].frank });
ok('a report with altered text is refused (a report cannot be invented)', r.status === 422);

await C.close();
ok('closing deletes the whole cell', ![...cells.m.keys()].some((k) => k.includes(C.session!.box)));
r = await post({ action: 'poll', box: C.session!.box, role: 'b', after: 0 });
ok('a closed cell is gone for the other person too', r.status === 404);

// Time limit and cleanup.
const old = [...cells.m.keys()].find((k) => k.endsWith('/meta'))!;
cells.m.set(old, JSON.stringify({ created: Date.now() - CELL_MAX_AGE_MS - 1000 }));
const box = old.split('/')[1];
r = await post({ action: 'poll', box, role: 'a', after: 0 });
ok('a cell past its three hours is closed and refused', r.status === 410 && ![...cells.m.keys()].some((k) => k.includes(box)));
cells.m.set('cell/' + 'e'.repeat(32) + '/a/hello', '{}');
const E = await CellClient.create(opts);
const eBox = (await cellIds(E.code)).box;
const n = await cleanupCells(cells as never);
ok('the hourly job deletes leftovers and expired cells, and leaves open ones', n === 1 && [...cells.m.keys()].every((k) => !k.includes('e'.repeat(32))) && cells.m.has(`cell/${eBox}/meta`));
process.env.CELL_ENABLED = '';
r = await post({ action: 'peer', box, role: 'a' });
ok('the mailbox is off unless switched on', r.status === 503);

ok('polling slows down when nothing happens and speeds up after a message', nextPoll(POLL_FAST_MS, false) > POLL_FAST_MS && nextPoll(POLL_SLOW_MS, false) === POLL_SLOW_MS && nextPoll(POLL_SLOW_MS, true) === POLL_FAST_MS);
const st = async () => (await (await handler(new Request('https://nenya.biz/api/cell?status'))).json()).enabled;
process.env.CELL_ENABLED = 'true';
const on = await st();
process.env.CELL_ENABLED = '';
ok('the page is told whether cells are open', on === true && (await st()) === false);
