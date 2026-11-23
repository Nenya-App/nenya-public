// The numbers on the "How the checks work" page, in one place so they can be tested. They are LIVE FIGURES: each is the pooled average (total flagged or caught over total tested, never an average of percentages) over the
// recorded runs of the CURRENT version of the lists and model, in src/lib/checksRuns.json (counts only, no text). The runs come from scripts/eval-detect.mts --record, fed by scripts/bakeoff-target-groups.py --json
// (see docs/checks-live-figures.md; scripts/run-checks-nightly.sh does both). Runs of any other version are recorded but never averaged in. When no run of the current version exists, the typed figures below are used
// and the page says so. The page prints each figure with how many runs it rests on and the date of the latest one.
import RECORD from './checksRuns.json' with { type: 'json' };

export interface Count { flagged: number; tested: number }
export interface RunGroup { cases: number; caught: number; slurCases: number; slursCaught: number }
/** One recorded run: counts only. `lists` fingerprints the private list, the reviewers' decisions and the matcher code; `model` the classifier file and the 2% line. */
export interface CheckRun {
  at: string; date: string; source: string; lists: string; model?: string | null;
  listFalseAlarms?: { hatecheck: Count; ethos: Count };
  modelFalseAlarms?: { hatecheck: Count; ethos: Count };
  neutralIdentity?: Count;
  groups?: Record<string, RunGroup>;
  note?: string;
}
export interface CheckRecord { about?: string; current: { lists: string; model: string | null } | null; runs: CheckRun[] }

/** The figures typed by hand on 14 November 2026 (HateCheck and ETHOS, one run). Used only when the record has no run of the current version. */
export const TYPED_FIGURES = {
  measured: '14 November 2026',
  groups: [
    { group: 'Muslims', cases: 373, caught: 53.4, slursCaught: 33.3 },
    { group: 'Women', cases: 373, caught: 45.3, slursCaught: 83.3 },
    { group: 'Immigrants', cases: 357, caught: 44.0, slursCaught: 50.0 },
    { group: 'Gay people', cases: 373, caught: 30.8, slursCaught: 66.7 },
    { group: 'Black people', cases: 357, caught: 30.5, slursCaught: 81.2 },
    { group: 'Trans people', cases: 357, caught: 20.2, slursCaught: 50.0 },
    { group: 'Disabled people', cases: 373, caught: 19.8, slursCaught: 66.7 },
  ] as GroupResult[],
  falseAlarms: { listHateCheck: 1.0, listEthos: 0.4, modelLine: 2, neutralIdentityStatements: 0 },
};

