// Prepares the private slur and dehumanizing-language list for use: reads the batch files from a folder (each a CSV with a header row), applies the loader's
// safeguards (src/lib/lexiconLoader.ts), merges duplicates, and writes two files into an output folder: slurs.en.csv (the cleaned list) and review-packet.md (what
// the counselor and the advocate should read). It prints only counts: terms stay in the files you give it and the files it writes, which must be OUTSIDE the repository.
//   node scripts/prepare-private-list.mts <input-folder> <output-folder>
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { readLexicon, parseCsv } from '../src/lib/lexiconLoader.ts';

const [inDir, outDir] = process.argv.slice(2);
if (!inDir || !outDir) { console.error('usage: prepare-private-list.mts <input-folder> <output-folder>'); process.exit(1); }
if (resolve(outDir).startsWith(resolve(new URL('..', import.meta.url).pathname))) { console.error('The output folder must be outside the repository.'); process.exit(1); }

const files = readdirSync(inDir).filter((f) => /^HL-\d+$/.test(f) || f.endsWith('.csv')).sort();
let header = '';
const bodies: string[] = [];
for (const f of files) {
  const text = readFileSync(join(inDir, f), 'utf8').replace(/^﻿/, '');
  const lines = text.split(/\r?\n/);
  const first = lines.findIndex((l) => /^"?term"?,/i.test(l.trim()));
  if (first < 0) { console.error(`${f}: no header row`); continue; }
  header = header || lines[first];
  bodies.push(lines.slice(first + 1).filter((l) => l.trim()).join('\n'));
}
const { rows, report } = readLexicon(header + '\n' + bodies.join('\n'));

const q = (s: string): string => `"${s.replace(/"/g, '""')}"`;
const cols = ['term', 'variants', 'category', 'target', 'severity', 'context_note', 'match_mode', 'cues', 'language', 'source', 'confidence'];
const out = [cols.map(q).join(',')];
for (const r of rows) out.push([r.term, r.variants.join('|'), r.category, r.target, String(r.severity), r.contextNote, r.matchMode, r.cues.join('|'), r.language, r.source, r.confidence].map(q).join(','));
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'slurs.en.csv'), out.join('\n') + '\n');

const tally = (f: (r: (typeof rows)[number]) => string): string => Object.entries(rows.reduce<Record<string, number>>((a, r) => ((a[f(r)] = (a[f(r)] ?? 0) + 1), a), {})).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', ');
const sev3 = rows.filter((r) => r.severity === 3).map((r) => r.term).join(', ');
const raceSev = rows.filter((r) => r.category === 'slur' && r.target === 'race-ethnicity');
const modelKnowledge = rows.filter((r) => /model-knowledge/.test(r.source)).length;
const packet = `# Review packet for the private list (made by scripts/prepare-private-list.mts)

PRIVATE. Contains the terms. Do not put this file in the repository, an email or a chat.

## Counts
- Rows read: ${report.total}. Kept after cleaning: ${report.kept}. Merged duplicates: ${report.merged}. Dropped as neutral identity words: ${report.droppedNeutral.length}. Dropped as too short: ${report.droppedShort}.
- Match modes: ${tally((r) => r.matchMode)}.
- Categories: ${tally((r) => r.category)}.
- Severity: ${tally((r) => String(r.severity))}.
- Targets: ${tally((r) => r.target)}.
- Sources (first named): ${tally((r) => r.source.split(';')[0].trim() || '(none)')}. Rows from model knowledge alone: ${modelKnowledge} of ${report.kept}.

## 1. Severity needs a person's judgment (the most important finding)
Severity is used to decide how strongly to respond, and the file's severities are not usable as they stand: ${raceSev.length} slurs aimed at race or ethnicity have severities ${[1, 2, 3].map((s) => `${s}: ${raceSev.filter((r) => r.severity === s).length}`).join(', ')}. The handoff's own policy says a slur that is the insult in nearly all uses is a 3. Please review the severity of every slur, starting with race-ethnicity, religion, sexual orientation, gender identity and disability.
Current severity-3 rows (${rows.filter((r) => r.severity === 3).length}): ${sev3 || '(none)'}

## 2. Words switched OFF until they have cue words (so self-description is never flagged)
${report.switchedOff.join(', ') || '(none)'}

## 3. Dropped because they are neutral identity words
${report.droppedNeutral.join(', ') || '(none)'}

## 4. Context rows with no cue words (they never match until cues are given): ${report.contextWithoutCues}
${rows.filter((r) => r.matchMode === 'token_context' && !r.cues.length).map((r) => `- ${r.term} (${r.target}, severity ${r.severity})${r.contextNote ? ': ' + r.contextNote : ''}`).join('\n')}

## 5. Other things to read
- Rows with an empty context note: ${rows.filter((r) => !r.contextNote).length} of ${report.kept}.
- Lexical tells that are not abuse ("llm-tell"): ${rows.filter((r) => /llm-tell/.test(r.contextNote)).length}.
- Terms shared by more than one target: ${(() => { const m = new Map<string, Set<string>>(); for (const r of rows) m.set(r.term, (m.get(r.term) ?? new Set()).add(r.target)); return [...m].filter(([, s]) => s.size > 1).length; })()}.
- Problems while reading: ${report.problems.join('; ') || 'none'}.

## Reviewers
1. A counselor: severity, tone, anything that would harm someone who describes their own experience.
2. A domestic-violence advocate: class-poverty-housing and immigration-status first (mild terms most likely to fire on ordinary prose), then the harassing insults.
`;
writeFileSync(join(outDir, 'review-packet.md'), packet);
console.log(`files read: ${files.length}; rows ${report.total} -> kept ${report.kept}; merged ${report.merged}; neutral dropped ${report.droppedNeutral.length}; short dropped ${report.droppedShort}; switched off ${report.switchedOff.length}; context rows without cues ${report.contextWithoutCues}; problems ${report.problems.length}`);
console.log(`wrote ${join(outDir, 'slurs.en.csv')} and ${join(outDir, 'review-packet.md')}`);
