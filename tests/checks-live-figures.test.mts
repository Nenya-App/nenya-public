// The live, averaged figures on the "How the checks work" page (src/lib/checksReport.ts, the record in src/lib/checksRuns.json).
// Pooling, version matching, the "(based on N runs, latest D Month YYYY)" words, the fallback, and that the record holds counts only. The recorder is tested in checks-recorder.test.mts.
import { readFileSync } from 'node:fs';
import { CHECKS_BASIS, CHECKS_METHOD_SENTENCE, TYPED_FIGURES, basisNote, computeFigures, formatRunDate, methodSentence, runsOfCurrentVersion, type CheckRecord, type CheckRun } from '../src/lib/checksReport.ts';
import { gradeLevel } from '../src/lib/readingLevel.ts';
import { ok } from './helpers.mts';

const page = readFileSync(new URL('../src/app/components/about/HowChecksWork.tsx', import.meta.url), 'utf8');
const recordText = readFileSync(new URL('../src/lib/checksRuns.json', import.meta.url), 'utf8');
const record = JSON.parse(recordText) as CheckRecord;

const V1 = { lists: 'aaaaaaaaaaaa.11111111.cccccccc', model: 'm1 int8' };
const V2 = { lists: 'bbbbbbbbbbbb.11111111.cccccccc', model: 'm1 int8' };
const g = (cases: number, caught: number, slurCases = 10, slursCaught = 5) => ({ cases, caught, slurCases, slursCaught });
const run = (v: { lists: string; model?: string | null }, date: string, o: Partial<CheckRun> = {}): CheckRun => ({ at: date + 'T03:00:00.000Z', date, source: 'test', lists: v.lists, model: v.model, ...o });
const cnt = (flagged: number, tested: number) => ({ flagged, tested });

// 1. Pooled, not an average of percentages.
{
  const rec: CheckRecord = { current: V1, runs: [
    run(V1, '2026-11-20', { groups: { women: g(100, 50, 10, 10) }, listFalseAlarms: { hatecheck: cnt(10, 1000), ethos: cnt(0, 100) } }),
    run(V1, '2026-11-21', { groups: { women: g(300, 90, 30, 0) }, listFalseAlarms: { hatecheck: cnt(0, 3000), ethos: cnt(1, 100) } }),
  ] };
  const f = computeFigures(rec);
  ok('group figure is pooled counts (140 of 400 = 35%), not the mean of 50% and 30%', f.groupResults[0].caught === 35 && f.groupResults[0].pooledCaught === 140 && f.groupResults[0].pooledCases === 400);
  ok('slurs only are pooled too (10 of 40 = 25%)', f.groupResults[0].slursCaught === 25);
  ok('the number of cases printed is the size of the test set, not the total over runs', f.groupResults[0].cases === 300);
  ok('false-alarm figures are pooled (10 of 4,000 = 0.3%, 1 of 200 = 0.5%)', f.falseAlarms.listHateCheck === 0.3 && f.falseAlarms.listEthos === 0.5);
  ok('N and the latest date come from the runs counted', f.basis.groups.runs === 2 && f.basis.groups.latest === '2026-11-21' && f.measured === '21 November 2026');
}

// 2. Runs of another version are excluded.
{
  const rec: CheckRecord = { current: V1, runs: [
    run(V1, '2026-11-20', { groups: { women: g(100, 50) } }),
    run(V2, '2026-11-21', { groups: { women: g(100, 10) } }),               // other list version
    run({ lists: V1.lists, model: 'm2 int8' }, '2026-11-22', { groups: { women: g(100, 90) } }), // other model
  ] };
  const f = computeFigures(rec);
  ok('a run of another list version is not averaged in', f.groupResults[0].caught === 50);
  ok('a run of another model is not averaged in', f.basis.groups.runs === 1 && f.basis.groups.latest === '2026-11-20');
  ok('runsOfCurrentVersion returns only the matching run', runsOfCurrentVersion(rec).length === 1);
  const noModel: CheckRecord = { current: V1, runs: [run({ lists: V1.lists, model: null }, '2026-11-20', { listFalseAlarms: { hatecheck: cnt(5, 1000), ethos: cnt(1, 500) } })] };
  ok('a run without a model counts for the list figures and not for the group figures', computeFigures(noModel).basis.listAlarms.runs === 1 && computeFigures(noModel).basis.groups.runs === 0);
}

