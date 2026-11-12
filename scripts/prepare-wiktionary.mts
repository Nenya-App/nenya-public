// Turns the pulled Wiktionary slur categories into candidate rows in the list's format (unreviewed), for review like the HurtLex rows. Single words only for now (phrases need a person to read them).
// Writes datasets/wiktionary/prepared/wiktionary-slurs.batch.csv and a merged trial list (current list + candidates) for the evaluation runner: nothing here changes the live list.
//   node scripts/prepare-wiktionary.mts
// COUNTS ONLY on screen. Files stay in the research folder.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { researchPaths } from '../src/lib/researchDir.ts';
import { parseCsv, readLexicon } from '../src/lib/lexiconLoader.ts';

const P = researchPaths();
const dir = join(P.datasets, 'wiktionary');
const members = parseCsv(readFileSync(join(dir, 'members.csv'), 'utf8')).slice(1).map((r) => ({ term: r[0], cats: r[1].split('|') }));
const listFile = join(P.datasets, 'hurtlex', 'list', 'slurs.en.csv');
const current = readLexicon(readFileSync(listFile, 'utf8')).rows;
const have = new Set(current.map((r) => r.term));
const MAP: [RegExp, { category: string; target: string; severity: 1 | 2; label: string }][] = [
  [/ethnic slurs/, { category: 'slur', target: 'race-ethnicity', severity: 2, label: 'ethnic slurs' }],
  [/religious slurs/, { category: 'slur', target: 'religion', severity: 2, label: 'religious slurs' }],
  [/anti-LGBTQ slurs/, { category: 'slur', target: 'sexual-orientation', severity: 2, label: 'anti-LGBTQ slurs' }],
  [/dysphemisms/, { category: 'harassing-insult', target: 'individual', severity: 1, label: 'dysphemisms' }],
];
const q = (s: string): string => '"' + s.replace(/"/g, '""') + '"';
const header = ['term', 'variants', 'category', 'target', 'severity', 'context_note', 'match_mode', 'cues', 'language', 'source', 'confidence'];
const out = [header.map(q).join(',')];
const counts: Record<string, number> = {};
for (const m of members) {
  const t = m.term;
  if (/\s/.test(t) || t.length < 3 || /[^a-z0-9'’\-]/.test(t) || have.has(t)) continue; // single, plain, ASCII words not already listed
  const hit = MAP.find(([re]) => m.cats.some((c) => re.test(c)));
  if (!hit) continue;
  const v = hit[1];
  counts[v.label] = (counts[v.label] ?? 0) + 1;
  out.push([t, '', v.category, v.target, String(v.severity), `Wiktionary category ${v.label}; not yet reviewed`, '', '', 'en', `wiktionary-en (CC BY-SA 4.0), ${v.label}`, 'unreviewed'].map(q).join(','));
}
mkdirSync(join(dir, 'prepared'), { recursive: true });
const batch = out.join('\n') + '\n';
writeFileSync(join(dir, 'prepared', 'wiktionary-slurs.batch.csv'), batch);
// a trial list for the runner: the current list with the candidates appended (the loader's safeguards then apply to them as to any row)
const base = readFileSync(listFile, 'utf8').trimEnd();
writeFileSync(join(dir, 'prepared', 'trial-list.csv'), base + '\n' + out.slice(1).join('\n') + '\n');
console.log('Candidate rows (single plain words, not already in the list):', out.length - 1, JSON.stringify(counts));
console.log('Wrote prepared/wiktionary-slurs.batch.csv and prepared/trial-list.csv in', dir);
