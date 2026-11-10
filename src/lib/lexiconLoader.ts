// Reading the private list (a CSV) into rows the matcher can use, with the safeguards decided on 2026-11-10. The list itself is never in this repository.
//
// Safeguards applied here, whatever the file says:
//  - Neutral identity words are never matchers. A row for one is dropped and reported (the words are listed below: they are ordinary words for people).
//  - A handful of words that are ordinary identity words AND have been used as insults (the handoff's "enumerated exceptions") are kept but switched OFF until the
//    owner gives them cue words: with no cues a context key never matches. This is so a person describing themselves ("I'm gay", "I'm deaf") is never flagged.
//  - Any row that its own note calls an ordinary word is a context row; with no cues it never matches either.
//  - The ordinary words the list also holds (animals, objects, "it") are context keys only, never above severity 1, and off without cues.
//  - Terms under three characters are dropped.
import { compile, type LexRow, type Matcher, type MatchMode } from './lexicon.ts';

/** Ordinary, respectful words for groups of people. They must never be matchers. */
export const NEUTRAL_IDENTITY = new Set(
  'italian irish polish chinese indian nigerian pakistani turkish greek french german spanish portuguese jewish muslim catholic protestant sikh hindu buddhist orthodox disabled woman man non-binary lesbian bisexual intersex black white asian latino arab refugee immigrant expat working class middle class carer pensioner nazi woke liberal conservative british english scottish welsh american caucasian celt anglo nordic slav aryan'.split(' ').concat(['wheelchair user', 'working class', 'middle class']),
);
/** Words that are both ordinary identity words and have been used as insults: kept, but only ever matching with cues the owner supplies. */
export const ENUMERATED_EXCEPTIONS = new Set(
  'gay autistic deaf blind dumb queer trans gypsy oriental eskimo negro handicapped migrant colonizer globalist boomer millennial'.split(' '),
);
/** Ordinary words that the list also holds because they are sometimes used as insults (the handoff's Group B, and "it"). Each is only ever a context key: it matches
 *  only near a cue word the owner gives it, and its severity is never above 1. Without cues it is off. */
export const ORDINARY_WORDS = new Set(
  'monkey ape baboon chimp pig cow cat dog rat snake worm sheep bear bull dragon shark vulture crab spider fly ant queen fairy pansy nancy molly otter daddy top bottom common simple slow dense thick mad mental sad flat broken tool suit cog brick plank log stone rock tent skip tip dump rank drip sap melt wet blue orange green cabbage turnip potato lemon shrimp box lump sponge fungus mould nanny crutch mirror space it'.split(' '),
);
const ORDINARY = /ordinary word|also an? (?:ordinary|normal|common|everyday)|neutral word|also the neutral|false match|everyday word|doing insult duty/i;

export interface LoadReport {
  total: number;
  kept: number;
  droppedNeutral: string[];
  droppedShort: number;
  switchedOff: string[];
  contextWithoutCues: number;
  merged: number;
  problems: string[];
}

const MODES: MatchMode[] = ['token', 'phrase', 'token_context', 'compound', 'suffix'];

/** A CSV where every field may be quoted; a field may contain commas and doubled quotes. Returns the rows as arrays. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let f = '';
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { f += '"'; i++; }
      else if (c === '"') q = false;
      else f += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(f); f = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(f); f = '';
      if (row.some((x) => x.trim() !== '')) rows.push(row);
      row = [];
    } else f += c;
  }
  row.push(f);
  if (row.some((x) => x.trim() !== '')) rows.push(row);
  return rows;
}

/** The list as rows plus a report of everything that was changed or left out. */
export function readLexicon(csv: string): { rows: LexRow[]; report: LoadReport } {
  const table = parseCsv(csv.replace(/^﻿/, ''));
  const report: LoadReport = { total: 0, kept: 0, droppedNeutral: [], droppedShort: 0, switchedOff: [], contextWithoutCues: 0, merged: 0, problems: [] };
  if (!table.length) return { rows: [], report: { ...report, problems: ['empty file'] } };
  const header = table[0].map((h) => h.trim().toLowerCase());
  const col = (...names: string[]): number => header.findIndex((h) => names.includes(h));
  const idx = { term: col('term'), variants: col('variants'), category: col('category'), target: col('target'), severity: col('severity'), note: col('context_note', 'context'), mode: col('match_mode'), cues: col('cues'), language: col('language'), source: col('source'), confidence: col('confidence') };
  if (idx.term < 0 || idx.category < 0 || idx.target < 0 || idx.severity < 0) return { rows: [], report: { ...report, problems: ['missing columns: term, category, target and severity are required'] } };
  const get = (r: string[], i: number): string => (i >= 0 ? (r[i] ?? '').trim() : '');
  const byKey = new Map<string, LexRow>();
  for (const r of table.slice(1)) {
    report.total++;
    const term = get(r, idx.term).toLowerCase();
    if (term.replace(/^-+/, '').length < 3) { report.droppedShort++; continue; }
    if (NEUTRAL_IDENTITY.has(term)) { report.droppedNeutral.push(term); continue; }
    const sev = Number(get(r, idx.severity));
    if (![1, 2, 3].includes(sev)) { report.problems.push(`severity not 1, 2 or 3 on a row (${term.length} letters)`); continue; }
    const note = get(r, idx.note);
    const given = get(r, idx.mode) as MatchMode;
    let mode: MatchMode = MODES.includes(given) ? given : term.startsWith('-') ? 'suffix' : /\s/.test(term) ? 'phrase' : 'token';
    const cues = get(r, idx.cues).split('|').map((x) => x.trim()).filter(Boolean);
    let severity = sev as 1 | 2 | 3;
    if (ORDINARY_WORDS.has(term)) {
      mode = 'token_context';
      severity = 1;
    } else if (ENUMERATED_EXCEPTIONS.has(term)) {
      mode = 'token_context';
      severity = 1;
      if (!cues.length) report.switchedOff.push(term);
    } else if (ORDINARY.test(note) && mode === 'token') mode = 'token_context';
    if (mode === 'token_context' && !cues.length) report.contextWithoutCues++;
    const row: LexRow = {
      term, variants: get(r, idx.variants).split('|').map((x) => x.trim().toLowerCase()).filter(Boolean), category: get(r, idx.category), target: get(r, idx.target), severity,
      matchMode: mode, contextNote: note, cues, language: get(r, idx.language) || 'en', source: get(r, idx.source), confidence: get(r, idx.confidence),
    };
    // Exact duplicates (same term and target) are merged: variants combined, the lower severity kept, sources joined with ";".
    const k = `${term}|${row.target}`;
    const had = byKey.get(k);
    if (had) {
      report.merged++;
      had.variants = [...new Set([...had.variants, ...row.variants])];
      had.severity = Math.min(had.severity, row.severity) as 1 | 2 | 3;
      if (row.source && !had.source.includes(row.source)) had.source = `${had.source}; ${row.source}`;
      had.cues = [...new Set([...had.cues, ...row.cues])];
    } else byKey.set(k, row);
  }
  const rows = [...byKey.values()];
  report.kept = rows.length;
  return { rows, report };
}

/** A matcher from the CSV text, and the report. */
export function loadLexicon(csv: string): { matcher: Matcher; report: LoadReport } {
  const { rows, report } = readLexicon(csv);
  return { matcher: compile(rows), report };
}