// 3. Fallback to the typed figures.
{
  const none = computeFigures({ current: null, runs: [] });
  ok('no current version: every figure is the typed one and says so', none.groupResults === TYPED_FIGURES.groups && none.falseAlarms.listHateCheck === TYPED_FIGURES.falseAlarms.listHateCheck && !none.basis.groups.live && none.measured === TYPED_FIGURES.measured);
  const other = computeFigures({ current: V1, runs: [run(V2, '2026-11-21', { groups: { women: g(100, 10) } })] });
  ok('runs exist but none of the current version: fall back to typed', other.groupResults === TYPED_FIGURES.groups && other.basis.groups.runs === 0);
  ok('a malformed run (flagged above tested, zero cases) is ignored, not averaged', computeFigures({ current: V1, runs: [run(V1, '2026-11-21', { groups: { women: g(0, 0) }, listFalseAlarms: { hatecheck: cnt(9, 5), ethos: cnt(0, 10) } })] }).basis.groups.live === false);
  ok('the fallback wording says the figure is typed and not recorded', /typed from one test on 14 November 2026/.test(basisNote(none.basis.groups)) && /no recorded run/.test(basisNote(none.basis.groups)));
  ok('the fallback method sentence does not claim repeated tests', !/repeated tests/.test(methodSentence(false)) && /not yet averaged/.test(methodSentence(false)));
}

// 4. The words printed after a figure.
ok('N = 1 reads "based on 1 run"', basisNote({ runs: 1, latest: '2026-11-22', live: true }) === '(based on 1 run, latest 22 November 2026)');
ok('N = 3 reads "based on 3 runs, latest D Month YYYY"', basisNote({ runs: 3, latest: '2026-01-05', live: true }) === '(based on 3 runs, latest 5 January 2026)');
ok('dates are formatted without a time zone', formatRunDate('2026-12-31') === '31 December 2026');
ok('the method sentence says our own repeated tests, public test sets, not independent, new runs update', /our own repeated tests on public test sets/.test(CHECKS_METHOD_SENTENCE) && /not an independent evaluation/.test(CHECKS_METHOD_SENTENCE) && /each new run updates them/.test(CHECKS_METHOD_SENTENCE));
ok('the method sentence and the notes read at grade 9 or lower', gradeLevel(methodSentence(true)) <= 9 && gradeLevel(methodSentence(false)) <= 9 && gradeLevel(basisNote({ runs: 2, latest: '2026-11-22', live: true })) <= 9, `${gradeLevel(methodSentence(true)).toFixed(1)}`);

// 5. The page prints it.
ok('the page prints the run count and latest date after the group table, the false-alarm figures and the model line', ['groups', 'listAlarms', 'modelAlarms', 'neutral'].every((k) => page.includes(`basisNote(CHECKS_BASIS.${k})`)));
ok('the page prints the method sentence', page.includes('{CHECKS_METHOD_SENTENCE}'));
ok('the page no longer carries typed figures', !/\b53\.4\b|\b45\.3\b/.test(page));
ok('the record on this branch has at least one run of the current version, so the page is live', CHECKS_BASIS.groups.live && CHECKS_BASIS.listAlarms.live && CHECKS_BASIS.groups.runs >= 1);

// 6. The record holds counts only.
{
  const KEYS = new Set(['at', 'date', 'source', 'lists', 'model', 'listFalseAlarms', 'modelFalseAlarms', 'neutralIdentity', 'groups', 'note']);
  const GROUPS = new Set(['muslims', 'black people', 'disabled people', 'gay people', 'immigrants', 'trans people', 'women']);
  ok('every run uses only the known keys', record.runs.every((r) => Object.keys(r).every((k) => KEYS.has(k))));
  ok('group names are HateCheck target groups, nothing else', record.runs.every((r) => Object.keys(r.groups ?? {}).every((k) => GROUPS.has(k.toLowerCase()))));
  ok('every number is a whole number', (() => { const bad: string[] = []; JSON.parse(recordText, (k, v) => { if (typeof v === 'number' && !Number.isInteger(v)) bad.push(k); return v; }); return bad.length === 0; })());
  ok('every run has a version fingerprint of the expected shape (hashes, not words)', record.runs.every((r) => /^[0-9a-f]{12}\.([0-9a-f]{8}|none)\.[0-9a-f]{8}$/.test(r.lists)));
  ok('the fingerprints in the record are short strings, notes are one short line', record.runs.every((r) => r.source.length <= 80 && (r.note ?? '').length <= 400 && !/\n/.test(r.note ?? '')));
  ok('the record names a current version and a run uses it', !!record.current && record.runs.some((r) => r.lists === record.current!.lists));
  ok('the page and the report code import no list, lexicon or test-set file', ![page, readFileSync(new URL('../src/lib/checksReport.ts', import.meta.url), 'utf8')].some((t) => /^import .*(slurs|datasets|lexicon|hatecheck|ethos|hurtlex)/im.test(t)));
}

