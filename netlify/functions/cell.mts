// The partner-practice mailbox (docs/ghost-footprint-stack.md): a place where two browsers leave each other encrypted
// messages (src/lib/cellCrypto.ts). It cannot read them: it sees a mailbox name derived from the cell's code (never the
// code), each side's public key with its tag, and envelopes of ciphertext with a sequence number and a franking commitment.
// It keeps them only while the cell is open: either person can close it, and nothing outlives CELL_MAX_AGE (3 hours),
// enforced here and by the hourly cleanup (cell-cleanup.mts). Off unless CELL_ENABLED=true.
//
// Each browser makes a random seat key and sends it with every request. The mailbox keeps only a one-way code of it, and
// refuses any action for a seat without the matching key, so holding the cell's code is not enough to act for the other
// person (in particular, to agree to sharing for them). LIMIT: someone who takes BOTH seats themselves can do both
// sides' actions; there is then no second person in the cell.
//
//   Every POST below also carries `seat`, that browser's seat key.
//   POST {action:'hello', box, role, hello:{pub,tag}}   leave this side's half of the key exchange (once per side)
//   POST {action:'peer', box, role}                      the other side's half, or null while they have not joined
//   POST {action:'send', box, role, env:{seq,iv,ct,commit}}  add the next message (sequence numbers must follow on)
//   POST {action:'poll', box, role, after}               the other side's messages from `after` on (at most 50)
//   POST {action:'close', box, role}                     delete the whole cell now
//   POST {action:'share-ask', box, role, req}            ask to share the whole conversation with Nenya (the asker agrees by asking)
//   POST {action:'share-answer', box, role, req, agree}  the OTHER person's yes or no (a no sends nothing and ends the request)
//   POST {action:'report', box, role, req, transcript:[{by,text,assisted?,at}]}  send the whole conversation (up to 600 messages of 1,000
//                                                        characters). Refused unless BOTH people agreed to this request, and only once per request; kept
//                                                        unverified for 90 days, then deleted; the mailbox name is not kept with it
import { getStore } from '@netlify/blobs';
import { createHash, randomBytes } from 'node:crypto';
import { hostAllowed, storeNameFrom } from '../../src/lib/originHosts.ts';
import type { CounterStore } from '../../src/lib/dailyCap.ts';
import { addCount as tallyCount } from '../../src/lib/counters.ts';
import { cellReportKeepUntil } from '../../src/lib/submissions.ts';
import type { Envelope, Role } from '../../src/lib/cellCrypto.ts';

export const CELL_MAX_AGE_MS = 3 * 60 * 60 * 1000;
const MAX_MESSAGES = 300; // per side
const MAX_CT_CHARS = 16000; // one envelope's ciphertext, base64 (about 12 KB)
const MAX_BODY = 24000;
// A report carries the whole conversation: at most 2 x MAX_MESSAGES messages, each at most MAX_TEXT characters (plus the same again if a person's AI-assisted version is
// included), so a body can be about 1.3 million characters. Only a report may be that large; every other request keeps MAX_BODY.
export const MAX_TEXT = 1000;
export const MAX_REPORT_LINES = 2 * MAX_MESSAGES;
/** A request to share the conversation is open for 10 minutes; unanswered, or agreed but not yet sent, it lapses and nothing is sent. */
export const SHARE_ASK_MS = 10 * 60 * 1000;
export const MAX_REPORT_BODY = 1_300_000;
const POLL_MAX = 50;
const BOX = /^[0-9a-f]{32}$/;
const B64 = /^[A-Za-z0-9+/]+={0,2}$/;
const SEAT = /^[0-9a-f]{32}$/;
const seatCode = (seat: string): string => createHash('sha256').update(seat).digest('hex');

