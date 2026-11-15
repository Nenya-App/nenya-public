// Turning a HurtLex row into a row of our list (docs/lexicon-sources.md). Only the categories that are about people are kept; the rest are left out and counted. HurtLex has no severity, so
// the numbers here are a first guess for a counselor and an advocate to correct: 2 for slurs aimed at a kind of person, 1 for everything else (a coarse insult or an animal word, which
// the loader switches off without a cue word anyway). Nothing here contains a word from the list.
export interface HurtlexRow {
  id: string;
  pos: string;
  category: string;
  stereotype: string;
  lemma: string;
  level: string;
}
export interface BatchRow {
  term: string;
  category: 'slur' | 'dehumanizing-metaphor' | 'harassing-insult';
  target: string;
  severity: 1 | 2;
  note: string;
  source: string;
  confidence: string;
}

const MAP: Record<string, { category: BatchRow['category']; target: string; severity: 1 | 2 }> = {
  ps: { category: 'slur', target: 'race-ethnicity', severity: 2 },
  om: { category: 'slur', target: 'sexual-orientation', severity: 2 },
  ddp: { category: 'slur', target: 'disability', severity: 2 },
  ddf: { category: 'slur', target: 'disability', severity: 2 },
  an: { category: 'dehumanizing-metaphor', target: 'group', severity: 1 },
  cds: { category: 'harassing-insult', target: 'individual', severity: 1 },
  asf: { category: 'harassing-insult', target: 'gender', severity: 1 },
  asm: { category: 'harassing-insult', target: 'gender', severity: 1 },
  pr: { category: 'harassing-insult', target: 'gender', severity: 1 },
};
export const KEPT_CATEGORIES = Object.keys(MAP);

/** The conservative level only. Returns null (with the reason) for a row we do not take. */
export function mapRow(r: HurtlexRow): { row: BatchRow } | { skipped: 'level' | 'category' | 'short' } {
  if (r.level !== 'conservative') return { skipped: 'level' };
  const m = MAP[r.category];
  if (!m) return { skipped: 'category' };
  const term = r.lemma.trim().toLowerCase();
  if (term.length < 3) return { skipped: 'short' };
  return { row: { term, ...m, note: `HurtLex category ${r.category}${r.stereotype === 'yes' ? ', stereotype' : ''}; not yet reviewed`, source: `hurtlex-en-1.2 (CC BY-NC-SA 4.0), ${r.category}, conservative`, confidence: 'unreviewed' } };
}

export function parseTsv(text: string): HurtlexRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const head = lines[0].split('\t');
  const need = ['id', 'pos', 'category', 'stereotype', 'lemma', 'level'];
  if (need.some((n) => !head.includes(n))) throw new Error('This does not look like a HurtLex file (id, pos, category, stereotype, lemma, level).');
  return lines.slice(1).map((l) => { const c = l.split('\t'); return Object.fromEntries(need.map((n) => [n, c[head.indexOf(n)] ?? ''])) as unknown as HurtlexRow; });
}

const q = (s: string): string => `"${s.replace(/"/g, '""')}"`;
export const BATCH_COLUMNS = ['term', 'variants', 'category', 'target', 'severity', 'context_note', 'match_mode', 'cues', 'language', 'source', 'confidence'];
export const toCsvLine = (b: BatchRow): string => [b.term, '', b.category, b.target, String(b.severity), b.note, '', '', 'en', b.source, b.confidence].map(q).join(',');
