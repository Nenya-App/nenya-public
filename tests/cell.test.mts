// Partner practice's encrypted channel (src/lib/cellCrypto.ts, src/lib/cellClient.ts) and its mailbox
// (netlify/functions/cell.mts, cell-cleanup.mts), with an in-memory store standing in for Netlify Blobs.
import handler, { __useStoresForTests, CELL_MAX_AGE_MS, MAX_REPORT_BODY, SHARE_ASK_MS } from '../netlify/functions/cell.mts';
import { cleanupCells } from '../netlify/functions/cell-cleanup.mts';
import { __useStoreForTests as useExpiryStore, expireCellReports } from '../netlify/functions/submission-expiry.mts';
import { KEEP_DAYS, cellReportDue } from '../src/lib/submissions.ts';
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
useExpiryStore(priv);
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

// Sharing the whole conversation with Nenya needs BOTH people: either asks, the other answers, and only then is it sent, once.
const heard: { C: any[]; D: any[] } = { C: [], D: [] };
const shares: { C: any[]; D: any[] } = { C: [], D: [] };
const refs: string[] = [];
const C = await CellClient.create(opts);
const D = await CellClient.join(C.code, opts);
await C.connect(); await D.connect();
C.listen({ onMessage: (m) => heard.C.push(m), onShare: (x) => shares.C.push(x) });
D.listen({ onMessage: (m) => heard.D.push(m), onShare: (x) => shares.D.push(x), onReported: (x) => refs.push(x) });
const tick = async () => { if (queue.length) await queue.shift()!(); await new Promise((res) => setTimeout(res, 3)); };
const pump = async (until: () => boolean) => { for (let g = 0; g < 60 && !until(); g++) await tick(); };
await C.send({ kind: 'text', text: 'You are worthless.', at: 1000 });
await pump(() => heard.D.length === 1);
await D.send({ kind: 'text', text: 'That hurt to hear.', at: 2000 });
await pump(() => heard.C.length === 1);
await C.send({ kind: 'text', text: 'I know. I am sorry.', at: 3000 });
await pump(() => heard.D.length === 2);
const filedAll = () => [...priv.m.entries()].filter(([k]) => k.startsWith('cell-report/'));
const shareKey = () => [...cells.m.keys()].find((k) => k.endsWith('/share'));
const direct = (role: 'a' | 'b', body: Record<string, unknown>) => post({ box: D.session!.box, role, ...body });
const line = (i: number, len = 1000, extra: Record<string, unknown> = {}) => ({ by: i % 2 ? 'b' : 'a', text: 'x'.repeat(len), at: 1700000000000 + i, ...extra });
const reqId = (n: number) => n.toString(16).padStart(16, '0');
// Agrees a request by hand (the asker asks, the other says yes) without the clients' own polling, so a test can send a custom report.
let nextReq = 1;
const agreedRequest = async (asker: 'a' | 'b' = 'b') => {
  const req = reqId(nextReq++);
  const first = await direct(asker, { action: 'share-ask', req });
  if (first.status === 409) {
    // an earlier request is still open: end it with a no from the other seat, then ask again
    const cur = JSON.parse(cells.m.get(shareKey()!)!);
    await direct(cur.by === 'a' ? 'b' : 'a', { action: 'share-answer', req: cur.req, agree: false });
    await direct(asker, { action: 'share-ask', req });
  }
  await direct(asker === 'a' ? 'b' : 'a', { action: 'share-answer', req, agree: true });
  return req;
};