type Store = ReturnType<typeof getStore>;
let storeOverride: Store | null = null;
let privateOverride: Store | null = null;
export const __useStoresForTests = (cells: unknown, priv: unknown): void => {
  storeOverride = cells as Store | null;
  privateOverride = priv as Store | null;
};
const cells = (): Store => storeOverride ?? getStore({ name: `${storeNameFrom(process.env.COACH_STORE_NAME)}-cells`, consistency: 'strong' });
const privateStore = (): Store => privateOverride ?? getStore(storeNameFrom(process.env.COACH_STORE_NAME));

const json = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

/** The consent for sharing, kept in the cell and deleted with it: an opaque request id, which seat asked, when, who agreed, and whether it was declined or already used. Nothing else. */
interface Share {
  req: string;
  by: Role;
  at: number;
  agreed: Partial<Record<Role, true>>;
  state?: 'declined' | 'used';
}
const REQ = /^[0-9a-f]{16}$/;
/** What a person's browser is told about the open request (never the transcript). */
function shareView(sh: Share | null, now: number): { req: string; by: Role; state: 'pending' | 'agreed' | 'declined' | 'used' | 'expired' } | null {
  if (!sh) return null;
  const state = sh.state ?? (now - sh.at > SHARE_ASK_MS ? 'expired' : sh.agreed.a && sh.agreed.b ? 'agreed' : 'pending');
  return { req: sh.req, by: sh.by, state };
}

interface Meta {
  created: number;
}
/** One side's half of the key exchange, with the one-way code of its seat key (never sent back out). */
interface Hello {
  pub: string;
  tag: string;
  seat?: string;
}
const keys = (box: string) => ({
  meta: `cell/${box}/meta`,
  hello: (r: Role) => `cell/${box}/${r}/hello`,
  log: (r: Role) => `cell/${box}/${r}/log`,
  share: `cell/${box}/share`,
});

/** Deletes every key of one cell. */
export async function closeCell(s: Store, box: string): Promise<void> {
  const k = keys(box);
  await Promise.allSettled([k.meta, k.hello('a'), k.hello('b'), k.log('a'), k.log('b'), k.share].map((key) => s.delete(key)));
}

/** The transcript in a report, checked line by line and rebuilt from the known fields only; null if it is not acceptable (too long, too large, wrong shape). */
function parseTranscript(t: unknown): { by: Role; text: string; assisted?: string; at: number }[] | null {
  if (!Array.isArray(t) || t.length === 0 || t.length > MAX_REPORT_LINES) return null;
  const out: { by: Role; text: string; assisted?: string; at: number }[] = [];
  for (const x of t as Record<string, unknown>[]) {
    if (!x || (x.by !== 'a' && x.by !== 'b') || typeof x.text !== 'string' || x.text.length > MAX_TEXT || !Number.isFinite(x.at)) return null;
    if (x.assisted !== undefined && (typeof x.assisted !== 'string' || x.assisted.length > MAX_TEXT)) return null;
    out.push({ by: x.by, text: x.text, ...(typeof x.assisted === 'string' ? { assisted: x.assisted } : {}), at: Number(x.at) });
  }
  return out;
}

const isRole = (r: unknown): r is Role => r === 'a' || r === 'b';
const short = (s: unknown, max: number): s is string => typeof s === 'string' && s.length > 0 && s.length <= max && B64.test(s);
const envelopeOk = (e: unknown): e is Envelope => {
  const x = e as Envelope;
  return !!x && Number.isInteger(x.seq) && x.seq >= 0 && short(x.iv, 24) && short(x.ct, MAX_CT_CHARS) && short(x.commit, 64);
};

