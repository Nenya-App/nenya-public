// The rules of one rephrasing round, as a pure state machine (docs/dyad-rephrase-scope.md, section 3). One round is open at a
// time. Each device holds its own view of it; the two views move together by messages (src/lib/rephraseProtocol.ts). Anything
// that is not allowed in the current phase is ignored without a word and without a reply: a modified page cannot push the
// other person's page out of order, and nothing here ever tells one person whether the other opened or marked anything.
//
// "Blind then reveal": the hearer never holds the speaker's marks until the speaker reveals them; the speaker holds the hearer's
// marks (if sent) without showing them until the speaker's own reveal. Pure: no network, no storage, no clock.
import type { Mark } from './rephraseKinds.ts';
import type { Answer, BodyOf, HeardMode, RephraseKind, Slider } from './rephraseProtocol.ts';
import { TOKENIZER } from './rephraseKinds.ts';

export type Side = 'speaker' | 'hearer';
export type SpeakerPhase = 'asked' | 'accepted' | 'phrase-sent' | 'answered' | 'revealed';
export type HearerPhase = 'deciding' | 'waiting-phrase' | 'hearing' | 'returned' | 'compared';

export interface Meant {
  marks: Mark[];
  rewrite?: string;
  sliders?: Slider[];
}
export interface Heard {
  mode: HeardMode;
  /** What was sent (mode 'send'). */
  marks?: Mark[];
  note?: string;
}
export interface Round {
  id: string;
  side: Side;
  phase: SpeakerPhase | HearerPhase;
  phrase?: string;
  /** Speaker: what the hearer sent back, held until the speaker reveals. Hearer: what they sent (or kept). */
  heard?: Heard;
  /** The hearer's own marks, all of them, kept on their device whether or not they were sent. */
  ownMarks?: Mark[];
  /** Speaker: what was revealed. Hearer: what arrived. */
  meant?: Meant;
}

/** Something the page may say in words, after a round ends without a comparison. Never a reason, never a count. */
export type Notice = 'partner-notnow' | 'partner-never' | 'said-notnow' | 'said-never' | 'partner-done' | 'done' | 'partner-stopped' | 'stopped' | 'cancelled';

export interface RoundState {
  round: Round | null;
  /** The other person said "Not in this cell": no more asks from here. */
  asksBlocked: boolean;
  /** I said "Not in this cell": asks that arrive are ignored. */
  ignoreAsks: boolean;
  notice: Notice | null;
  /** The other page is hidden and may come back (src/cell/CellPage.tsx). */
  partnerAway: boolean;
}
export const initialState = (): RoundState => ({ round: null, asksBlocked: false, ignoreAsks: false, notice: null, partnerAway: false });

export type Local =
  | { t: 'ask'; id: string }
  | { t: 'cancel' }
  | { t: 'answer'; answer: Answer }
  | { t: 'sendPhrase'; phrase: string }
  | { t: 'sendHeard'; mode: HeardMode; ownMarks: Mark[]; sendMarks?: Mark[]; note?: string }
  | { t: 'reveal'; meant: Meant }
  | { t: 'done' }
  | { t: 'stop' };
export type Incoming = { [K in RephraseKind]: { t: 'in'; kind: K; body: BodyOf[K] } }[RephraseKind];
export type Event = Local | Incoming;

export type Outgoing = { [K in RephraseKind]: { kind: K; body: BodyOf[K] } }[RephraseKind];
export interface Result {
  state: RoundState;
  send?: Outgoing;
  /** False when the event was not allowed now (nothing changed, nothing to send). */
  ok: boolean;
}

const keep = (s: RoundState): Result => ({ state: s, ok: false });
const done = (state: RoundState, send?: Outgoing): Result => ({ state, ...(send ? { send } : {}), ok: true });
const clear = (s: RoundState, notice: Notice): RoundState => ({ ...s, round: null, notice });
const mine = (s: RoundState, id: string | undefined, side: Side): Round | null => (s.round && s.round.side === side && s.round.id === id ? s.round : null);