/** Hateful test cases about one group that the list or the model catches (the model at the 2% false-alarm line), and slurs only, as percentages. `cases` is the size of the test set (the same on every run); `pooledCases` and `pooledCaught` are the totals over all the runs counted. */
export interface GroupResult { group: string; cases: number; caught: number; slursCaught: number; pooledCases?: number; pooledCaught?: number }
export interface FalseAlarms { listHateCheck: number; listEthos: number; modelLine: number; neutralIdentityStatements: number }
/** How many runs a figure rests on, the date of the latest (YYYY-MM-DD), and whether it is live (from the record) or typed. */
export interface Basis { runs: number; latest: string | null; live: boolean }
export interface Figures {
  groupResults: GroupResult[]; falseAlarms: FalseAlarms;
  basis: { groups: Basis; listAlarms: Basis; modelAlarms: Basis; neutral: Basis };
  measured: string;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
/** '2026-11-22' -> '22 November 2026' (no time zones involved). */
export function formatRunDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}` : iso;
}
/** The words printed after a figure: "(based on 3 runs, latest 22 November 2026)", "(based on 1 run, ...)", or, when the figure is typed, a plain statement that it is. */
export function basisNote(b: Basis, typedDate: string = TYPED_FIGURES.measured): string {
  if (!b.live || !b.latest) return `(typed from one test on ${typedDate}; no recorded run of the current lists yet)`;
  return `(based on ${b.runs} ${b.runs === 1 ? 'run' : 'runs'}, latest ${formatRunDate(b.latest)})`;
}

const isCount = (c: unknown): c is Count => !!c && Number.isInteger((c as Count).flagged) && Number.isInteger((c as Count).tested) && (c as Count).tested > 0 && (c as Count).flagged >= 0 && (c as Count).flagged <= (c as Count).tested;
const isGroup = (g: unknown): g is RunGroup => !!g && ['cases', 'caught', 'slurCases', 'slursCaught'].every((k) => Number.isInteger((g as RunGroup)[k as keyof RunGroup]) && (g as RunGroup)[k as keyof RunGroup] >= 0) && (g as RunGroup).cases > 0 && (g as RunGroup).caught <= (g as RunGroup).cases && (g as RunGroup).slursCaught <= (g as RunGroup).slurCases;

/** The runs that count: the same list/decisions/code fingerprint as the record's `current`, and the same model (a run without a model counts only for the list-only figures). Nothing else is ever averaged in. */
export function runsOfCurrentVersion(record: CheckRecord): CheckRun[] {
  const c = record?.current;
  if (!c || !Array.isArray(record.runs)) return [];
  return record.runs.filter((r) => r && r.lists === c.lists && (r.model == null || r.model === c.model));
}

const latestOf = (runs: CheckRun[]): string | null => runs.reduce<string | null>((a, r) => (a === null || r.date > a ? r.date : a), null);
const basisOf = (runs: CheckRun[]): Basis => ({ runs: runs.length, latest: latestOf(runs), live: runs.length > 0 });
const pool = (cs: Count[]): number => 100 * cs.reduce((a, c) => a + c.flagged, 0) / cs.reduce((a, c) => a + c.tested, 0);
const one = (x: number): number => Number(x.toFixed(1));
const display = (key: string): string => key.charAt(0).toUpperCase() + key.slice(1);

/** Works out every figure from a record. Each figure falls back, on its own, to the typed one when the record has no run of the current version that carries it. */
export function computeFigures(record: CheckRecord, typed: typeof TYPED_FIGURES = TYPED_FIGURES): Figures {
  const runs = runsOfCurrentVersion(record);
  const gRuns = runs.filter((r) => r.groups && Object.keys(r.groups).length > 0 && Object.values(r.groups).every(isGroup));
  const lRuns = runs.filter((r) => r.listFalseAlarms && isCount(r.listFalseAlarms.hatecheck) && isCount(r.listFalseAlarms.ethos));
  const mRuns = runs.filter((r) => r.modelFalseAlarms && isCount(r.modelFalseAlarms.hatecheck) && isCount(r.modelFalseAlarms.ethos));
  const nRuns = runs.filter((r) => isCount(r.neutralIdentity));
  let groupResults = typed.groups;
  if (gRuns.length) {
    const keys = [...new Set(gRuns.flatMap((r) => Object.keys(r.groups!)))];
    const latest = [...gRuns].sort((a, b) => (a.at < b.at ? 1 : -1))[0];
    groupResults = keys.map((k) => {
      const gs = gRuns.map((r) => r.groups![k]).filter(Boolean);
      const cases = gs.reduce((a, g) => a + g.cases, 0), caught = gs.reduce((a, g) => a + g.caught, 0);
      const sc = gs.reduce((a, g) => a + g.slurCases, 0), ss = gs.reduce((a, g) => a + g.slursCaught, 0);
      return { group: display(k), cases: latest.groups![k]?.cases ?? gs[0].cases, caught: one((100 * caught) / cases), slursCaught: sc ? one((100 * ss) / sc) : 0, pooledCases: cases, pooledCaught: caught };
    }).sort((a, b) => b.caught - a.caught);
  }
  const t = typed.falseAlarms;
  const falseAlarms: FalseAlarms = {
    listHateCheck: lRuns.length ? one(pool(lRuns.map((r) => r.listFalseAlarms!.hatecheck))) : t.listHateCheck,
    listEthos: lRuns.length ? one(pool(lRuns.map((r) => r.listFalseAlarms!.ethos))) : t.listEthos,
    modelLine: mRuns.length ? one(pool(mRuns.flatMap((r) => [r.modelFalseAlarms!.hatecheck, r.modelFalseAlarms!.ethos]))) : t.modelLine,
    neutralIdentityStatements: nRuns.length ? one(pool(nRuns.map((r) => r.neutralIdentity!))) : t.neutralIdentityStatements,
  };
  const basis = { groups: basisOf(gRuns), listAlarms: basisOf(lRuns), modelAlarms: basisOf(mRuns), neutral: basisOf(nRuns) };
  const dates = Object.values(basis).map((b) => b.latest).filter((d): d is string => !!d).sort();
  return { groupResults, falseAlarms, basis, measured: dates.length ? formatRunDate(dates[dates.length - 1]) : typed.measured };
}

const FIGURES = computeFigures(RECORD as unknown as CheckRecord);
export const CHECKS_FIGURES = FIGURES;
export const CHECKS_BASIS = FIGURES.basis;
/** Date of the latest run the page rests on (or the typed date, when no run of the current version exists). */
export const CHECKS_MEASURED = FIGURES.measured;
export const GROUP_RESULTS: GroupResult[] = FIGURES.groupResults;
/** Share of ordinary text (neutral and positive statements about groups, quotes, denouncing, negation) the checks flagged, in the same tests: the list alone on HateCheck and on ETHOS, the model at its 2% line, and neutral or positive statements about a group (list or model). */
export const FALSE_ALARMS: FalseAlarms = FIGURES.falseAlarms;
/** The one sentence the page prints about where the figures come from. */
export function methodSentence(live: boolean): string {
  return live
    ? 'These figures come from our own repeated tests on public test sets. They are not an independent evaluation, and each new run updates them.'
    : 'These figures come from our own tests on public test sets. They are not an independent evaluation, and they are not yet averaged over repeated runs.';
}
export const CHECKS_METHOD_SENTENCE = methodSentence(FIGURES.basis.groups.live && FIGURES.basis.listAlarms.live);

/**
 * Where the hate-speech classifier (cardiffnlp/twitter-roberta-base-hate-latest, src/lib/screenModel.ts) stands, in words the "How the checks work" page prints. `onLiveSite` follows the same switch as the Terms (VITE_SCREEN_MODEL=on, turned on together with COACH_SCREEN on the live site; 'shadow' only counts the band, 'on' lets it change the tone of a reply); update `asOf` when you turn it on. Recorded in ATTRIBUTIONS.md: "not yet switched on in production".
 */
export const SCREEN_STATUS: { asOf: string; onLiveSite: boolean } = { asOf: '20 November 2026', onLiveSite: import.meta.env?.VITE_SCREEN_MODEL === 'on' };
