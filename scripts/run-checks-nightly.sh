#!/bin/zsh
# Runs the checks' evaluations on this Mac and records their COUNTS for the "How the checks work" page (docs/checks-live-figures.md). The test sets and the private list live in the research folder, not the repo, so this cannot run on Netlify.
#   zsh /Users/estellestreiff/Desktop/nenya-public/scripts/run-checks-nightly.sh
# What it does, in order: (1) the site's detection over HateCheck and ETHOS (writes per-case outcomes, no text, to the research folder's results/private); (2) the per-group bake-off of the model and the list, as exact counts;
# (3) appends one counts-only entry, with the version fingerprint, to src/lib/checksRuns.json. It never commits, pushes, deploys or touches Netlify, Venice or Cloudflare; the page changes only when you commit the record file and deploy.
# A run of a list or model version other than the record's `current` is kept but not used by the page (add --set-current, passed on below, only when that version is the one now live).
# NOT SCHEDULED BY ITSELF: nothing runs this until you set up a schedule (the docs note has a launchd example).
set -u
REPO="${NENYA_REPO:-/Users/estellestreiff/Desktop/nenya-public}"
RESEARCH="${NENYA_RESEARCH_DIR:-$HOME/Desktop/Nenya Research}"
# launchd and cron start with a bare PATH: put node and python where they live on this Mac.
export PATH="/opt/homebrew/bin:/usr/local/bin:/Library/Frameworks/Python.framework/Versions/3.13/bin:$HOME/.local/bin:$PATH"
export NENYA_RESEARCH_DIR="$RESEARCH"
cd "$REPO" || { echo "No repo at $REPO"; exit 2; }
LOG="$RESEARCH/results/checks-nightly.log"
mkdir -p "$RESEARCH/results"
LOCK="$RESEARCH/results/.checks-nightly.lock"
if ! mkdir "$LOCK" 2>/dev/null; then echo "$(date '+%F %T') another run is in progress (or left $LOCK behind); stopping." | tee -a "$LOG"; exit 3; fi
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP" "$LOCK"' EXIT
say() { echo "$(date '+%F %T') $*" | tee -a "$LOG"; }
say "start (node $(node --version), $(python3 --version))"
# eval-detect exits 0 when its 2% false-alarm bar is met and 1 when it is not; both are results. Anything else is a failure.
node scripts/eval-detect.mts --dump >"$TMP/detect.txt" 2>&1; rc=$?
[ $rc -le 1 ] || { say "eval-detect failed (exit $rc); nothing recorded. Last lines:"; tail -5 "$TMP/detect.txt" | tee -a "$LOG"; exit 1; }
python3 scripts/bakeoff-target-groups.py --json "$TMP/groups.json" >"$TMP/groups.txt" 2>"$TMP/groups.err" || { say "the per-group bake-off failed; nothing recorded. Last lines:"; tail -5 "$TMP/groups.err" | tee -a "$LOG"; exit 1; }
node scripts/eval-detect.mts --record --groups "$TMP/groups.json" --source "nightly" "$@" >"$TMP/record.txt" 2>&1; rc=$?
[ $rc -le 1 ] || { say "recording failed (exit $rc). Last lines:"; tail -5 "$TMP/record.txt" | tee -a "$LOG"; exit 1; }
grep -E "^Recorded|^The page|^This run" "$TMP/record.txt" | tee -a "$LOG"
[ $rc -eq 1 ] && say "note: the 2% false-alarm bar was NOT met in this run (recorded all the same)."
say "done"
