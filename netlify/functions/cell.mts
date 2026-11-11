// The partner-practice mailbox (docs/ghost-footprint-stack.md): a place where two browsers leave each other encrypted
// messages (src/lib/cellCrypto.ts). It cannot read them: it sees a mailbox name derived from the cell's code (never the
// code), each side's public key with its tag, and envelopes of ciphertext with a sequence number and a franking commitment.
// It keeps them only while the cell is open: either person can close it, and nothing outlives CELL_MAX_AGE (3 hours),
// enforced here and by the hourly cleanup (cell-cleanup.mts). Off unless CELL_ENABLED=true.
//
//   POST {action:'hello', box, role, hello:{pub,tag}}   leave this side's half of the key exchange (once per side)
//   POST {action:'peer', box, role}                      the other side's half, or null while they have not joined
//   POST {action:'send', box, role, env:{seq,iv,ct,commit}}  add the next message (sequence numbers must follow on)
//   POST {action:'poll', box, role, after}               the other side's messages from `after` on (at most 50)
//   POST {action:'close', box, role}                     delete the whole cell now
//   POST {action:'report', box, role, seq, message, frank}  report one of the other side's messages: kept only if its
//                                                        franking check passes (the reporter chose to reveal it)
import { getStore } from '@netlify/blobs';
import { randomBytes } from 'node:crypto';
import { hostAllowed, storeNameFrom } from '../../src/lib/originHosts.ts';
import type { CounterStore } from '../../src/lib/dailyCap.ts';
import { addCount as tallyCount } from '../../src/lib/counters.ts';
import { verifyFranking, type CellMessage, type Envelope, type Role } from '../../src/lib/cellCrypto.ts';

export const CELL_MAX_AGE_MS = 3 * 60 * 60 * 1000;
const MAX_MESSAGES = 300; // per side
const MAX_CT_CHARS = 16000; // one envelope's ciphertext, base64 (about 12 KB)
const MAX_BODY = 24000;
const POLL_MAX = 50;
const BOX = /^[0-9a-f]{32}$/;
const B64 = /^[A-Za-z0-9+/]+={0,2}$/;

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

interface Meta {
  created: number;
}
const keys = (box: string) => ({
  meta: `cell/${box}/meta`,
  hello: (r: Role) => `cell/${box}/${r}/hello`,
  log: (r: Role) => `cell/${box}/${r}/log`,
});

/** Deletes every key of one cell. */
export async function closeCell(s: Store, box: string): Promise<void> {
  const k = keys(box);
  await Promise.allSettled([k.meta, k.hello('a'), k.hello('b'), k.log('a'), k.log('b')].map((key) => s.delete(key)));
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
  if (text.length > MAX_BODY) return json(413, { error: 'size' });
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(text);
  } catch {
    return json(400, { error: 'json' });
  }
  const box = typeof body.box === 'string' && BOX.test(body.box) ? body.box : '';
  const role = body.role;
  if (!box || !isRole(role)) return json(400, { error: 'cell' });
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
      if (!h || !short(h.pub, 120) || !short(h.tag, 64)) return json(400, { error: 'hello' });
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
      const seat = await s.setJSON(k.hello(role), { pub: h.pub, tag: h.tag }, { onlyIfNew: true });
      if (!seat.modified) return json(409, { error: 'taken' });
      return json(200, { ok: true, expiresAt: (meta?.created ?? now) + CELL_MAX_AGE_MS });
    }
    if (!meta) return json(404, { error: 'no cell' });

    if (body.action === 'peer') return json(200, { hello: (await s.get(k.hello(peer), { type: 'json' })) ?? null });

    if (body.action === 'send') {
      if (!(await s.get(k.hello(role)))) return json(409, { error: 'no hello' });
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
      return json(200, { messages: log.slice(after, after + POLL_MAX), total: log.length, closed: false });
    }

    if (body.action === 'close') {
      await closeCell(s, box);
      return json(200, { closed: true });
    }

    if (body.action === 'report') {
      // The reporter reveals one message the other side sent. It is kept only if it matches the commitment this mailbox relayed.
      const seq = body.seq;
      const m = body.message as CellMessage | undefined;
      if (!Number.isInteger(seq) || !m || typeof m.text !== 'string' || m.text.length > 4000 || typeof body.frank !== 'string') return json(400, { error: 'report' });
      const log = ((await s.get(k.log(peer), { type: 'json' })) as Envelope[] | null) ?? [];
      const sent = log[seq as number];
      const msg: CellMessage = { kind: m.kind, text: m.text, ...(typeof m.assisted === 'string' ? { assisted: m.assisted } : {}), at: Number(m.at) };
      if (!sent || !(await verifyFranking(msg, body.frank, sent.commit))) return json(422, { error: 'not verified' });
      const id = randomBytes(8).toString('hex');
      // Kept in the private store for the owner to read. The mailbox name is not kept with it.
      await privateStore().setJSON(`cell-report/${id}`, { receivedAt: new Date(now).toISOString(), message: msg, verified: true });
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
