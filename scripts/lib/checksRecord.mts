// The record of check runs behind the "How the checks work" page (src/lib/checksRuns.json, read by src/lib/checksReport.ts; docs/checks-live-figures.md).
// COUNTS ONLY: this file never handles case text or list words. It builds the version fingerprint, checks the numbers the Python bakeoff hands over, and appends one run to the record.
// Used by scripts/eval-detect.mts --record. A run of any version is recorded, but the page averages only the runs whose fingerprint matches the record's `current`.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

/** The code that decides what is flagged (the matcher, the loader, the reviewers' decisions, the card-offer rule, the crisis and manipulation checks). A change to any of them is a new version. */
export const CODE_FILES = ['lexicon.ts', 'lexiconLoader.ts', 'lexiconDecisions.ts', 'learningOffer.ts', 'safetyFlags.ts', 'safetyEval.ts', 'promptGuard.ts'];

const sha = (s: string | Buffer): string => createHash('sha256').update(s).digest('hex');

/** Eight characters of a hash over the detection code, read from `libDir` (src/lib). */
export function codeFingerprint(libDir: string): string {
  const h = createHash('sha256');
  for (const f of CODE_FILES) h.update(f + '\n').update(readFileSync(libDir.replace(/\/$/, '') + '/' + f));
  return h.digest('hex').slice(0, 8);
}

/** "<list hash>.<decisions hash or none>.<code hash>": the private list, the reviewers' decisions on it, and the detection code. Nothing in it can be read back into a word. */
export function listsFingerprint(listCsv: string, decisionsCsv: string | null, code: string): string {
  return `${sha(listCsv).slice(0, 12)}.${decisionsCsv === null ? 'none' : sha(decisionsCsv).slice(0, 8)}.${code}`;
}

export interface Count { flagged: number; tested: number }
export interface GroupsFile {
  model: string;
  modelFalseAlarms: { hatecheck: Count; ethos: Count };
  neutralIdentity: Count;
  groups: Record<string, { cases: number; caught: number; slurCases: number; slursCaught: number }>;
}

const int = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 0;
function count(c: any, what: string): Count {
  if (!c || !int(c.flagged) || !int(c.tested) || c.tested === 0 || c.flagged > c.tested) throw new Error(`${what}: not a count (flagged and tested must be whole numbers, flagged at most tested)`);
  return { flagged: c.flagged, tested: c.tested };
}
const safeWords = /^[A-Za-z0-9 ().,:+/_%-]{1,80}$/;

/** Reads the file `bakeoff-target-groups.py --json` writes and keeps only the known count fields. Throws on anything else, so text can never slip into the record. */
export function parseGroupsFile(text: string): GroupsFile {
  const d = JSON.parse(text);
  if (typeof d.model !== 'string' || !safeWords.test(d.model)) throw new Error('groups file: the model fingerprint is missing or has odd characters');
  const groups: GroupsFile['groups'] = {};
  if (!d.groups || typeof d.groups !== 'object' || Object.keys(d.groups).length === 0) throw new Error('groups file: no groups');
  for (const [k, g] of Object.entries<any>(d.groups)) {
    if (!/^[A-Za-z][A-Za-z ]{1,39}$/.test(k)) throw new Error('groups file: a group name has odd characters');
    if (!int(g?.cases) || !int(g?.caught) || !int(g?.slurCases) || !int(g?.slursCaught) || g.cases === 0 || g.caught > g.cases || g.slursCaught > g.slurCases) throw new Error(`groups file: bad counts for group "${k}"`);
    groups[k] = { cases: g.cases, caught: g.caught, slurCases: g.slurCases, slursCaught: g.slursCaught };
  }
  return {
    model: d.model,
    modelFalseAlarms: { hatecheck: count(d.modelFalseAlarms?.hatecheck, 'modelFalseAlarms.hatecheck'), ethos: count(d.modelFalseAlarms?.ethos, 'modelFalseAlarms.ethos') },
    neutralIdentity: count(d.neutralIdentity, 'neutralIdentity'),
    groups,
  };
}

export interface RecordedRun {
  at: string; date: string; source: string; lists: string; model?: string;
  listFalseAlarms: { hatecheck: Count; ethos: Count };
  modelFalseAlarms?: { hatecheck: Count; ethos: Count };
  neutralIdentity?: Count;
  groups?: GroupsFile['groups'];
  note?: string;
}
interface RunRecord { about: string; current: { lists: string; model: string | null } | null; runs: RecordedRun[] }

const ABOUT = 'Counts only: no case text and no list words, ever. One entry per run of scripts/eval-detect.mts --record (docs/checks-live-figures.md). `lists` fingerprints the private list, the reviewers\' decisions and the detection code; `model` the classifier file and the 2% line. The page (src/lib/checksReport.ts) averages, by pooling the counts, only the runs whose fingerprint matches `current`; runs of other versions stay here, unused.';

/** Builds a run entry from this run's counts. `groups` is optional (a run without the Python bakeoff has no model figures). */
export function buildRun(o: { now: Date; source: string; lists: string; listFalseAlarms: RecordedRun['listFalseAlarms']; groupsFile?: GroupsFile; note?: string }): RecordedRun {
  if (!safeWords.test(o.source)) throw new Error('--source: plain letters, digits and spaces only, up to 80 characters');
  if (o.note !== undefined && !/^[^\n\r]{1,300}$/.test(o.note)) throw new Error('--note: one line, up to 300 characters');
  const pad = (n: number) => String(n).padStart(2, '0');
  const run: RecordedRun = {
    at: o.now.toISOString(), date: `${o.now.getFullYear()}-${pad(o.now.getMonth() + 1)}-${pad(o.now.getDate())}`, source: o.source, lists: o.lists,
    listFalseAlarms: { hatecheck: count(o.listFalseAlarms.hatecheck, 'hatecheck'), ethos: count(o.listFalseAlarms.ethos, 'ethos') },
  };
  if (o.groupsFile) { run.model = o.groupsFile.model; run.modelFalseAlarms = o.groupsFile.modelFalseAlarms; run.neutralIdentity = o.groupsFile.neutralIdentity; run.groups = o.groupsFile.groups; }
  if (o.note) run.note = o.note;
  return run;
}

/** Appends a run to the record file (created when missing). With `setCurrent` the record's current version becomes this run's; otherwise a run of another version is kept but not used by the page. */
export function appendRun(file: string, run: RecordedRun, setCurrent: boolean): { current: RunRecord['current']; usedByPage: boolean; runsOfCurrent: number } {
  const rec: RunRecord = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : { about: ABOUT, current: null, runs: [] };
  rec.about = ABOUT;
  rec.runs.push(run);
  if (setCurrent) rec.current = { lists: run.lists, model: run.model ?? rec.current?.model ?? null };
  writeFileSync(file, JSON.stringify(rec, null, 1) + '\n');
  const c = rec.current;
  const used = rec.runs.filter((r) => c && r.lists === c.lists && (r.model == null || r.model === c.model));
  return { current: c, usedByPage: !!c && used.includes(run), runsOfCurrent: used.length };
}