export default async (req: Request): Promise<Response> => {
  if (new URL(req.url).pathname !== '/api/cell') return json(404, { error: 'not found' });
  // Whether partner practice is open, so the page can say so before anyone makes a code.
  if (req.method === 'GET' && new URL(req.url).searchParams.has('status')) return json(200, { enabled: process.env.CELL_ENABLED === 'true' });
  if (req.method !== 'POST') return json(405, { error: 'method' });
  if (process.env.CELL_ENABLED !== 'true') return json(503, { error: 'off' });
  let origin = '';
  try {
    origin = new URL(req.headers.get('origin') ?? '').hostname;
  } catch {
    origin = '';
  }
  if (!hostAllowed(origin, process.env.COACH_EXTRA_HOSTS)) return json(403, { error: 'origin' });
  const text = await req.text();
  if (text.length > MAX_REPORT_BODY) return json(413, { error: 'size' });
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(text);
  } catch {
    return json(400, { error: 'json' });
  }
  if (text.length > MAX_BODY && body.action !== 'report') return json(413, { error: 'size' });
  const box = typeof body.box === 'string' && BOX.test(body.box) ? body.box : '';
  const role = body.role;
  if (!box || !isRole(role)) return json(400, { error: 'cell' });
  const seatKey = typeof body.seat === 'string' && SEAT.test(body.seat) ? body.seat : '';
  const peer: Role = role === 'a' ? 'b' : 'a';
  const k = keys(box);
  const s = cells();
  const now = Date.now();

  try {
    const meta = (await s.get(k.meta, { type: 'json' })) as Meta | null;
    if (meta && now - meta.created > CELL_MAX_AGE_MS) {
      await closeCell(s, box);
      return json(410, { error: 'expired' });
    }

    if (body.action === 'hello') {
      const h = body.hello as { pub?: unknown; tag?: unknown } | undefined;
      if (!h || !short(h.pub, 120) || !short(h.tag, 64) || !seatKey) return json(400, { error: 'hello' });
      // Only the person who made the code opens a cell; the other can only join one that is open.
      if (!meta && role === 'b') return json(404, { error: 'no cell' });
      // Two people, once each: a second "hello" for a side is refused, so no third person can take a seat. Both writes
      // are create-only, so two people trying at the same moment cannot both succeed.
      if (!meta) {
        const opened = await s.setJSON(k.meta, { created: now } satisfies Meta, { onlyIfNew: true });
        if (opened.modified) {
          try {
            await tallyCount(privateStore() as unknown as CounterStore, 'cell.opened');
          } catch {
            /* a count that cannot be kept never stops the cell */
          }
        }
      }
      const seat = await s.setJSON(k.hello(role), { pub: h.pub, tag: h.tag, seat: seatCode(seatKey) } satisfies Hello, { onlyIfNew: true });
      if (!seat.modified) return json(409, { error: 'taken' });
      return json(200, { ok: true, expiresAt: (meta?.created ?? now) + CELL_MAX_AGE_MS });
    }
    if (!meta) return json(404, { error: 'no cell' });

    // Everything else is done for a seat, and only with that seat's key.
    const own = (await s.get(k.hello(role), { type: 'json' })) as Hello | null;
    if (!own) return json(409, { error: 'no hello' });
    if (!seatKey || own.seat !== seatCode(seatKey)) return json(403, { error: 'seat' });

    if (body.action === 'peer') {
      const theirs = (await s.get(k.hello(peer), { type: 'json' })) as Hello | null;
      return json(200, { hello: theirs ? { pub: theirs.pub, tag: theirs.tag } : null });
    }

    if (body.action === 'send') {
      if (!envelopeOk(body.env)) return json(400, { error: 'envelope' });
      const log = ((await s.get(k.log(role), { type: 'json' })) as Envelope[] | null) ?? [];
      if (log.length >= MAX_MESSAGES) return json(429, { error: 'full' });
      const env = body.env as Envelope;
      if (env.seq !== log.length) return json(409, { error: 'seq', next: log.length });
      log.push({ seq: env.seq, iv: env.iv, ct: env.ct, commit: env.commit });
      await s.setJSON(k.log(role), log);
      return json(200, { ok: true });
    }

    if (body.action === 'poll') {
      const after = Number.isInteger(body.after) && (body.after as number) >= 0 ? (body.after as number) : 0;
      const log = ((await s.get(k.log(peer), { type: 'json' })) as Envelope[] | null) ?? [];
      const share = shareView((await s.get(k.share, { type: 'json' })) as Share | null, now);
      return json(200, { messages: log.slice(after, after + POLL_MAX), total: log.length, closed: false, share });
    }

    if (body.action === 'close') {
      await closeCell(s, box);
      return json(200, { closed: true });
    }

    if (body.action === 'share-ask') {
      // Either person may ask. Asking is the asker's own agreement; the other person must still say yes. One open request at a time.
      if (!REQ.test(String(body.req))) return json(400, { error: 'req' });
      const cur = shareView((await s.get(k.share, { type: 'json' })) as Share | null, now);
      if (cur && (cur.state === 'pending' || cur.state === 'agreed')) return json(409, { error: 'pending' });
      await s.setJSON(k.share, { req: String(body.req), by: role, at: now, agreed: { [role]: true } } satisfies Share);
      return json(200, { ok: true, expiresAt: now + SHARE_ASK_MS });
    }

    if (body.action === 'share-answer') {
      // Only the other person answers, only for the open request. A no ends it and nothing is sent.
      const cur = (await s.get(k.share, { type: 'json' })) as Share | null;
      const view = shareView(cur, now);
      if (!cur || !view || view.req !== body.req || cur.by === role || view.state !== 'pending' || typeof body.agree !== 'boolean') return json(409, { error: 'no request' });
      await s.setJSON(k.share, body.agree ? { ...cur, agreed: { ...cur.agreed, [role]: true } } : { ...cur, state: 'declined' });
      return json(200, { ok: true });
    }

    if (body.action === 'report') {
      // The whole conversation as the reporting person's browser has it: both people's text messages, in order, with times. It is accepted only for a request
      // that BOTH people agreed to (the asker by asking, the other by answering yes), within SHARE_ASK_MS, and once: the request is marked used before anything is kept.
      // There is no other way in: one person cannot send the other person's words alone.
      // LIMIT: this mailbox holds only ciphertext and cannot read or check any of it, so it cannot confirm the transcript matches what was written. A report is what the
      // reporting person's browser sent; it is stored as unverified.
      const lines = parseTranscript(body.transcript);
      if (!lines || !REQ.test(String(body.req))) return json(400, { error: 'report' });
      const cur = (await s.getWithMetadata(k.share, { type: 'json' })) as { data: Share | string; etag?: string } | null;
      const sh = cur ? ((typeof cur.data === 'string' ? JSON.parse(cur.data) : cur.data) as Share) : null;
      const view = shareView(sh, now);
      if (!cur || !sh || !view || view.req !== body.req || view.state !== 'agreed') return json(403, { error: 'not agreed' });
      const used = cur.etag ? await s.set(k.share, JSON.stringify({ ...sh, state: 'used' }), { onlyIfMatch: cur.etag }) : { modified: false };
      if (!used.modified) return json(409, { error: 'used' });
      const id = randomBytes(8).toString('hex');
      // Kept in the private store for the owner to read, for 90 days (the same KEEP_DAYS as other reports); the daily submission-expiry job removes it then.
      // Kept with it: the lines (with which seat wrote each) and that both people agreed. Not kept: the mailbox name, the request id, or who asked.
      await privateStore().setJSON(`cell-report/${id}`, { receivedAt: new Date(now).toISOString(), keepUntil: cellReportKeepUntil(new Date(now)), messages: lines, bothAgreed: true, verified: false });
      // "Reports kept" (cell.report.verified, a name from when a report was checked; it now counts every report filed) is a plain running count of reports received:
      // it is never lowered, so a report that expires or is deleted stays in it.
      try {
        await tallyCount(privateStore() as unknown as CounterStore, 'cell.report.verified');
      } catch {
        /* as above */
      }
      return json(200, { reported: true, ref: id });
    }

    return json(400, { error: 'action' });
  } catch {
    return json(503, { error: 'store' });
  }
};

export const config = { path: '/api/cell' };
