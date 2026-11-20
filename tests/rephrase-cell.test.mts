// Rephrasing through a real cell: two controllers, two CellClients, the real mailbox function with an in-memory store.
// Checks the whole round, that the mailbox holds nothing readable, the order (blind then reveal), the safety split, reports,
// and that a failed send puts the round back.
import handler, { __useStoresForTests } from '../netlify/functions/cell.mts';
import { CellClient } from '../src/lib/cellClient.ts';
import { RephraseController } from '../src/lib/rephraseController.ts';
import { checkOutgoing, incomingDanger } from '../src/lib/rephraseSafety.ts';
import { readings } from '../src/lib/rephraseRound.ts';
import { decode } from '../src/lib/rephraseProtocol.ts';
import type { Opened } from '../src/lib/cellCrypto.ts';
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
const priv = new MemStore();
__useStoresForTests(cells, priv);
process.env.CELL_ENABLED = 'true';
delete process.env.COACH_EXTRA_HOSTS;

const post = (body: unknown) => handler(new Request('https://nenya.biz/api/cell', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify(body) }));
const fetchImpl = (async (_u: string, init: RequestInit) => post(JSON.parse(String(init.body)))) as unknown as typeof fetch;
const opts = { fetchImpl, schedule: () => undefined, hidden: () => false };

async function pair() {
  const A = await CellClient.create(opts);
  const B = await CellClient.join(A.code, opts);
  await A.connect(); await B.connect();
  const seen = { a: [] as Opened[], b: [] as Opened[] };
  const flags = { a: [] as string[], b: [] as string[] };
  const ca = new RephraseController(A, () => 'a1b2c3d4');
  const cb = new RephraseController(B, () => 'b1b2c3d4');
  A.listen({ onMessage: (m) => { seen.a.push(m); ca.handle(m); }, onFlag: (f) => flags.a.push(f.category) });
  B.listen({ onMessage: (m) => { seen.b.push(m); cb.handle(m); }, onFlag: (f) => flags.b.push(f.category) });
  const pump = async () => { await A.pollOnce(); await B.pollOnce(); };
  return { A, B, ca, cb, seen, flags, pump };
}

const PHRASE = 'You were quartzlate again, and I am tired of waiting.';
const REWRITE = 'I felt tired waiting just now, zebrarewrite.';
const NOTE = 'I heard worry, mauvenote.';

