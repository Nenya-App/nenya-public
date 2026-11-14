// The numbers on the "How the checks work" page, in one place so they can be tested and updated with every list or model change. They come from the evaluation record in docs/ (HateCheck and ETHOS, run with
// scripts/eval-detect.mts, scripts/bakeoff-target-groups.py and scripts/bakeoff-models.py). Update CHECKS_MEASURED and the tables whenever the numbers change; the page prints the date.
export const CHECKS_MEASURED = '14 November 2026';

/** Hateful test cases about each group that the list or the model catches (the model at the 2% false-alarm line), and slurs only. HateCheck, English, written test cases. */
export const GROUP_RESULTS: { group: string; cases: number; caught: number; slursCaught: number }[] = [
  { group: 'Muslims', cases: 373, caught: 53.1, slursCaught: 33.3 },
  { group: 'Women', cases: 373, caught: 44.8, slursCaught: 83.3 },
  { group: 'Immigrants', cases: 357, caught: 43.1, slursCaught: 50.0 },
  { group: 'Gay people', cases: 373, caught: 28.7, slursCaught: 66.7 },
  { group: 'Black people', cases: 357, caught: 28.3, slursCaught: 81.2 },
  { group: 'Trans people', cases: 357, caught: 17.4, slursCaught: 50.0 },
  { group: 'Disabled people', cases: 373, caught: 16.6, slursCaught: 66.7 },
];

/** Share of ordinary text (neutral and positive statements about groups, quotes, denouncing, negation) the checks flagged, in the same tests. */
export const FALSE_ALARMS = { listHateCheck: 0.8, listEthos: 0.4, modelLine: 2, neutralIdentityStatements: 0 };
