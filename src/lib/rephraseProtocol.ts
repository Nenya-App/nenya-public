// What travels in a rephrasing round (docs/dyad-rephrase-scope.md, sections 5 and 6): six message kinds, each with a small JSON
// body in the cell message's `text`. Everything is sealed by src/lib/cellCrypto.ts before it leaves the device; the mailbox sees
// none of it (not even the kind). Pure: no network, no storage.
//
// Limits are chosen so a whole message fits the report route's 4000 characters (netlify/functions/cell.mts), because a message
// the reader cannot report is a message with no way out. Unknown versions, kinds, fields and over-long values are refused.
import { isMarkKind, tokenize, TOKENIZER, type Mark } from './rephraseKinds.ts';

export const RP_VERSION = 1;
export const RP_KINDS = ['rp-ask', 'rp-answer', 'rp-phrase', 'rp-heard', 'rp-meant', 'rp-control'] as const;
export type RephraseKind = (typeof RP_KINDS)[number];
export const isRpKind = (k: unknown): k is RephraseKind => typeof k === 'string' && (RP_KINDS as readonly string[]).includes(k);

export const MAX_PHRASE = 1000;
export const MAX_REWRITE = 1000;
export const MAX_NOTE = 300;
export const MAX_WORDS = 200;
export const MAX_SLIDERS = 12;
/** The report route's text limit. */
export const MAX_TOTAL = 4000;

export interface Slider {
  /** The need's word (the speaker's own list). */
  need: string;
  /** 0 met … 4 not met. */
  level: 0 | 1 | 2 | 3 | 4;
}
export type Answer = 'yes' | 'notnow' | 'never';
export type HeardMode = 'send' | 'keep' | 'skip';
export type ControlStep = 'done' | 'stop' | 'away' | 'back';

export interface AskBody { round: string; tok: string }
export interface AnswerBody { round: string; answer: Answer }
export interface PhraseBody { round: string; tok: string; phrase: string }
export interface HeardBody { round: string; mode: HeardMode; marks?: Mark[]; note?: string }
export interface MeantBody { round: string; marks: Mark[]; rewrite?: string; sliders?: Slider[] }
export interface ControlBody { round?: string; step: ControlStep }
export interface BodyOf {
  'rp-ask': AskBody;
  'rp-answer': AnswerBody;
  'rp-phrase': PhraseBody;
  'rp-heard': HeardBody;
  'rp-meant': MeantBody;
  'rp-control': ControlBody;
}

const ROUND = /^[0-9a-f]{8}$/;
export const newRoundId = (): string => Array.from(globalThis.crypto.getRandomValues(new Uint8Array(4)), (x) => x.toString(16).padStart(2, '0')).join('');

const isStr = (x: unknown, max: number): x is string => typeof x === 'string' && x.length <= max;
const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);

function marksOk(x: unknown): x is Mark[] {
  if (!Array.isArray(x) || x.length > MAX_WORDS) return false;
  return x.every((m) => Array.isArray(m) && m.length === 3 && Number.isInteger(m[0]) && Number.isInteger(m[1]) && m[0] >= 0 && m[1] >= m[0] && m[1] < MAX_WORDS && isMarkKind(m[2]));
}
function slidersOk(x: unknown): x is Slider[] {
  return Array.isArray(x) && x.length <= MAX_SLIDERS && x.every((s) => isObj(s) && isStr(s.need, 40) && s.need.length > 0 && Number.isInteger(s.level) && (s.level as number) >= 0 && (s.level as number) <= 4);
}

