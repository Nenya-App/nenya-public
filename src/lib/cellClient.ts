// The browser's side of a partner-practice cell (src/lib/cellCrypto.ts, netlify/functions/cell.mts): makes or joins a
// cell, finishes the key exchange, sends and receives messages, and checks every incoming message for crisis language
// on this device (the server cannot read them).
//
// Polling is adaptive, to keep the footprint small: every 1.5 s just after a message, slowing step by step to every
// 15 s when nothing is happening, and stopped while the tab is hidden. A 20-minute session costs about 100 to 400
// small requests instead of the 800 a fixed 1.5 s poll would make.

import { detectFlag, type SafetyFlag } from './safetyFlags.ts';
import { finishHandshake, newCellCode, normalizeCode, openMessage, sealMessage, startHandshake, type CellMessage, type CellSession, type Envelope, type Handshake, type Opened, type Role } from './cellCrypto.ts';

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
  private readonly endpoint: string;
  private readonly fetchImpl: typeof fetch;
  private readonly schedule: (fn: () => void, ms: number) => unknown;
  private readonly hidden: () => boolean;
  private events: CellEvents = {};
  private wait = POLL_FAST_MS;
  private stopped = false;

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
    const res = await this.fetchImpl(this.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ box: this.hs?.ids.box, role: this.role, ...body }) });
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
      this.events.onMessage?.(m);
      const flag = m.kind === 'text' ? detectFlag(m.text) : null;
      if (flag?.tier === 'stop') this.events.onFlag?.(flag, m);
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

  /** Reports one of the other person's messages: reveals it to Nenya with the key that proves it was sent. */
  async report(m: Opened): Promise<string> {
    const j = await this.post({ action: 'report', seq: m.seq, message: { kind: m.kind, text: m.text, ...(m.assisted !== undefined ? { assisted: m.assisted } : {}), at: m.at }, frank: m.frank });
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
