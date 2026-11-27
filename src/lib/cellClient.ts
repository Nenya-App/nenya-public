// The browser's side of a partner-practice cell (src/lib/cellCrypto.ts, netlify/functions/cell.mts): makes or joins a
// cell, finishes the key exchange, sends and receives messages, and checks every incoming message for crisis language
// on this device (the server cannot read them).
//
// Polling is adaptive, to keep the footprint small: every 1.5 s just after a message, slowing step by step to every
// 15 s when nothing is happening, and stopped while the tab is hidden. A 20-minute session costs about 100 to 400
// small requests instead of the 800 a fixed 1.5 s poll would make.

import { detectFlag, type SafetyFlag } from './safetyFlags.ts';
import { finishHandshake, newCellCode, normalizeCode, openMessage, sealMessage, startHandshake, type CellMessage, type CellSession, type Envelope, type Handshake, type Opened, type Role } from './cellCrypto.ts';

/** One text message in a report: which seat wrote it ('a' made the code, 'b' joined), what it said, and when. */
export interface ReportLine {
  by: Role;
  text: string;
  assisted?: string;
  at: number;
}
export interface ShareState {
  req: string;
  mine: boolean;
  state: 'pending' | 'agreed' | 'declined' | 'used' | 'expired';
}
export const POLL_FAST_MS = 1500;
export const POLL_SLOW_MS = 15000;
/** The next wait: back to fast after activity, otherwise half again as long, up to the slow limit. */
export const nextPoll = (current: number, active: boolean): number => (active ? POLL_FAST_MS : Math.min(POLL_SLOW_MS, Math.round(current * 1.5)));

export interface CellEvents {
  /** The other person joined and the key exchange is done: the two safety colours to compare. */
  onConnected?: (colors: [string, string]) => void;
  onMessage?: (m: Opened) => void;
  /** A message from the other person that the crisis check stopped on this device (it is still shown, with resources). */
  onFlag?: (flag: SafetyFlag, m: Opened) => void;
  /** The state of the request to share the conversation with Nenya, on each poll while one is open. `mine` is true when this person asked. Only a request the other person agreed to is ever sent. */
  onShare?: (s: ShareState) => void;
  /** The conversation was sent to Nenya, after both people agreed. `ref` is the report's reference. */
  onReported?: (ref: string) => void;
  onClosed?: (reason: 'peer' | 'expired' | 'me') => void;
  onError?: (code: string) => void;
}

export interface CellClientOptions {
  endpoint?: string;
  fetchImpl?: typeof fetch;
  /** For tests: replaces the timer. */
  schedule?: (fn: () => void, ms: number) => unknown;
  /** For tests: whether the page is hidden. */
  hidden?: () => boolean;
}

export class CellClient {
  readonly code: string;
  readonly role: Role;
  session: CellSession | null = null;
  private hs: Handshake | null = null;
  /** This browser's seat key: random, kept in memory only, sent with every request so no one else can act for this seat. */
  private readonly seat = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join('');
  private readonly endpoint: string;
  private readonly fetchImpl: typeof fetch;
  private readonly schedule: (fn: () => void, ms: number) => unknown;
  private readonly hidden: () => boolean;
  private events: CellEvents = {};
  private wait = POLL_FAST_MS;
  private stopped = false;
  private sentFor = '';
  /** Every text message of this cell as this browser has it, both people's, in the order they were sent or opened here. Memory only; it is what a report sends. */
  private readonly transcript: ReportLine[] = [];

  private constructor(code: string, role: Role, o: CellClientOptions) {
    this.code = code;
    this.role = role;
    this.endpoint = o.endpoint ?? '/api/cell';
    this.fetchImpl = o.fetchImpl ?? ((input, init) => fetch(input, init));
    this.schedule = o.schedule ?? ((fn, ms) => setTimeout(fn, ms));
    this.hidden = o.hidden ?? (() => typeof document !== 'undefined' && document.visibilityState === 'hidden');
  }

  /** Makes a new cell. Show `client.code` to the person who makes it, to pass on directly to the other person. */
  static async create(o: CellClientOptions = {}): Promise<CellClient> {
    const c = new CellClient(newCellCode(), 'a', o);
    await c.hello();
    return c;
  }

  /** Joins a cell with the code the other person gave. */
  static async join(code: string, o: CellClientOptions = {}): Promise<CellClient> {
    const n = normalizeCode(code);
    if (!n) throw new Error('code');
    const c = new CellClient(n, 'b', o);
    await c.hello();
    return c;
  }

