// Reading a downloaded prompt set, choosing a fair sample, and summarizing what the coach did, for scripts/eval-prompts.mts. No data is stored here, and the
// summary that is meant to be published holds counts and prompt ids only (never the prompts or the replies) unless the owner asks for a few quotes.
import { TEST_SETS } from './testSets.ts';

export interface Prompt {
  id: string;
  /** A group the set itself gives the prompt (for example XSTest's "type"), or ''. */
  group: string;
  text: string;
}

/** Splits CSV text into rows, handling quoted fields with commas, doubled quotes and line breaks. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = '';
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cur); cur = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cur); cur = ''; if (row.some((x) => x !== '')) rows.push(row); row = []; }
    else cur += c;
  }
  row.push(cur);
  if (row.some((x) => x !== '')) rows.push(row);
  return rows;
}

const jsonLines = (text: string): any[] => text.split(/\r?\n/).filter((l) => l.trim()).map((l) => JSON.parse(l));

/** The first message of each conversation, from the format the set ships in. Throws if the file is not in the format expected for that set. */
export function readPrompts(setId: string, text: string): Prompt[] {
  if (!TEST_SETS[setId]) throw new Error(`Unknown set "${setId}" (known: ${Object.keys(TEST_SETS).join(', ')}).`);
  if (setId === 'xstest') {
    const rows = parseCsv(text);
    const head = rows[0].map((h) => h.trim().toLowerCase());
    const ip = head.indexOf('prompt'), ii = head.indexOf('id'), it = head.indexOf('type'), il = head.indexOf('label');
    if (ip < 0) throw new Error('This does not look like XSTest: no "prompt" column.');
    return rows.slice(1).filter((r) => (r[ip] ?? '').trim()).map((r, n) => ({ id: `xstest-${(ii >= 0 ? r[ii] : '') || n + 1}`, group: [it >= 0 ? r[it] : '', il >= 0 ? r[il] : ''].filter(Boolean).join(' / '), text: r[ip].trim() }));
  }
  if (setId === 'oasst2') {
    // The flat message export: one JSON object per line; the first message of a conversation is a "prompter" message with no parent. English only.
    const rows = jsonLines(text);
    if (!rows.length || !('message_id' in rows[0]) || !('text' in rows[0])) throw new Error('This does not look like the OASST2 message export (message_id and text per line).');
    return rows.filter((r) => r.role === 'prompter' && !r.parent_id && (r.lang ?? 'en') === 'en' && String(r.text).trim()).map((r) => ({ id: `oasst2-${String(r.message_id).slice(0, 8)}`, group: '', text: String(r.text).trim() }));
  }
  if (setId === 'dolly') {
    const rows = jsonLines(text);
    if (!rows.length || !('instruction' in rows[0])) throw new Error('This does not look like Dolly (an "instruction" per line).');
    return rows.filter((r) => String(r.instruction).trim()).map((r, n) => ({ id: `dolly-${n + 1}`, group: String(r.category ?? ''), text: String(r.instruction).trim() }));
  }
  if (setId === 'esconv') {
    const data = JSON.parse(text);
    if (!Array.isArray(data)) throw new Error('This does not look like ESConv (a JSON list of conversations).');
    return data.flatMap((d: any, n: number) => {
      const first = (d.dialog ?? []).find((t: any) => t.speaker === 'usr');
      return first?.content ? [{ id: `esconv-${n + 1}`, group: String(d.emotion_type ?? ''), text: String(first.content).trim() }] : [];
    });
  }
  throw new Error(`No reader for "${setId}".`);
}

/** A repeatable sample: the same seed and size always give the same prompts. */
export function sample<T>(items: T[], n: number, seed: number): T[] {
  let a = seed >>> 0;
  const rnd = () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; }
  return n >= copy.length ? copy : copy.slice(0, n);
}

/** What the coach did with one prompt (never the prompt or the reply text). */
export interface Outcome {
  id: string;
  group: string;
  status: number;
  flag: string;
  blocked: boolean;
  card: string;
  offer: string;
  replyWords: number;
  checks: string[];
}

export interface Summary {
  n: number;
  refused: number;
  flagged: Record<string, number>;
  blocked: number;
  card: number;
  offer: number;
  withChecks: number;
  meanReplyWords: number;
  byGroup: Record<string, { n: number; flagged: number; blocked: number; card: number }>;
  /** A 95% Wilson interval for the share of prompts flagged, so a small sample is not over-read. */
  flaggedShare: { low: number; high: number };
}

/** Wilson score interval for k of n. */
export function wilson(k: number, n: number): { low: number; high: number } {
  if (!n) return { low: 0, high: 0 };
  const z = 1.96, p = k / n, d = 1 + (z * z) / n;
  const c = p + (z * z) / (2 * n), m = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
  return { low: Math.max(0, (c - m) / d), high: Math.min(1, (c + m) / d) };
}

export function summarize(outcomes: Outcome[]): Summary {
  const ok = outcomes.filter((o) => o.status === 200);
  const flagged: Record<string, number> = {};
  const byGroup: Summary['byGroup'] = {};
  for (const o of ok) {
    if (o.flag) flagged[o.flag] = (flagged[o.flag] ?? 0) + 1;
    const g = (byGroup[o.group || 'all'] ??= { n: 0, flagged: 0, blocked: 0, card: 0 });
    g.n++; if (o.flag) g.flagged++; if (o.blocked) g.blocked++; if (o.card) g.card++;
  }
  const flaggedCount = ok.filter((o) => o.flag).length;
  return {
    n: ok.length, refused: outcomes.length - ok.length, flagged,
    blocked: ok.filter((o) => o.blocked).length, card: ok.filter((o) => o.card).length, offer: ok.filter((o) => o.offer).length,
    withChecks: ok.filter((o) => o.checks.length).length,
    meanReplyWords: ok.length ? Math.round(ok.reduce((s, o) => s + o.replyWords, 0) / ok.length) : 0,
    byGroup, flaggedShare: wilson(flaggedCount, ok.length),
  };
}
