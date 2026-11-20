// One device's side of rephrasing: the round's rules (src/lib/rephraseRound.ts) joined to a way of sending (the cell client) and
// to the person's own drafts. Everything it holds lives in this object, in page memory: no storage, no network of its own, and
// it is emptied when a round is done or stopped. The page drives it; tests drive it through a real cell.
import { marksFromMap, tokenize, type Mark, type MarkKind } from './rephraseKinds.ts';
import { decode, encode, isRpKind, MAX_NOTE, MAX_PHRASE, MAX_REWRITE, MAX_WORDS, newRoundId, type RephraseKind, type Slider } from './rephraseProtocol.ts';
import { initialState, step, type Event, type Local, type Meant, type RoundState } from './rephraseRound.ts';
import { checkOutgoing } from './rephraseSafety.ts';
import { checkLock, makeLock } from './rephraseLock.ts';
import type { SafetyFlag } from './safetyFlags.ts';
import type { CellMessage, Opened } from './cellCrypto.ts';

export interface Transport {
  send(m: Omit<CellMessage, 'at'>): Promise<void>;
}

export interface Drafts {
  /** The speaker's phrase, marks (word by word), rewrite and the needs they chose to include. */
  phrase: string;
  marks: Map<number, MarkKind>;
  rewrite: string;
  sliders: Slider[];
  /** The hearer's marks and sentence, and whether stories are sent with them (not unless ticked). */
  heardMarks: Map<number, MarkKind>;
  note: string;
  includeStories: boolean;
}
const blank = (): Drafts => ({ phrase: '', marks: new Map(), rewrite: '', sliders: [], heardMarks: new Map(), note: '', includeStories: false });

/** Notices after which nothing of the round should stay in memory. */
const CLEARS = new Set(['done', 'partner-done', 'stopped', 'partner-stopped']);

