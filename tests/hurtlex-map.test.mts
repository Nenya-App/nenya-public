// Mapping HurtLex rows to our list: conservative level only, categories about people, first-guess severities, nothing distributed.
import { mapRow, parseTsv, toCsvLine, KEPT_CATEGORIES, BATCH_COLUMNS } from '../src/lib/hurtlexMap.ts';
import { readLexicon } from '../src/lib/lexiconLoader.ts';
import { ok } from './helpers.mts';

const tsv = 'id\tpos\tcategory\tstereotype\tlemma\tlevel\nEN1\tn\tps\tyes\tfoo bar\tconservative\nEN2\tn\tps\tno\tbazzle\tinclusive\nEN3\tn\tor\tno\tdaisy\tconservative\nEN4\tn\tan\tno\tzed\tconservative\nEN5\tn\tcds\tno\tqx\tconservative\nEN6\tn\tcds\tno\tblorpt\tconservative\n';
const rows = parseTsv(tsv);
ok('the TSV is read with its columns', rows.length === 6 && rows[0].lemma === 'foo bar' && rows[0].stereotype === 'yes');
let bad = false; try { parseTsv('a\tb\n1\t2\n'); } catch { bad = true; }
ok('a file in the wrong shape is refused', bad);
const m = rows.map(mapRow);
ok('inclusive-only rows are left out', 'skipped' in m[1] && (m[1] as any).skipped === 'level');
ok('categories that are mostly ordinary words (plants here) are left out', 'skipped' in m[2] && (m[2] as any).skipped === 'category');
ok('words under three letters are left out', 'skipped' in m[4] && (m[4] as any).skipped === 'short');
ok('slurs aimed at a kind of person get severity 2 and a target; animal words and coarse insults get 1', (m[0] as any).row.severity === 2 && (m[0] as any).row.category === 'slur' && (m[0] as any).row.target === 'race-ethnicity' && (m[3] as any).row.severity === 1 && (m[3] as any).row.category === 'dehumanizing-metaphor' && (m[5] as any).row.category === 'harassing-insult');
ok('every row carries its source and licence, and is marked unreviewed', (m[0] as any).row.source.includes('hurtlex-en-1.2') && (m[0] as any).row.source.includes('CC BY-NC-SA 4.0') && (m[0] as any).row.confidence === 'unreviewed');
const csv = BATCH_COLUMNS.map((c) => `"${c}"`).join(',') + '\n' + m.flatMap((x) => ('row' in x ? [toCsvLine(x.row)] : [])).join('\n') + '\n';
const { report, rows: loaded } = readLexicon(csv);
ok('the loader accepts the batch file without problems and keeps the rows it should', report.problems.length === 0 && loaded.length === 3);
ok('the animal row becomes a context row that is off without cues (never matches by itself)', loaded.some((r) => r.category === 'dehumanizing-metaphor' && r.cues.length === 0));
ok('the kept categories are only about people', KEPT_CATEGORIES.every((c) => ['ps', 'om', 'ddp', 'ddf', 'an', 'cds', 'asf', 'asm', 'pr'].includes(c)));