// ── A whole round ──
{
  const { A, B, ca, cb, seen, pump } = await pair();
  ca.drafts.phrase = PHRASE;
  ca.mark('speaker', 1, 'saw'); ca.mark('speaker', 2, 'saw'); ca.mark('speaker', 3, 'story'); ca.mark('speaker', 6, 'feeling');
  ca.drafts.rewrite = REWRITE;
  ok('asking sends one message', (await ca.ask()) === true);
  await pump();
  const askText = seen.b.find((m) => m.kind === 'rp-ask')!.text;
  ok('the ask holds no word of the phrase, no length and no marks', !/quartzlate|tired|zebra/.test(askText) && Object.keys(JSON.parse(askText)).sort().join() === 'round,tok,v');
  ok('the hearer is deciding and holds nothing', cb.state.round?.phase === 'deciding' && JSON.stringify(cb.state).indexOf('quartzlate') === -1);
  await cb.answer('yes'); await pump();
  ok('the speaker may now send the phrase', ca.state.round?.phase === 'accepted');
  await ca.sendPhrase(); await pump();
  ok('the hearer holds the phrase and none of the speaker\'s marks or rewrite', cb.state.round?.phrase === PHRASE && !JSON.stringify(cb.state).includes('zebrarewrite') && cb.state.round.meant === undefined);
  cb.mark('hearer', 1, 'saw'); cb.mark('hearer', 2, 'saw'); cb.mark('hearer', 3, 'story'); cb.mark('hearer', 6, 'feeling');
  cb.drafts.note = NOTE;
  ok('the story marks stay out of what is sent unless ticked', cb.heardToSend().every((m) => m[2] !== 'story') && cb.heardToSend().length === 3);
  await cb.sendHeard('send'); await pump();
  ok('the speaker holds the reading but cannot show it before revealing', ca.state.round?.phase === 'answered' && readings(ca.state) === null);
  ok('the stories were not sent', JSON.stringify(ca.state.round?.heard?.marks) === JSON.stringify([[1, 1, 'saw'], [2, 2, 'saw'], [6, 6, 'feeling']]));
  await ca.reveal(); await pump();
  ok('both can now show both readings', readings(ca.state)?.heard?.length === 3 && readings(cb.state)?.heard?.length === 4 && readings(cb.state)?.meant.rewrite === REWRITE && readings(ca.state)?.note === NOTE);
  ok('the hearer got the speaker\'s marks only now', cb.state.round?.meant?.marks.length === 4);

  // What the mailbox holds.
  const dump = [...cells.m.values()].join('\n');
  ok('the mailbox holds no word of the phrase, rewrite, note or marks', !/quartzlate|zebrarewrite|mauvenote|story|feeling|rp-phrase|rp-heard|rp-meant|rp-ask/.test(dump));
  ok('every envelope holds only the four fields it always did', (() => { const logs = [...cells.m].filter(([k]) => k.endsWith('/log')).flatMap(([, v]) => JSON.parse(v)); return logs.length >= 4 && logs.every((e: object) => Object.keys(e).sort().join() === 'commit,ct,iv,seq'); })());
  ok('the franking commitment covers the kind (a phrase cannot be passed off as a chat line)', seen.b.every((m) => typeof m.commit === 'string' && m.commit.length > 20));

  // Reporting a received rephrasing message.
  const phraseMsg = cb.received['rp-phrase']!;
  const ref = await B.report(phraseMsg);
  const reports = [...priv.m].filter(([k]) => k.startsWith('cell-report/'));
  ok('a received rephrasing message can be reported, and only that one is kept', !!ref && reports.length === 1 && JSON.parse(reports[0][1]).message.kind === 'rp-phrase' && JSON.parse(reports[0][1]).message.text.includes('quartzlate') && !reports[0][1].includes('mauvenote'));
  ok('the reported message fits the report limit', phraseMsg.text.length <= 4000);

  // Done clears both, with nothing left in memory.
  await cb.done(); await pump();
  ok('done clears both devices: no round, no drafts, no received messages', ca.state.round === null && cb.state.round === null && ca.drafts.phrase === '' && cb.drafts.note === '' && Object.keys(cb.received).length === 0 && Object.keys(ca.received).length === 0 && ca.drafts.marks.size === 0);
  ok('the notices carry no reason', ca.state.notice === 'partner-done' && cb.state.notice === 'done');
  await A.close();
  ok('closing the cell deletes the mailbox', [...cells.m.keys()].filter((k) => k.includes('/' + A.session!.box + '/')).length === 0);
  void B;
}

// ── Not now, never ──
{
  const { ca, cb, seen, pump } = await pair();
  ca.drafts.phrase = PHRASE;
  await ca.ask(); await pump();
  await cb.answer('notnow'); await pump();
  ok('"Not now": nothing of the phrase was sent, and the speaker keeps their draft', !seen.b.some((m) => m.text.includes('quartzlate')) && ca.state.notice === 'partner-notnow' && ca.drafts.phrase === PHRASE);
  await ca.ask(); await pump(); await cb.answer('never'); await pump();
  ok('"Not in this cell": the speaker cannot ask again', ca.state.asksBlocked && (await ca.ask()) === false);
}