/** Checks a decoded body against its kind. Returns it (without any field it does not know) or null. */
function clean(kind: RephraseKind, o: Record<string, unknown>): BodyOf[RephraseKind] | null {
  if (o.v !== RP_VERSION) return null;
  const round = o.round;
  if (kind !== 'rp-control' && !(typeof round === 'string' && ROUND.test(round))) return null;
  switch (kind) {
    case 'rp-ask':
      return o.tok === TOKENIZER ? { round: round as string, tok: TOKENIZER } : null;
    case 'rp-answer':
      return o.answer === 'yes' || o.answer === 'notnow' || o.answer === 'never' ? { round: round as string, answer: o.answer } : null;
    case 'rp-phrase': {
      if (o.tok !== TOKENIZER || !isStr(o.phrase, MAX_PHRASE) || !o.phrase.trim()) return null;
      if (tokenize(o.phrase).length > MAX_WORDS) return null;
      return { round: round as string, tok: TOKENIZER, phrase: o.phrase };
    }
    case 'rp-heard': {
      if (o.mode !== 'send' && o.mode !== 'keep' && o.mode !== 'skip') return null;
      if (o.mode === 'send') {
        if (!marksOk(o.marks) || (o.note !== undefined && !isStr(o.note, MAX_NOTE))) return null;
        return { round: round as string, mode: 'send', marks: o.marks, ...(o.note ? { note: o.note as string } : {}) };
      }
      // "Keep" and "skip" carry nothing else: a field that should not be there is a reason to refuse.
      if (o.marks !== undefined || o.note !== undefined) return null;
      return { round: round as string, mode: o.mode };
    }
    case 'rp-meant': {
      if (!marksOk(o.marks)) return null;
      if (o.rewrite !== undefined && !isStr(o.rewrite, MAX_REWRITE)) return null;
      if (o.sliders !== undefined && !slidersOk(o.sliders)) return null;
      return { round: round as string, marks: o.marks, ...(o.rewrite ? { rewrite: o.rewrite as string } : {}), ...(o.sliders ? { sliders: o.sliders as Slider[] } : {}) };
    }
    case 'rp-control':
      if (o.step !== 'done' && o.step !== 'stop' && o.step !== 'away' && o.step !== 'back') return null;
      if (o.round !== undefined && !(typeof o.round === 'string' && ROUND.test(o.round))) return null;
      return { ...(o.round ? { round: o.round as string } : {}), step: o.step };
  }
}

/** The sizes a message is padded up to before it is sealed, so its length (which the mailbox can see) says less about the words. */
export const PAD_SIZES = [512, 1024, 2048, MAX_TOTAL] as const;
const PAD_FIELD = ',"pad":""'.length;
/** Adds a filler field (ignored on reading) to reach the next size; a message that would not fit the next size is left as it is. */
export function pad(json: string): string {
  const need = json.length + PAD_FIELD;
  const size = PAD_SIZES.find((n) => n >= need);
  if (!size) return json;
  return json.slice(0, -1) + ',"pad":"' + 'x'.repeat(size - need) + '"}';
}

/** The text to put in a cell message. Throws if it is not valid or would not fit the report limit. */
export function encode<K extends RephraseKind>(kind: K, body: BodyOf[K]): string {
  const plain = JSON.stringify({ v: RP_VERSION, ...body });
  const back = clean(kind, JSON.parse(plain));
  if (!back) throw new Error('rephrase: not a valid message');
  if (plain.length > MAX_TOTAL) throw new Error('rephrase: too long to report');
  return pad(plain);
}

/** What a received message holds, or null for anything that is not exactly a message of its kind. */
export function decode<K extends RephraseKind>(kind: K, text: string): BodyOf[K] | null {
  if (typeof text !== 'string' || text.length > MAX_TOTAL) return null;
  try {
    const o = JSON.parse(text);
    return isObj(o) ? (clean(kind, o) as BodyOf[K] | null) : null;
  } catch {
    return null;
  }
}

/** Every piece of free text in a message, for the safety checks (sender's and reader's). */
export function textsOf(kind: string, text: string): string[] {
  if (!isRpKind(kind)) return [text];
  try {
    const o = JSON.parse(text) as Record<string, unknown>;
    return [o.phrase, o.rewrite, o.note].filter((x): x is string => typeof x === 'string' && x.length > 0);
  } catch {
    return [];
  }
}