// 1. D (joined) asks. Until C says yes, nothing can be sent, by anyone.
const asked = await D.askToShare();
ok('asking sends nothing and keeps nothing but an opaque note in the cell', filedAll().length === 0 && !!shareKey() && /^[0-9a-f]{16}$/.test(asked));
await pump(() => shares.C.some((x) => x.req === asked));
ok('the other person\'s browser is told there is a request, and that it is not theirs', shares.C.some((x) => x.req === asked && x.state === 'pending' && x.mine === false));
r = await direct('b', { action: 'report', req: asked, transcript: [line(0, 10)] });
ok('the asker alone cannot send it: refused until the other person agrees', r.status === 403 && filedAll().length === 0);
r = await direct('a', { action: 'report', req: asked, transcript: [line(0, 10)] });
ok('the other person cannot send it before answering either', r.status === 403 && filedAll().length === 0);
r = await direct('b', { action: 'share-answer', req: asked, agree: true });
ok('a person cannot answer their own request', r.status === 409 && filedAll().length === 0);
r = await direct('a', { action: 'share-ask', req: reqId(999) });
ok('while a request is open no other can be made', r.status === 409);
for (let g = 0; g < 8; g++) await tick();
ok('with no answer, nothing is sent however long the browsers poll', filedAll().length === 0 && refs.length === 0);
await C.answerShare(asked, true);
await pump(() => refs.length === 1);
ok('after both agreed, the asker\'s browser sends it, once', refs.length === 1 && /^[0-9a-f]{16}$/.test(refs[0]) && filedAll().length === 1);
const rec = JSON.parse(filedAll()[0][1]);
ok('the report holds the whole conversation in order, both people\'s words and times, with the seat that wrote each', JSON.stringify(rec.messages.map((m: any) => [m.by, m.text, m.at])) === JSON.stringify([['a', 'You are worthless.', 1000], ['b', 'That hurt to hear.', 2000], ['a', 'I know. I am sorry.', 3000]]));
ok('only that both agreed is kept with it: no mailbox name, no request id, nobody named as the asker, and it is stored as unverified', rec.bothAgreed === true && rec.verified === false && !JSON.stringify(rec).includes(D.session!.box) && !filedAll()[0][1].includes(asked) && !('reportedBy' in rec) && !('by' in rec) && !filedAll()[0][0].includes(D.session!.box));
r = await direct('b', { action: 'report', req: asked, transcript: [line(0, 10)] });
ok('the same request cannot be used again: one report per agreed request', r.status === 403 && filedAll().length === 1);
for (let g = 0; g < 8; g++) await tick();
ok('and the browsers do not send it a second time', refs.length === 1 && filedAll().length === 1);

// 2. Either seat may ask: C asks, D says no. Nothing is sent, ever, for that request.
const asked2 = await C.askToShare();
await pump(() => shares.D.some((x) => x.req === asked2 && x.state === 'pending'));
await D.answerShare(asked2, false);
await pump(() => shares.C.some((x) => x.req === asked2 && x.state === 'declined'));
ok('the person who made the code can ask too, and a no is seen by the asker', shares.C.some((x) => x.req === asked2 && x.state === 'declined'));
r = await direct('a', { action: 'report', req: asked2, transcript: [line(0, 10)] });
ok('after a no, nothing is sent, and the request cannot be sent by hand', r.status === 403 && filedAll().length === 1 && refs.length === 1);
r = await direct('b', { action: 'share-answer', req: asked2, agree: true });
ok('a no cannot be turned into a yes afterwards', r.status === 409 && filedAll().length === 1);

// 3. Unanswered requests lapse; agreed ones too if they are not sent in time.
const asked3 = await D.askToShare();
const key3 = shareKey()!;
cells.m.set(key3, JSON.stringify({ ...JSON.parse(cells.m.get(key3)!), at: Date.now() - SHARE_ASK_MS - 1000 }));
r = await direct('a', { action: 'share-answer', req: asked3, agree: true });
ok('an answer after the time is up is refused', r.status === 409);
cells.m.set(key3, JSON.stringify({ ...JSON.parse(cells.m.get(key3)!), agreed: { a: true, b: true } }));
r = await direct('b', { action: 'report', req: asked3, transcript: [line(0, 10)] });
ok('an agreed request that is not sent within the time sends nothing', r.status === 403 && filedAll().length === 1);
const after = await D.askToShare();
ok('a lapsed request is replaced by a new one, and consent is per request', after !== asked3 && (await direct('b', { action: 'report', req: asked3, transcript: [line(0, 10)] })).status === 403);
await direct('a', { action: 'share-answer', req: after, agree: false });