export class RephraseController {
  state: RoundState = initialState();
  drafts: Drafts = blank();
  /** The messages as they arrived, so the person can report one (the reporter chooses). */
  received: Partial<Record<RephraseKind, Opened>> = {};
  paused = false;
  /** What the speaker locked in when the phrase went (kept here, never sent until the reveal). */
  private locked: { meant: Meant; key: string } | null = null;
  /** Hearer: whether what was shown is what the speaker fixed before the hearer marked (null: not known, or no lock). */
  lockState: boolean | null = null;
  private listeners = new Set<() => void>();
  private readonly transport: Transport;
  private readonly newId: () => string;
  constructor(transport: Transport, newId: () => string = newRoundId) {
    this.transport = transport;
    this.newId = newId;
  }

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => void this.listeners.delete(fn);
  }
  private changed(): void {
    for (const f of this.listeners) f();
  }
  /** Tells the page the drafts changed (the controller does not watch them). */
  touch(): void {
    this.changed();
  }
  setPaused(p: boolean): void {
    this.paused = p;
    this.changed();
  }

  /** Tells the other page this one is hidden, or back (nothing else changes, and a failure is not worth a word). */
  async signal(step: 'away' | 'back'): Promise<void> {
    try {
      await this.transport.send({ kind: 'rp-control', text: encode('rp-control', { step }) });
    } catch {
      /* the other page simply is not told */
    }
  }

  /** Empties everything the round and the person's drafts hold. */
  clearAll(): void {
    this.state = { ...initialState(), asksBlocked: this.state.asksBlocked, ignoreAsks: this.state.ignoreAsks };
    this.drafts = blank();
    this.received = {};
    this.locked = null;
    this.lockState = null;
    this.changed();
  }

  private apply(e: Event): { ok: boolean; send?: { kind: RephraseKind; text: string } } {
    const r = step(this.state, e);
    if (!r.ok) return { ok: false };
    this.state = r.state;
    if (r.state.notice && CLEARS.has(r.state.notice)) {
      this.drafts = blank();
      this.received = {};
      this.locked = null;
      this.lockState = null;
    }
    return { ok: true, ...(r.send ? { send: { kind: r.send.kind, text: encode(r.send.kind, r.send.body as never) } } : {}) };
  }

  /** A message from the other person. Anything that is not exactly a valid message for the round right now changes nothing. */
  handle(m: Opened): void {
    if (!isRpKind(m.kind)) return;
    const body = decode(m.kind, m.text);
    if (!body) return;
    const r = step(this.state, { t: 'in', kind: m.kind, body } as Event);
    if (!r.ok) return;
    this.state = r.state;
    this.received[m.kind] = m;
    if (m.kind === 'rp-meant') void this.verifyLock();
    if (r.state.notice && CLEARS.has(r.state.notice)) {
      this.drafts = blank();
      this.received = {};
      this.locked = null;
      this.lockState = null;
    }
    this.changed();
  }

  private async verifyLock(): Promise<void> {
    const r = this.state.round;
    if (!r || r.side !== 'hearer' || !r.meant || !r.lock || !r.meant.lockKey) {
      this.lockState = r?.meant ? false : null;
      this.changed();
      return;
    }
    const { lockKey, ...core } = r.meant;
    this.lockState = await checkLock(core, lockKey!, r.lock);
    this.changed();
  }

  private async act(e: Local): Promise<boolean> {
    if (this.paused) throw new Error('paused');
    const before = this.state;
    const beforeDrafts = this.drafts;
    const r = this.apply(e);
    if (!r.ok) return false;
    this.changed();
    if (r.send) {
      try {
        await this.transport.send({ kind: r.send.kind, text: r.send.text });
      } catch (err) {
        // Nothing went: put the round back as it was, so the person can try again.
        this.state = before;
        this.drafts = beforeDrafts;
        this.changed();
        throw err;
      }
    }
    return true;
  }

  // ── What the person may do ──
  /** The writer's private check over everything about to be sent in the next step. Sends nothing; the result is for this person alone. */
  precheck(texts: readonly string[]): SafetyFlag | null {
    return checkOutgoing(texts);
  }
  words(): string[] {
    return tokenize(this.drafts.phrase);
  }
  private clip(marks: Map<number, MarkKind>, count: number): Mark[] {
    return marksFromMap(new Map([...marks].filter(([i]) => i < count)));
  }

  ask(): Promise<boolean> {
    const n = this.words().length;
    if (!this.drafts.phrase.trim() || this.drafts.phrase.length > MAX_PHRASE || n > MAX_WORDS) throw new Error('phrase');
    return this.act({ t: 'ask', id: this.newId() });
  }
  cancel(): Promise<boolean> {
    return this.act({ t: 'cancel' });
  }
  answer(a: 'yes' | 'notnow' | 'never'): Promise<boolean> {
    return this.act({ t: 'answer', answer: a });
  }
  private meantNow(count: number): Meant {
    const d = this.drafts;
    const rewrite = d.rewrite.trim().slice(0, MAX_REWRITE);
    return { marks: this.clip(d.marks, count), ...(rewrite ? { rewrite } : {}), ...(d.sliders.length ? { sliders: d.sliders } : {}) };
  }
  async sendPhrase(): Promise<boolean> {
    const phrase = this.drafts.phrase.trim();
    const meant = this.meantNow(tokenize(phrase).length);
    const { lock, key } = await makeLock(meant);
    const before = this.locked;
    this.locked = { meant, key };
    try {
      const ok = await this.act({ t: 'sendPhrase', phrase, lock });
      if (!ok) this.locked = before;
      return ok;
    } catch (e) {
      this.locked = before;
      throw e;
    }
  }
  /** The hearer's marks that would go back if they chose to send: stories stay out unless the person ticked for them. */
  heardToSend(): Mark[] {
    const count = tokenize(this.state.round?.phrase ?? '').length;
    const all = this.clip(this.drafts.heardMarks, count);
    return this.drafts.includeStories ? all : all.filter((m) => m[2] !== 'story');
  }
  sendHeard(mode: 'send' | 'keep' | 'skip'): Promise<boolean> {
    const count = tokenize(this.state.round?.phrase ?? '').length;
    const own = mode === 'skip' ? [] : this.clip(this.drafts.heardMarks, count);
    const note = this.drafts.note.trim().slice(0, MAX_NOTE);
    return this.act({ t: 'sendHeard', mode, ownMarks: own, ...(mode === 'send' ? { sendMarks: this.heardToSend(), ...(note ? { note } : {}) } : {}) });
  }
  /** The texts the next send would carry, for the private check. */
  pendingTexts(kind: 'phrase' | 'heard' | 'meant'): string[] {
    const d = this.drafts;
    return kind === 'phrase' ? [d.phrase] : kind === 'heard' ? [d.note] : [d.rewrite];
  }
  reveal(): Promise<boolean> {
    // What goes is exactly what was locked when the phrase went; the key goes with it, so the other device can check.
    const l = this.locked;
    const meant: Meant = l ? { ...l.meant, lockKey: l.key } : this.meantNow(tokenize(this.state.round?.phrase ?? this.drafts.phrase).length);
    return this.act({ t: 'reveal', meant });
  }
  done(): Promise<boolean> {
    return this.act({ t: 'done' });
  }
  stop(): Promise<boolean> {
    return this.act({ t: 'stop' });
  }
  /** A word's mark, toggled: the same kind clears it; another kind replaces it. */
  mark(who: 'speaker' | 'hearer', index: number, kind: MarkKind): void {
    const m = who === 'speaker' ? this.drafts.marks : this.drafts.heardMarks;
    if (m.get(index) === kind) m.delete(index);
    else m.set(index, kind);
    this.changed();
  }
  /** What the next screen needs to know about one's own marks. */
  marksOf(who: 'speaker' | 'hearer'): Mark[] {
    return marksFromMap(who === 'speaker' ? this.drafts.marks : this.drafts.heardMarks);
  }
}
