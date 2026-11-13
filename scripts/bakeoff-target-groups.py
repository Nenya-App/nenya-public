#!/usr/bin/env python3
"""Per-target-group measure for the screening model and the list (docs/coach-screening-flow-scope.md, section 16). HateCheck labels each case with the group it is about (target_ident). For each group:
the share of its HATEFUL cases the model catches at the chosen threshold (the 2% line from the bake-off), the share the list and its gentle tiers act on, the share either acts on, and the share of its
NON-hateful cases (neutral and positive statements, quotes, denouncing) each flags. A group that is caught much less, or flagged much more, than the others is a bias to look at. Counts only.
  python3 scripts/bakeoff-target-groups.py     (needs `node scripts/eval-detect.mts --dump` run first, for the list's outcomes)
"""
import csv, json, os, sys, math
import numpy as np
sys.argv = [sys.argv[0], 'cardiffnlp onnx']
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'bakeoff-models.py')).read().split('\nmain()')[0])
rows = list(csv.DictReader(open(os.path.join(R, 'datasets/hatecheck/test_suite_cases.csv'), encoding='utf-8')))
M = load_models('cardiffnlp onnx')['cardiffnlp hate int8 (ONNX export)']; hi = M['heads']['hate']
S = score(M['run'], [r['test_case'] for r in rows])[:, hi]
ordinary = np.concatenate([S[[r['label_gold'] != 'hateful' for r in rows]], score(M['run'], [t for t, h, g in ethos() if not h])[:, hi]])
thr = float(np.quantile(ordinary, 1 - BAR))
V = json.load(open(os.path.join(R, 'results/private/verdicts-hatecheck.json')))
assert len(V) == len(rows)
act = np.array([v['flagged'] or v['judgment'] or v['self'] or v['deferred'] for v in V])
flagged_list = np.array([v['flagged'] for v in V])
def wil(k, n):
    if n == 0: return (0, 0)
    z = 1.96; p = k / n; d = 1 + z * z / n; c = p + z * z / (2 * n); m = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)); return ((c - m) / d * 100, (c + m) / d * 100)
groups = sorted({r['target_ident'] for r in rows if r['target_ident']})
print(f"threshold {thr:.3f} (flags 2% of 1,730 ordinary cases)\n")
def table(label, pick, which):
    print(label)
    print(f"  {'group':18s} {'n':>4s}  {'model':>14s}  {'list+tiers':>14s}  {'either':>7s}")
    out = []
    for g in groups:
        idx = [i for i, r in enumerate(rows) if r['target_ident'] == g and pick(r)]
        n = len(idx)
        if not n: continue
        m = int(sum(S[i] > thr for i in idx)); l = int(sum(act[i] for i in idx)); e = int(sum(S[i] > thr or act[i] for i in idx))
        mlo, mhi = wil(m, n)
        print(f"  {g:18s} {n:4d}  {m / n * 100:5.1f}% [{mlo:3.0f}-{mhi:3.0f}]  {l / n * 100:5.1f}%        {e / n * 100:5.1f}%")
        out.append((g, m / n, l / n, e / n, n))
    ms = [o[1] for o in out]; ls = [o[2] for o in out]; es = [o[3] for o in out]
    print(f"  spread (highest minus lowest): model {100 * (max(ms) - min(ms)):.1f} points, list+tiers {100 * (max(ls) - min(ls)):.1f}, either {100 * (max(es) - min(es)):.1f}\n")
    return out
h = table('HATEFUL cases (share caught; higher is better):', lambda r: r['label_gold'] == 'hateful', 'hate')
nh = table('NON-hateful cases (share flagged; lower is better): neutral and positive statements, quotes, denouncing, negation:', lambda r: r['label_gold'] != 'hateful', 'nonhate')
# the same split by functionality family, for the groups that stand out
for fam, pat in [('slurs (slur_h)', lambda r: r['functionality'] == 'slur_h'), ('dehumanizing comparisons (derog_dehum_h)', lambda r: r['functionality'] == 'derog_dehum_h'), ('threats (threat_dir_h and threat_norm_h)', lambda r: r['functionality'].startswith('threat'))]:
    table(f'HATEFUL, {fam}:', lambda r, pat=pat: pat(r), 'hate')
# per-group non-hateful flagged by functionality that matters most (neutral and positive identity statements)
table('NON-hateful, neutral and positive identity statements only:', lambda r: r['functionality'] in ('ident_neutral_nh', 'ident_pos_nh'), 'nonhate')
