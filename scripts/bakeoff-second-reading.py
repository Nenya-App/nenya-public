#!/usr/bin/env python3
"""Does a second model reading close the per-group gaps? (docs/coach-screening-flow-scope.md, section 17.) Scores HateCheck and ETHOS with the hate model (cardiffnlp, int8 ONNX) and toxic-bert's heads
(Xenova int8 ONNX: identity_hate, insult, threat, toxic), then, for several ways of combining them with the SAME total budget (the share of ordinary cases flagged stays near 2%), reports the share of
hateful cases caught overall and per target group, and the ordinary cases flagged. Counts only; nothing is trained or tuned (a threshold is a cut on a score).
  python3 scripts/bakeoff-second-reading.py
"""
import csv, json, os, sys
import numpy as np
sys.argv = [sys.argv[0], 'cardiffnlp onnx']
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'bakeoff-models.py')).read().split('\nmain()')[0])
import onnxruntime as ort
from transformers import AutoTokenizer
rows = list(csv.DictReader(open(os.path.join(R, 'datasets/hatecheck/test_suite_cases.csv'), encoding='utf-8')))
eth = ethos()
texts = [r['test_case'] for r in rows] + [t for t, h, g in eth]
isH = np.array([r['label_gold'] == 'hateful' for r in rows] + [h for t, h, g in eth])
src = np.array(['hc'] * len(rows) + ['eth'] * len(eth))
group = np.array([r['target_ident'] for r in rows] + [''] * len(eth))
cardiff = load_models('cardiffnlp onnx')['cardiffnlp hate int8 (ONNX export)']
C = score(cardiff['run'], texts)[:, cardiff['heads']['hate']]
d = os.path.join(R, 'models/xenova-toxic-bert'); tok = AutoTokenizer.from_pretrained(d)
sess = ort.InferenceSession(os.path.join(d, 'onnx/model_int8.onnx'), providers=['CPUExecutionProvider'])
cfg = json.load(open(os.path.join(d, 'config.json'))); lab = {cfg['id2label'][str(i)]: i for i in range(len(cfg['id2label']))}
def tb(batch):
    enc = tok(batch, padding=True, truncation=True, max_length=128, return_tensors='np')
    return 1 / (1 + np.exp(-sess.run(None, {k.name: enc[k.name].astype('int64') for k in sess.get_inputs() if k.name in enc})[0]))
T = np.vstack([tb(texts[i:i + 32]) for i in range(0, len(texts), 32)])
H = {k: T[:, lab[k]] for k in ('identity_hate', 'insult', 'threat', 'toxic') if k in lab}
ord_ = ~isH
def cut(x, fpr): return float(np.quantile(x[ord_], 1 - fpr))
groups = sorted({g for g in group if g})
def report(name, flag):
    fp = flag[ord_].mean() * 100
    tot = flag[isH].mean() * 100
    hc = isH & (src == 'hc')
    pg = '  '.join(f"{g.split()[0][:6]} {flag[hc & (group == g)].mean() * 100:3.0f}" for g in groups)
    ev = isH & (src == 'eth')
    print(f"{name:52s} FP {fp:4.1f}%  caught {tot:4.1f}%  ETHOS {flag[ev].mean() * 100:4.1f}%  | {pg}")
    return [flag[hc & (group == g)].mean() for g in groups]
print('columns by group: ' + '  '.join(g.split()[0][:6] for g in groups) + '   (share of HateCheck hateful cases caught, per target group)\n')
base = C > cut(C, 0.02)
res = {}
res['cardiff alone, 2%'] = report('cardiff hate model alone, 2% budget', base)
res['tb identity alone'] = report('toxic-bert identity_hate alone, 2% budget', H['identity_hate'] > cut(H['identity_hate'], 0.02))
for k in ('insult', 'threat', 'toxic'): report(f'toxic-bert {k} alone, 2% budget', H[k] > cut(H[k], 0.02))
print()
for a, b in ((1.0, 1.0), (1.5, 0.5), (1.2, 0.8)):
    f = (C > cut(C, a / 100)) | (H['identity_hate'] > cut(H['identity_hate'], b / 100))
    res[f'union id {a}/{b}'] = report(f'cardiff {a}% OR identity_hate {b}% (budgets)', f)
f = (C > cut(C, 0.01)) | (H['identity_hate'] > cut(H['identity_hate'], 0.005)) | (H['threat'] > cut(H['threat'], 0.005))
res['union 3'] = report('cardiff 1% OR identity_hate 0.5% OR threat 0.5%', f)
f = (C > cut(C, 0.012)) | (H['identity_hate'] > cut(H['identity_hate'], 0.004)) | (H['threat'] > cut(H['threat'], 0.004))
report('cardiff 1.2% OR identity_hate 0.4% OR threat 0.4%', f)
spread = lambda v: (max(v) - min(v)) * 100
print('\nspread across groups (highest minus lowest, points): ' + '; '.join(f"{k}: {spread(v):.0f}" for k, v in res.items()))
print('lowest group for each: ' + '; '.join(f"{k}: {groups[int(np.argmin(v))]} {min(v) * 100:.0f}%" for k, v in res.items()))