// 4. Limits on what a request can carry (the request must be agreed first).
const fileReport = async (transcript: unknown, extra: Record<string, unknown> = {}, asker: 'a' | 'b' = 'b') => direct(asker, { action: 'report', req: await agreedRequest(asker), transcript, ...extra });
const before = filedAll().length;
r = await fileReport(Array.from({ length: 600 }, (_, i) => line(i)));
ok('a full conversation (300 messages of 1,000 characters from each person) is accepted once both agreed', r.status === 200 && filedAll().length === before + 1);
r = await fileReport(Array.from({ length: 600 }, (_, i) => line(i, 1000, { assisted: 'y'.repeat(1000) })), {}, 'a');
ok('even with an assisted version of every message the largest report fits the request limit, from either seat', r.status === 200 && JSON.stringify({ action: 'report', box: 'b'.repeat(32), role: 'b', req: reqId(1), transcript: Array.from({ length: 600 }, (_, i) => line(i, 1000, { assisted: 'y'.repeat(1000) })) }).length < MAX_REPORT_BODY);
const kept = filedAll().length;
r = await fileReport(Array.from({ length: 601 }, (_, i) => line(i, 10)));
ok('more than 600 messages is refused', r.status === 400 && filedAll().length === kept);
r = await fileReport([line(0, 1001)]);
ok('a message over 1,000 characters is refused', r.status === 400 && filedAll().length === kept);
r = await fileReport([line(0, 10, { assisted: 'y'.repeat(1001) })]);
ok('an assisted version over 1,000 characters is refused', r.status === 400);
r = await fileReport([line(0, 10)], { pad: 'z'.repeat(MAX_REPORT_BODY) });
ok('a request over the size limit is refused outright', r.status === 413 && filedAll().length === kept);
r = await post({ action: 'send', box: D.session!.box, role: 'b', pad: 'z'.repeat(30000) });
ok('every other request keeps its small limit', r.status === 413);
ok('an empty report, a report with no list, and a line with a wrong seat or time are refused', (await fileReport([])).status === 400 && (await fileReport('hello')).status === 400 && (await fileReport([{ by: 'c', text: 'x', at: 1 }])).status === 400 && (await fileReport([{ by: 'a', text: 'x', at: 'now' }])).status === 400 && filedAll().length === kept);
r = await direct('b', { action: 'report', transcript: [line(0, 10)] });
ok('a report with no request at all is refused', r.status === 400 && filedAll().length === kept);
for (const [k] of filedAll()) if (k !== filedAll()[0][0]) priv.m.delete(k);
const filed = filedAll()[0];
const filedRec = JSON.parse(filed[1]);
ok('a report carries a keeping date 90 days after it was filed', KEEP_DAYS === 90 && Math.round((Date.parse(filedRec.keepUntil) - Date.parse(filedRec.receivedAt)) / 86400000) === 90);

const reportsKept = () => priv.m.get([...priv.m.keys()].find((k) => k.endsWith('/cell.report.verified'))!);
const totalBefore = reportsKept();
const DAY = 86400000;
const filedAt = Date.parse(filedRec.receivedAt);
priv.m.set('cell-report/young', JSON.stringify({ receivedAt: new Date(filedAt).toISOString(), keepUntil: new Date(filedAt + 89 * DAY).toISOString(), messages: [{ by: 'a', text: 'x', at: 1 }], verified: true }));
priv.m.set('cell-report/old', JSON.stringify({ receivedAt: new Date(filedAt - 91 * DAY).toISOString(), keepUntil: new Date(filedAt - DAY).toISOString(), messages: [{ by: 'a', text: 'x', at: 1 }], verified: true }));
priv.m.set('cell-report/older-undated', JSON.stringify({ receivedAt: new Date(filedAt - 91 * DAY).toISOString(), messages: [{ by: 'a', text: 'x', at: 1 }], verified: true }));
priv.m.set('cell-report/younger-undated', JSON.stringify({ receivedAt: new Date(filedAt - 10 * DAY).toISOString(), messages: [{ by: 'a', text: 'x', at: 1 }], verified: true }));
priv.m.set('other/keep', 'x');
const swept = await expireCellReports(new Date(filedAt + 1000));
ok('the daily job removes a report older than 90 days (dated, or undated and judged by when it was received) and keeps a younger one', swept === 2 && !priv.m.has('cell-report/old') && !priv.m.has('cell-report/older-undated') && priv.m.has('cell-report/young') && priv.m.has('cell-report/younger-undated') && priv.m.has(filed[0]) && priv.m.has('other/keep'));
ok('a report is gone exactly when 90 days have passed (not the day before)', !cellReportDue(filedRec, new Date(filedAt + 89 * DAY)) && cellReportDue(filedRec, new Date(filedAt + 91 * DAY)));
ok('an unreadable report is removed too, as with other reports', cellReportDue(null) && (priv.m.set('cell-report/broken', 'not json'), (await expireCellReports(new Date(filedAt))) === 1) && !priv.m.has('cell-report/broken'));
await expireCellReports(new Date(filedAt + 91 * DAY));
ok('an expired report leaves the "reports kept" total unchanged (a plain count of reports received)', !priv.m.has(filed[0]) && reportsKept() === totalBefore);
priv.m.delete('cell-report/young'); priv.m.delete('cell-report/younger-undated');
priv.m.set(filed[0], filed[1]);

await C.close();
ok('closing deletes the whole cell, including any request to share', ![...cells.m.keys()].some((k) => k.includes(C.session!.box)) && !shareKey());
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