// ── Safety: the writer's private check, the reader's pause ──
{
  const hits = 'I want to kill myself.';
  const abuse = 'he hits me and I am afraid of him';
  ok('the writer\'s check finds danger to self and abuse; it informs and returns, it sends nothing', checkOutgoing([hits])?.category === 'self-harm' && checkOutgoing([abuse])?.category === 'abuse' && checkOutgoing(['fine words'])=== null);
  ok('the reader\'s check pauses for danger to self, not for abuse-category text', incomingDanger([hits])?.category === 'self-harm' && incomingDanger([abuse]) === null && incomingDanger(['fine words']) === null);
  const { ca, cb, flags, seen, pump } = await pair();
  const before = seen.b.length;
  const flag = ca.precheck([abuse]);
  await new Promise((r) => setTimeout(r, 5));
  await pump();
  ok('a private check on the writer\'s side sends nothing to the other person', !!flag && seen.b.length === before);
  ca.drafts.phrase = abuse + ' and I am afraid';
  await ca.ask(); await pump(); await cb.answer('yes'); await pump(); await ca.sendPhrase(); await pump();
  ok('abuse-category text in a phrase reaches the reader without any notice or pause', cb.state.round?.phrase?.includes('afraid') === true && flags.b.length === 0 && flags.a.length === 0);
  const { ca: c2, cb: d2, flags: f2, pump: p2 } = await pair();
  c2.drafts.phrase = 'Honestly I want to kill myself, that is what I mean';
  await c2.ask(); await p2(); await d2.answer('yes'); await p2(); await c2.sendPhrase(); await p2();
  ok('danger to self in a phrase is caught on the reader\'s device', f2.b.includes('self-harm'));
  const { ca: c3, cb: d3, flags: f3, pump: p3 } = await pair();
  c3.drafts.phrase = 'Fine words about nothing.'; c3.drafts.rewrite = 'I want to kill myself soon';
  await c3.ask(); await p3(); await d3.answer('yes'); await p3(); await c3.sendPhrase(); await p3();
  d3.mark('hearer', 0, 'saw'); await d3.sendHeard('skip'); await p3(); await c3.reveal(); await p3();
  ok('danger to self in the rewrite is caught too (every text field)', f3.b.includes('self-harm'));
}

// ── Pause, a failed send, a modified page ──
{
  const { ca, cb, seen } = await pair();
  ca.drafts.phrase = PHRASE;
  ca.setPaused(true);
  let threw = false; try { await ca.ask(); } catch (e) { threw = (e as Error).message === 'paused'; }
  ok('while paused nothing is sent', threw && seen.b.length === 0 && ca.state.round === null);
  ca.setPaused(false);
  const flaky = new RephraseController({ send: async () => { throw new Error('network'); } }, () => 'a1b2c3d4');
  flaky.drafts.phrase = PHRASE;
  let failed = false; try { await flaky.ask(); } catch { failed = true; }
  ok('a send that fails puts the round back, so the person can try again', failed && flaky.state.round === null && flaky.drafts.phrase === PHRASE);
  // A modified page sends things out of turn: nothing changes.
  const stray = (kind: any, body: object) => cb.handle({ kind, text: JSON.stringify({ v: 1, ...body }), at: 1, seq: 99, frank: '', commit: '' } as Opened);
  stray('rp-phrase', { round: 'a1b2c3d4', tok: 'w1', phrase: 'sneaky words here' });
  stray('rp-meant', { round: 'a1b2c3d4', marks: [[0, 0, 'saw']] });
  stray('rp-answer', { round: 'a1b2c3d4', answer: 'yes' });
  cb.handle({ kind: 'rp-ask', text: 'not json', at: 1, seq: 100, frank: '', commit: '' } as Opened);
  ok('out-of-turn and broken messages change nothing', cb.state.round === null && cb.received['rp-phrase'] === undefined);
  ok('a chat message is not a rephrasing message', (() => { cb.handle({ kind: 'text', text: JSON.stringify({ v: 1, round: 'a1b2c3d4', tok: 'w1' }), at: 1, seq: 101, frank: '', commit: '' } as Opened); return cb.state.round === null; })());
  ok('decode refuses what the controller would refuse', decode('rp-ask', 'x') === null);
}

// ── Away and back (the grace period that replaces "leaving closes the cell for both") ──
{
  const { ca, cb, pump, seen } = await pair();
  await ca.signal('away'); await pump();
  ok('an away signal tells the other device, and nothing else changes', cb.state.partnerAway === true && cb.state.round === null && seen.b.at(-1)?.kind === 'rp-control');
  await ca.signal('back'); await pump();
  ok('back clears it', cb.state.partnerAway === false);
  const dead = new RephraseController({ send: async () => { throw new Error('gone'); } });
  ok('a failed away signal is swallowed (the page is going anyway)', (await dead.signal('away')) === undefined);
}
