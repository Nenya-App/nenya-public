// Turns the downloaded HurtLex English 1.2 file into a batch file for scripts/prepare-private-list.mts (the conservative level, the categories that are about people, our own
// first-guess severities), then reports COUNTS ONLY: no word from the list is printed. Both files stay in the research folder, outside the repository.
//   node scripts/prepare-hurtlex.mts                  # reads datasets/hurtlex/hurtlex_EN_1.2.tsv, writes datasets/hurtlex/prepared/hurtlex-en-1.2.batch.csv
//   node scripts/prepare-private-list.mts "$HOME/Desktop/Nenya Research/datasets/hurtlex/prepared" "$HOME/Desktop/Nenya Research/datasets/hurtlex/list"     # the loader's safeguards, then the review packet
// Needs the licence record (datasets/hurtlex/PROVENANCE.md) to say the NonCommercial reading is confirmed. The list is never distributed (docs/lexicon-sources.md).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { researchPaths } from '../src/lib/researchDir.ts';
import { BATCH_COLUMNS, KEPT_CATEGORIES, mapRow, parseTsv, toCsvLine } from '../src/lib/hurtlexMap.ts';
import { readLexicon } from '../src/lib/lexiconLoader.ts';
import { LEXICON_SOURCES } from '../src/lib/lexiconSources.ts';

const dir = join(researchPaths().datasets, 'hurtlex');
const tsv = join(dir, 'hurtlex_EN_1.2.tsv');
const prov = join(dir, 'PROVENANCE.md');
if (!existsSync(tsv)) { console.error(`No file at ${tsv}. Download HurtLex English 1.2 first (docs/lexicon-sources.md).`); process.exit(1); }
if (!existsSync(prov) || !/- \[x\] I accept that NonCommercial applies/.test(readFileSync(prov, 'utf8'))) { console.error('PROVENANCE.md does not record that the NonCommercial reading is confirmed. Stopping.'); process.exit(1); }
if (resolve(dir).startsWith(resolve(new URL('..', import.meta.url).pathname))) { console.error('The research folder must be outside the repository.'); process.exit(1); }
if (LEXICON_SOURCES['hurtlex-en-1.2'].may.distribute) { console.error('The registry says this source may be distributed. It must not be.'); process.exit(1); }

const rows = parseTsv(readFileSync(tsv, 'utf8'));
const out: string[] = [];
const skipped = { level: 0, category: 0, short: 0 };
const byCategory: Record<string, number> = {};
for (const r of rows) {
  const m = mapRow(r);
  if ('skipped' in m) { skipped[m.skipped]++; continue; }
  byCategory[r.category] = (byCategory[r.category] ?? 0) + 1;
  out.push(toCsvLine(m.row));
}
const prepared = join(dir, 'prepared');
mkdirSync(prepared, { recursive: true });
const csv = BATCH_COLUMNS.map((c) => `"${c}"`).join(',') + '\n' + out.join('\n') + '\n';
writeFileSync(join(prepared, 'hurtlex-en-1.2.batch.csv'), csv);
const { report } = readLexicon(csv);
console.log(`Read ${rows.length} rows. Taken: ${out.length} (conservative level, categories ${KEPT_CATEGORIES.join(', ')}).`);
console.log(`Left out: ${skipped.level} inclusive-only, ${skipped.category} in categories that are mostly ordinary words, ${skipped.short} too short.`);
console.log('Taken by category: ' + Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', '));
console.log(`The loader's safeguards: kept ${report.kept}; neutral identity words dropped ${report.droppedNeutral.length}; switched off until cues given ${report.switchedOff.length}; context rows without cues ${report.contextWithoutCues}; problems ${report.problems.length}.`);
console.log(`\nWrote ${join(prepared, 'hurtlex-en-1.2.batch.csv')}\nNext: node scripts/prepare-private-list.mts "${prepared}" "${join(dir, 'list')}"   (makes slurs.en.csv and the review packet; both private)`);
