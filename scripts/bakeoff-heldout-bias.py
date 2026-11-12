#!/usr/bin/env python3
"""Held-out and bias checks for the screening model (docs/coach-screening-flow-scope.md, section 13). Uses the exported int8 model (scripts/export-onnx.py).
1. HELD-OUT: the ordinary cases (HateCheck non-hateful and ETHOS non-hate) are split at random into two halves, 200 times; the threshold is set on one half so that 2% of it is flagged, and the other half
   shows the false-alarm rate a threshold really gets. The share of hateful cases caught at those thresholds is reported with it.
2. BIAS: invented neutral sentences about 27 identity groups (src/lib/biasScenes.json: 'I am X', 'my friend is X', 'X are people like everyone else', a report of unfair treatment, pride) and dialect, reclaimed-use and
   mention sentences. For each identity the share the model flags at the chosen threshold, so a group flagged more than the rest shows up. Counts and group names only (the sentences are invented and neutral).
  python3 scripts/bakeoff-heldout-bias.py
"""
import csv, json, os, sys
import numpy as np
sys.argv = [sys.argv[0], 'cardiffnlp onnx']
exec(open(os.path.join(os.path.dirname(__file__), 'bakeoff-models.py')).read().split('\nmain()')[0])
repo = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
M = load_models('cardiffnlp onnx')['cardiffnlp hate int8 (ONNX export)']
hi = M['heads']['hate']
sets = {'hatecheck': hatecheck(), 'ethos': ethos()}
S = {k: score(M['run'], [t for t, _, _ in v])[:, hi] for k, v in sets.items()}
ordinary = np.concatenate([S[k][[not h for _, h, _ in sets[k]]] for k in sets])
hateful = np.concatenate([S[k][[h for _, h, _ in sets[k]]] for k in sets])
rng = np.random.default_rng(20261112)
fps, tprs, thrs = [], [], []
for _ in range(200):
    idx = rng.permutation(len(ordinary)); a, b = idx[:len(idx) // 2], idx[len(idx) // 2:]
    thr = np.quantile(ordinary[a], 1 - BAR)
    fps.append(np.mean(ordinary[b] > thr)); tprs.append(np.mean(hateful > thr)); thrs.append(thr)
print(f"HELD-OUT (200 random splits of {len(ordinary)} ordinary cases; threshold set on one half to flag 2%):")
print(f"  false-alarm rate on the other half: median {np.median(fps) * 100:.1f}%, 5th to 95th percentile {np.percentile(fps, 5) * 100:.1f}% to {np.percentile(fps, 95) * 100:.1f}%, worst {max(fps) * 100:.1f}%")
print(f"  share of {len(hateful)} hateful cases caught at those thresholds: median {np.median(tprs) * 100:.1f}%, range {min(tprs) * 100:.1f}% to {max(tprs) * 100:.1f}%; threshold median {np.median(thrs):.3f} (range {min(thrs):.3f} to {max(thrs):.3f})")
thr = float(np.quantile(ordinary, 1 - BAR))
print(f"  chosen threshold on all ordinary cases: {thr:.3f}")
for lvl in (0.01, 0.02, 0.05):
    t = float(np.quantile(ordinary, 1 - lvl)); print(f"  at {lvl * 100:.0f}% false alarms: threshold {t:.3f}, hateful caught {np.mean(hateful > t) * 100:.1f}%")
sc = json.load(open(os.path.join(repo, 'src/lib/biasScenes.json')))
P = M['run']([x['text'] for x in sc[:1]])  # warm
scores = np.concatenate([M['run']([x['text'] for x in sc[i:i + 32]])[:, hi] for i in range(0, len(sc), 32)])
print(f"\nBIAS: {len(sc)} invented neutral sentences at threshold {thr:.3f}")
byg = {}
for x, s in zip(sc, scores): byg.setdefault(x['group'], []).append((x['kind'], s))
idg = {g: v for g, v in byg.items() if not g.startswith(('dialect', 'reclaimed', 'reported'))}
rows = sorted(((g, sum(s > thr for _, s in v), len(v), float(np.mean([s for _, s in v])), float(np.max([s for _, s in v]))) for g, v in idg.items()), key=lambda r: -r[3])
print('  identity group: flagged / sentences, mean score, max score (sorted by mean)')
for g, f, n, m, mx in rows: print(f"    {g:18s} {f}/{n}  mean {m:.3f}  max {mx:.3f}")
allm = [m for _, _, _, m, _ in rows]
print(f"  mean score across groups: median {np.median(allm):.3f}; highest {max(allm):.3f}; flagged in total {sum(r[1] for r in rows)}/{sum(r[2] for r in rows)}")
for kind in ['self', 'friend', 'plural', 'report', 'pride']:
    v = [s for g, vv in idg.items() for k, s in vv if k == kind]; print(f"  sentence type '{kind}': flagged {sum(s > thr for s in v)}/{len(v)}, mean {np.mean(v):.3f}")
for g in ['dialect-aave', 'dialect-standard', 'dialect-esl', 'dialect-scots', 'reclaimed-self', 'reported-slur-mention']:
    v = [s for _, s in byg.get(g, [])]
    if v: print(f"  {g}: flagged {sum(s > thr for s in v)}/{len(v)}, mean {np.mean(v):.3f}, max {np.max(v):.3f}")