  private async post(body: Record<string, unknown>): Promise<Record<string, unknown>> {
    const res = await this.fetchImpl(this.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ box: this.hs?.ids.box, role: this.role, seat: this.seat, ...body }) });
    const j = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (res.status === 410 || (res.status === 404 && body.action !== 'hello')) {
      this.stop();
      this.events.onClosed?.(res.status === 410 ? 'expired' : 'peer');
      throw new Error('closed');
    }
    if (!res.ok) throw new Error(String(j.error ?? res.status));
    return j;
  }

  private async hello(): Promise<void> {
    this.hs = await startHandshake(this.code, this.role);
    await this.post({ action: 'hello', hello: this.hs.hello });
  }

  /** Once the other person has joined: finishes the exchange. Returns the two safety colours to compare, or null if they have not joined yet. */
  async connect(): Promise<[string, string] | null> {
    if (this.session) return this.session.safetyColors;
    const j = await this.post({ action: 'peer' });
    const theirs = j.hello as { pub: string; tag: string } | null;
    if (!theirs) return null;
    this.session = await finishHandshake(this.hs!, theirs);
    return this.session.safetyColors;
  }

  async send(m: Omit<CellMessage, 'at'> & { at?: number }): Promise<void> {
    if (!this.session) throw new Error('not connected');
    const env = await sealMessage(this.session, { ...m, at: m.at ?? Date.now() });
    await this.post({ action: 'send', env });
    if (m.kind === 'text') this.transcript.push({ by: this.role, text: m.text, ...(m.assisted !== undefined ? { assisted: m.assisted } : {}), at: m.at ?? Date.now() });
    this.wait = POLL_FAST_MS;
  }

  /** One poll: opens and hands on whatever has arrived. Returns how many messages came. */
  async pollOnce(): Promise<number> {
    if (!this.session) return 0;
    const j = await this.post({ action: 'poll', after: this.session.receive.seq });
    const list = (Array.isArray(j.messages) ? j.messages : []) as Envelope[];
    for (const env of list) {
      const m = await openMessage(this.session, env);
      if (m.kind === 'close') {
        this.stop();
        this.events.onClosed?.('peer');
        return list.length;
      }
      if (m.kind === 'text') this.transcript.push({ by: this.role === 'a' ? 'b' : 'a', text: m.text, ...(m.assisted !== undefined ? { assisted: m.assisted } : {}), at: m.at });
      this.events.onMessage?.(m);
      const flag = m.kind === 'text' ? detectFlag(m.text) : null;
      if (flag?.tier === 'stop') this.events.onFlag?.(flag, m);
    }
    const sh = j.share as { req?: unknown; by?: unknown; state?: unknown } | null | undefined;
    if (sh && typeof sh.req === 'string' && typeof sh.state === 'string') {
      const st: ShareState = { req: sh.req, mine: sh.by === this.role, state: sh.state as ShareState['state'] };
      this.events.onShare?.(st);
      // The person who asked sends the conversation, once, and only when the other person has agreed.
      if (st.mine && st.state === 'agreed' && this.sentFor !== st.req) {
        this.sentFor = st.req;
        try {
          this.events.onReported?.(await this.sendConversation(st.req));
        } catch {
          this.events.onShare?.({ ...st, state: 'expired' });
        }
      }
    }
    return list.length;
  }

  /** Starts the adaptive polling loop. */
  listen(events: CellEvents): void {
    this.events = events;
    this.stopped = false;
    const tick = async () => {
      if (this.stopped) return;
      let active = false;
      if (!this.hidden()) {
        try {
          if (!this.session) {
            const colors = await this.connect();
            active = colors !== null;
            if (colors) this.events.onConnected?.(colors);
          }
          else active = (await this.pollOnce()) > 0;
        } catch (e) {
          if (this.stopped) return;
          this.events.onError?.(e instanceof Error ? e.message : 'error');
        }
      }
      this.wait = nextPoll(this.wait, active);
      if (!this.stopped) this.schedule(tick, this.wait);
    };
    this.schedule(tick, 0);
  }

  stop(): void {
    this.stopped = true;
  }

  /** Asks the other person whether the whole conversation may be shared with Nenya (both people's words and times, kept 90 days by a person at Nenya). Nothing is sent now.
   *  Asking counts as the asker's own agreement; the conversation goes only after the other person says yes, and then this browser sends it, once. */
  async askToShare(): Promise<string> {
    const req = Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => b.toString(16).padStart(2, '0')).join('');
    await this.post({ action: 'share-ask', req });
    return req;
  }

  /** The answer to the other person's request. A no sends nothing, and nothing is ever sent for that request. */
  async answerShare(req: string, agree: boolean): Promise<void> {
    await this.post({ action: 'share-answer', req, agree });
  }

  /** Sends the whole conversation as this browser has it (both people's text messages, in order, with times). The mailbox holds only ciphertext, so it cannot confirm that
   *  this matches what was written: a report is what this browser sent. The mailbox refuses it unless both people agreed to this request. */
  private async sendConversation(req: string): Promise<string> {
    const j = await this.post({ action: 'report', req, transcript: this.transcript });
    return String(j.ref ?? '');
  }

  /** Ends the cell for both people and deletes it from the mailbox. */
  async close(): Promise<void> {
    if (this.session) {
      try {
        await this.send({ kind: 'close', text: '' });
      } catch {
        /* closing anyway */
      }
    }
    this.stop();
    await this.post({ action: 'close' }).catch(() => undefined);
    this.events.onClosed?.('me');
  }
}
