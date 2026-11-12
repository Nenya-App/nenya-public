// The reviewers' decisions about terms in the private list, applied after the list is read. The list's rows come from outside sources and are left as they are, with their
// provenance; a decisions file (private, in the research folder or the private store, never in the repository) says what to do with a TERM, across every row that has it:
//   drop      the word is ordinary and no cue could rescue it: remove it
//   slur      a slur aimed at an identity: ONE row, severity 2, flagged on its own
//   model     a slur that is also reclaimed, a homonym or often denounced: kept, but marked "needs-model": the list alone never flags it (offerFor skips it); a model reads the context
//   judgment  a blame or judgment word (stupid, trash, an insult): ONE row at severity 1, only when a word for a person is near. It is for a gentle reply (a card or a question
//             about the need beneath it), never a boundary, and it is not a "slur" however HurtLex filed it
// File format: CSV with a header, columns term, action, note. Terms the file does not mention are untouched.
import type { LexRow } from './lexicon.ts';
import { parseCsv } from './lexiconLoader.ts';

export type Action = 'drop' | 'slur' | 'model' | 'judgment';
const ACTIONS: Action[] = ['drop', 'slur', 'model', 'judgment'];

/** Words for a person, one of which must be near a judgment word for it to count: it has to be aimed at someone ("you are stupid"), not at a thing ("this is trash"). */
export const PERSON_CUES = ['you', "you're", 'youre', 'your', 'u', 'ur', 'he', "he's", 'hes', 'she', "she's", 'shes', 'they', "they're", 'theyre', 'him', 'her', 'them', 'his', 'their', 'my', 'our', 'we', 'i', "i'm", 'im', 'me', 'us', 'people', 'person', 'guy', 'man', 'woman', 'boss', 'friend', 'mom', 'dad', 'husband', 'wife', 'partner'];

export function parseDecisions(csv: string): { decisions: Map<string, Action>; problems: string[] } {
  const table = parseCsv(csv.replace(/^﻿/, ''));
  const problems: string[] = [];
  const decisions = new Map<string, Action>();
  if (!table.length) return { decisions, problems: ['empty file'] };
  const h = table[0].map((x) => x.trim().toLowerCase());
  const ti = h.indexOf('term'), ai = h.indexOf('action');
  if (ti < 0 || ai < 0) return { decisions, problems: ['needs columns term and action'] };
  table.slice(1).forEach((r, n) => {
    const term = (r[ti] ?? '').trim().toLowerCase(), action = (r[ai] ?? '').trim().toLowerCase() as Action;
    if (!term) return;
    if (!ACTIONS.includes(action)) { problems.push(`row ${n + 2}: unknown action`); return; }
    if (decisions.has(term) && decisions.get(term) !== action) problems.push(`row ${n + 2}: the term has two different actions`);
    decisions.set(term, action);
  });
  return { decisions, problems };
}

export interface DecisionCounts { dropped: number; slur: number; model: number; judgment: number; collapsed: number }

export function applyDecisions(rows: LexRow[], decisions: Map<string, Action>): { rows: LexRow[]; counts: DecisionCounts } {
  const counts: DecisionCounts = { dropped: 0, slur: 0, model: 0, judgment: 0, collapsed: 0 };
  const out: LexRow[] = [];
  const done = new Set<string>();
  for (const r of rows) {
    const a = decisions.get(r.term);
    if (!a) { out.push(r); continue; }
    if (a === 'drop') { counts.dropped++; continue; }
    if (done.has(r.term)) { counts.collapsed++; continue; } // one row stands for the term
    done.add(r.term);
    const same = rows.filter((x) => x.term === r.term);
    const base = same.find((x) => x.category === 'slur') ?? r;
    const source = [...new Set(same.map((x) => x.source).filter(Boolean))].join('; ');
    const variants = [...new Set(same.flatMap((x) => x.variants))];
    if (a === 'slur' || a === 'model') {
      counts[a]++;
      out.push({ ...base, category: 'slur', severity: 2, matchMode: 'token', cues: [], variants, source, contextNote: a === 'model' ? `${base.contextNote} needs-model`.trim() : base.contextNote });
    } else {
      counts.judgment++;
      out.push({ ...r, category: 'judgment', target: 'individual', severity: 1, matchMode: 'token_context', cues: PERSON_CUES, variants, source, contextNote: 'judgment' });
    }
  }
  return { rows: out, counts };
}
