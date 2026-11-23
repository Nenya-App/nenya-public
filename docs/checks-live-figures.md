# Live figures on "How the Checks Work"

Written 2026-11-22, from the owner's words that day: the figures "should be a live figure based on ongoing tests", printed with "(based on x amount of runs)", and "those tests should be on". The tests run and the results are not published directly; the page prints the averaged figures, how many runs they rest on and the date of the latest.

## What the page prints

Each figure on `/about/how-checks-work` (the per-group table, the false-alarm figures for the list on HateCheck and ETHOS, the model's 2% line, and the neutral statements) carries "(based on N runs, latest D Month YYYY)"; one run reads "based on 1 run". One sentence says the figures come from our own repeated tests on public test sets, are not an independent evaluation, and that each new run updates them.

- **Pooled, not averaged percentages.** A figure is the total flagged (or caught) over the total tested, across all the runs counted. The table's "Examples" column shows the size of the test set, not the total over runs.
- **Same version only.** A run belongs to the figure only if its `lists` fingerprint equals the record's `current.lists` and its `model` equals `current.model`. Runs of another version stay in the file, unused.
- **Fallback.** If the record has no run of the current version for a figure, that figure is the typed one from 14 November 2026 (`TYPED_FIGURES` in `src/lib/checksReport.ts`) and the page says "typed from one test on 14 November 2026; no recorded run of the current lists yet", and the method sentence stops saying "repeated tests".

## The record: `src/lib/checksRuns.json`

Counts only. No case text, no list words, no per-case outcomes. Per run: `at`, `date` (the Mac's local date), `source`, `lists`, `model` (when the per-group bake-off was run), `listFalseAlarms` (list alone, flagged out of tested, HateCheck and ETHOS), `modelFalseAlarms` (the model at its 2% line, same sets), `neutralIdentity` (neutral and positive statements about a group that the list or model flagged), `groups` (per HateCheck target group: cases, caught, slur cases, slurs caught) and an optional one-line `note`. `current` names the version the page uses. `tests/checks-live-figures.test.mts` checks that no other key and no non-integer is present.

**The version fingerprint.** `lists` is `<12 characters of the hash of the private list>.<8 of the hash of the reviewers' decisions file, or none>.<8 of a hash of the detection code>`. The code is `lexicon.ts`, `lexiconLoader.ts`, `lexiconDecisions.ts`, `learningOffer.ts`, `safetyFlags.ts`, `safetyEval.ts` and `promptGuard.ts` in `src/lib` (list in `scripts/lib/checksRecord.mts`). Editing any of them, even a comment, starts a new version. `model` is `<12 characters of the hash of model_int8.onnx> int8 at the 2% line`. A hash cannot be turned back into a word.

## Adding a run

Everything is run from the repository, with the research folder in place (`~/Desktop/Nenya Research/`, or `NENYA_RESEARCH_DIR`):

```
cd /Users/estellestreiff/Desktop/nenya-public
node scripts/eval-detect.mts --dump                                   # outcomes per case, no text, into the research folder
python3 scripts/bakeoff-target-groups.py --json /tmp/groups.json      # exact per-group counts and the model's false alarms
node scripts/eval-detect.mts --record --groups /tmp/groups.json       # appends the counts-only entry
```

`scripts/run-checks-nightly.sh` does all three. The recorder refuses a groups file older than the outcomes it read, or outcomes older than the list. **The record file changes in your working copy; commit it like any change.** The page changes after the next deploy of a commit that contains it. Nothing is pushed or deployed by the scripts.

When the lists or the model change (a new upload, a new decisions file, a code change in the files above), the next run has a new fingerprint. It is recorded but not used by the page. When that version is the one now live, record a run with `--set-current` (or edit `current` in the file). Until then the page keeps showing the older version, with its own run count and date.

## Backfill, 2026-11-22

Only one earlier run could be tied to the current lists and model: `bakeoff-target-groups-2026-11-14b.txt` (made at 04:18 on 14 November, after the list and decisions were last changed at 04:17). The list, decisions and model files have not changed since; the HateCheck outcomes of today's code and list are byte-identical to the ones that run read; a re-run today printed the identical tables. It carries the group counts and the neutral statements, but no false-alarm counts for the list alone, so it adds none. Excluded: the HateCheck and ETHOS runs of 12 November (`detect-*.json`, earlier lists and decision files), `bakeoff-target-groups-2026-11-13.txt` and `-11-14.txt` (earlier lists: their list columns differ), and the model bake-off files (not per-group, not this record).

## The tests are "on": the nightly script

The datasets and the private list are in the research folder, so a Netlify function cannot run them; they run on this Mac. **No schedule has been created.** To turn it on, you decide, and then (one option) save this as `~/Library/LaunchAgents/biz.nenya.checks-nightly.plist` and run `launchctl load ~/Library/LaunchAgents/biz.nenya.checks-nightly.plist`:

```
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>biz.nenya.checks-nightly</string>
  <key>ProgramArguments</key><array><string>/bin/zsh</string><string>/Users/estellestreiff/Desktop/nenya-public/scripts/run-checks-nightly.sh</string></array>
  <key>StartCalendarInterval</key><dict><key>Hour</key><integer>3</integer><key>Minute</key><integer>15</integer></dict>
  <key>StandardOutPath</key><string>/tmp/checks-nightly.out</string>
  <key>StandardErrorPath</key><string>/tmp/checks-nightly.err</string>
</dict></plist>
```

Or a cron line (`crontab -e`): `15 3 * * * /bin/zsh /Users/estellestreiff/Desktop/nenya-public/scripts/run-checks-nightly.sh`. A Mac that is asleep at 03:15 runs launchd jobs when it wakes; cron skips them. To stop: `launchctl unload` the plist and delete it. The script keeps a counts-only log at `Nenya Research/results/checks-nightly.log`, locks against overlapping runs, and only changes `src/lib/checksRuns.json` in the checked-out branch (which it does not commit). It runs against whichever branch the working copy is on, so run it from the branch whose lists you mean to measure.

## What the owner should know about "runs"

- **Same version, same answer.** The list, the model and the test sets do not change between nightly runs, and the checks are deterministic (a re-run on 2026-11-22 reproduced the printed tables of 14 November exactly). Averaging runs of one unchanged version therefore gives the same figure each time: a higher run count shows the tests were repeated, not that the figure became more certain. The 95% intervals in the bake-off files (the sampling uncertainty of the test set) are the honest measure of certainty. The page says "repeated tests", which is true; whether "N runs" of an unchanged version should be shown as a count is the owner's decision.
- **Pooling versions.** The page never pools runs of different list or model versions, because a figure for one list is not a figure for the next (the results rules, section 4: "a result for one build is not a result for the next"). A figure over several versions would describe none of them.