export function step(s: RoundState, e: Event): Result {
  const r = s.round;
  if (e.t === 'in') {
    switch (e.kind) {
      case 'rp-ask': {
        if (r || s.ignoreAsks || e.body.tok !== TOKENIZER) return keep(s);
        return done({ ...s, notice: null, round: { id: e.body.round, side: 'hearer', phase: 'deciding' } });
      }
      case 'rp-answer': {
        const sp = mine(s, e.body.round, 'speaker');
        if (!sp || sp.phase !== 'asked') return keep(s);
        if (e.body.answer === 'yes') return done({ ...s, round: { ...sp, phase: 'accepted' } });
        if (e.body.answer === 'notnow') return done(clear(s, 'partner-notnow'));
        return done({ ...clear(s, 'partner-never'), asksBlocked: true });
      }
      case 'rp-phrase': {
        const h = mine(s, e.body.round, 'hearer');
        if (!h || h.phase !== 'waiting-phrase') return keep(s);
        return done({ ...s, round: { ...h, phase: 'hearing', phrase: e.body.phrase } });
      }
      case 'rp-heard': {
        const sp = mine(s, e.body.round, 'speaker');
        if (!sp || sp.phase !== 'phrase-sent') return keep(s);
        const b = e.body;
        const heard: Heard = b.mode === 'send' ? { mode: 'send', marks: b.marks ?? [], ...(b.note ? { note: b.note } : {}) } : { mode: b.mode };
        return done({ ...s, round: { ...sp, phase: 'answered', heard } });
      }
      case 'rp-meant': {
        const h = mine(s, e.body.round, 'hearer');
        if (!h || h.phase !== 'returned') return keep(s);
        const b = e.body;
        const meant: Meant = { marks: b.marks, ...(b.rewrite ? { rewrite: b.rewrite } : {}), ...(b.sliders ? { sliders: b.sliders } : {}) };
        return done({ ...s, round: { ...h, phase: 'compared', meant } });
      }
      case 'rp-control': {
        const c = e.body;
        if (c.step === 'away') return done({ ...s, partnerAway: true });
        if (c.step === 'back') return done({ ...s, partnerAway: false });
        if (c.step === 'stop') return done({ ...clear(s, 'partner-stopped'), partnerAway: false });
        // "done": only for the round that is open (a stale one is ignored).
        if (!r || (c.round && c.round !== r.id)) return keep(s);
        return done(clear(s, 'partner-done'));
      }
    }
  }
  switch (e.t) {
    case 'ask':
      if (r || s.asksBlocked || !/^[0-9a-f]{8}$/.test(e.id)) return keep(s);
      return done({ ...s, notice: null, round: { id: e.id, side: 'speaker', phase: 'asked' } }, { kind: 'rp-ask', body: { round: e.id, tok: TOKENIZER } });
    case 'cancel':
      if (!r || r.side !== 'speaker' || r.phase !== 'asked') return keep(s);
      return done(clear(s, 'cancelled'), { kind: 'rp-control', body: { round: r.id, step: 'done' } });
    case 'answer': {
      if (!r || r.side !== 'hearer' || r.phase !== 'deciding') return keep(s);
      const send: Outgoing = { kind: 'rp-answer', body: { round: r.id, answer: e.answer } };
      if (e.answer === 'yes') return done({ ...s, round: { ...r, phase: 'waiting-phrase' } }, send);
      if (e.answer === 'notnow') return done(clear(s, 'said-notnow'), send);
      return done({ ...clear(s, 'said-never'), ignoreAsks: true }, send);
    }
    case 'sendPhrase':
      if (!r || r.side !== 'speaker' || r.phase !== 'accepted' || !e.phrase.trim()) return keep(s);
      return done({ ...s, round: { ...r, phase: 'phrase-sent', phrase: e.phrase } }, { kind: 'rp-phrase', body: { round: r.id, tok: TOKENIZER, phrase: e.phrase } });
    case 'sendHeard': {
      if (!r || r.side !== 'hearer' || r.phase !== 'hearing') return keep(s);
      if (e.mode === 'send') {
        const marks = e.sendMarks ?? e.ownMarks;
        return done(
          { ...s, round: { ...r, phase: 'returned', ownMarks: e.ownMarks, heard: { mode: 'send', marks, ...(e.note ? { note: e.note } : {}) } } },
          { kind: 'rp-heard', body: { round: r.id, mode: 'send', marks, ...(e.note ? { note: e.note } : {}) } },
        );
      }
      return done({ ...s, round: { ...r, phase: 'returned', ownMarks: e.mode === 'keep' ? e.ownMarks : [], heard: { mode: e.mode } } }, { kind: 'rp-heard', body: { round: r.id, mode: e.mode } });
    }
    case 'reveal':
      if (!r || r.side !== 'speaker' || r.phase !== 'answered') return keep(s);
      return done({ ...s, round: { ...r, phase: 'revealed', meant: e.meant } }, { kind: 'rp-meant', body: { round: r.id, ...e.meant } });
    case 'done':
      if (!r) return keep(s);
      return done(clear(s, 'done'), { kind: 'rp-control', body: { round: r.id, step: 'done' } });
    case 'stop':
      return done({ ...clear(s, 'stopped'), partnerAway: false }, { kind: 'rp-control', body: { step: 'stop' } });
  }
  return keep(s);
}

/** What the speaker's screen may show of the hearer's reading: nothing until the speaker has revealed their own. */
export function heardVisible(s: RoundState): Heard | null {
  const r = s.round;
  return r && r.side === 'speaker' && r.phase === 'revealed' && r.heard?.mode === 'send' ? r.heard : null;
}
/** The two readings, when this device may show both. Null otherwise. */
export interface Readings {
  phrase: string;
  meant: Meant;
  /** The hearer's marks as this device holds them (the hearer's own, or the ones that were sent). */
  heard: Mark[] | null;
  note?: string;
}
export function readings(s: RoundState): Readings | null {
  const r = s.round;
  if (!r || !r.phrase) return null;
  if (r.side === 'speaker' && r.phase === 'revealed' && r.meant) {
    const h = heardVisible(s);
    return { phrase: r.phrase, meant: r.meant, heard: h?.marks ?? null, ...(h?.note ? { note: h.note } : {}) };
  }
  if (r.side === 'hearer' && r.phase === 'compared' && r.meant) {
    const own = r.heard?.mode === 'send' ? r.ownMarks ?? r.heard.marks ?? [] : r.heard?.mode === 'keep' ? r.ownMarks ?? [] : null;
    return { phrase: r.phrase, meant: r.meant, heard: own, ...(r.heard?.note ? { note: r.heard.note } : {}) };
  }
  return null;
}
