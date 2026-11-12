#!/usr/bin/env python3
"""Model bake-off for the screening model (docs/coach-screening-flow-scope.md, section 10).
Scores HateCheck and ETHOS with each candidate model, picks for each model the threshold where the share of ordinary (non-hateful) cases it flags is at most 2%, and reports COUNTS ONLY:
catch rate per HateCheck functionality and per ETHOS label, what the model catches that the list (results/private/verdicts-*.json, from `node scripts/eval-detect.mts --dump`) does not,
and the cost (file size, load time, warm latency, memory). No case text is printed or written. Models are in the research folder (models/); nothing is downloaded or trained.
  python3 scripts/bakeoff-models.py
"""
import csv, json, os, resource, sys, time
import numpy as np

HOME = os.path.expanduser('~')
R = os.path.join(HOME, 'Desktop', 'Nenya Research')
BAR = 0.02

def hatecheck():
    rows = list(csv.DictReader(open(os.path.join(R, 'datasets/hatecheck/test_suite_cases.csv'), encoding='utf-8')))
    return [(r['test_case'], r['label_gold'] == 'hateful', r['functionality']) for r in rows]

def ethos():
    out = []
    for line in open(os.path.join(R, 'datasets/ethos/Ethos_Dataset_Binary.csv'), encoding='utf-8').read().splitlines()[1:]:
        k = line.rfind(';'); v = float(line[k + 1:]) >= 0.5
        out.append((line[:k], v, 'hate' if v else 'no-hate'))
    return out

def ethos_labels():
    names = ['violence', 'directed', 'gender', 'race', 'national_origin', 'disability', 'religion', 'sexual_orientation']
    d = {}
    for line in open(os.path.join(R, 'datasets/ethos/Ethos_Dataset_Multi_Label.csv'), encoding='utf-8').read().splitlines()[1:]:
        p = line.split(';'); d[';'.join(p[:-8])] = dict(zip(names, [float(x) >= 0.5 for x in p[-8:]]))
    return d

def rss_mb():
    return resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / (1024 * 1024)

def sigmoid(x): return 1 / (1 + np.exp(-x))
def softmax(x): e = np.exp(x - x.max(axis=-1, keepdims=True)); return e / e.sum(axis=-1, keepdims=True)

def load_models(only=None):
    from transformers import AutoTokenizer
    models = {}
    if only and 'onnx' in only.lower() and 'cardiff' in only.lower():
        # the exported, quantized cardiffnlp model alone (scripts/export-onnx.py): memory and load time are then this model's own
        import onnxruntime as ort
        d = os.path.join(R, 'models/cardiffnlp-hate-latest'); f = os.path.join(R, 'models/cardiffnlp-onnx/model_int8.onnx')
        t0 = time.time(); tok2 = AutoTokenizer.from_pretrained(d); sess = ort.InferenceSession(f, providers=['CPUExecutionProvider']); load = time.time() - t0
        def run_c(texts):
            enc = tok2(texts, padding=True, truncation=True, max_length=128, return_tensors='np')
            return softmax(sess.run(None, {'input_ids': enc['input_ids'].astype('int64'), 'attention_mask': enc['attention_mask'].astype('int64')})[0])
        cfg = json.load(open(os.path.join(d, 'config.json'))); hate_idx = [i for i, l in cfg['id2label'].items() if 'NOT' not in l.upper()][0]
        models['cardiffnlp hate int8 (ONNX export)'] = dict(run=run_c, load=load, size=os.path.getsize(f), heads={'hate': int(hate_idx)}, kind='softmax')
        return models
    # 1. toxic-bert, ready-made int8 ONNX (onnxruntime)
    import onnxruntime as ort
    d = os.path.join(R, 'models/xenova-toxic-bert')
    t0 = time.time()
    tok = AutoTokenizer.from_pretrained(d)
    sess = ort.InferenceSession(os.path.join(d, 'onnx/model_int8.onnx'), providers=['CPUExecutionProvider'])
    load = time.time() - t0
    cfg = json.load(open(os.path.join(d, 'config.json')))
    labels = [cfg['id2label'][str(i)] for i in range(len(cfg['id2label']))]
    names = {l: i for i, l in enumerate(labels)}
    def run_tb(texts):
        enc = tok(texts, padding=True, truncation=True, max_length=128, return_tensors='np')
        feed = {i.name: enc[i.name].astype('int64') for i in sess.get_inputs() if i.name in enc}
        return sigmoid(sess.run(None, feed)[0])
    models['toxic-bert int8 (ONNX)'] = dict(run=run_tb, load=load, size=os.path.getsize(os.path.join(d, 'onnx/model_int8.onnx')), heads={'toxic': names.get('toxic', 0), 'insult': names.get('insult', 0), 'identity_hate': names.get('identity_hate', 0), 'threat': names.get('threat', 0)}, kind='sigmoid')
    # 2 and 3. cardiffnlp hate model, fp32 and dynamic int8 (torch)
    import torch
    from transformers import AutoModelForSequenceClassification
    torch.set_num_threads(max(1, os.cpu_count() or 1))
    d = os.path.join(R, 'models/cardiffnlp-hate-latest')
    t0 = time.time()
    tok2 = AutoTokenizer.from_pretrained(d)
    m = AutoModelForSequenceClassification.from_pretrained(d).eval()
    load = time.time() - t0
    cfg = json.load(open(os.path.join(d, 'config.json')))
    hate_idx = [i for i, l in cfg['id2label'].items() if 'NOT' not in l.upper()][0]
    def mk(model):
        def run(texts):
            enc = tok2(texts, padding=True, truncation=True, max_length=128, return_tensors='pt')
            with torch.no_grad(): return softmax(model(**enc).logits.numpy())
        return run
    models['cardiffnlp hate fp32 (torch)'] = dict(run=mk(m), load=load, size=os.path.getsize(os.path.join(d, 'pytorch_model.bin')), heads={'hate': int(hate_idx)}, kind='softmax')
    try:
        for eng in ('qnnpack', 'fbgemm'):
            if eng in torch.backends.quantized.supported_engines:
                torch.backends.quantized.engine = eng; break
        q = torch.quantization.quantize_dynamic(m, {torch.nn.Linear}, dtype=torch.qint8)
        tmp = os.path.join(R, 'models', '_q.pt'); torch.save(q.state_dict(), tmp); qsize = os.path.getsize(tmp); os.remove(tmp)
        models['cardiffnlp hate int8 (torch dynamic)'] = dict(run=mk(q), load=load, size=qsize, heads={'hate': int(hate_idx)}, kind='softmax')
    except Exception as e:
        print('int8 variant skipped:', str(e)[:80], file=sys.stderr)
    return models

def score(run, texts, bs=32):
    out = []
    for i in range(0, len(texts), bs): out.append(run(texts[i:i + bs]))
    return np.vstack(out)

def main():
    sets = {'hatecheck': hatecheck(), 'ethos': ethos()}
    verdicts = {k: json.load(open(os.path.join(R, f'results/private/verdicts-{k}.json'))) for k in sets}
    labels = ethos_labels()
    models = load_models(sys.argv[1] if len(sys.argv) > 1 else None)
    report = {}
    for mname, M in models.items():
        t0 = time.time()
        S = {k: score(M['run'], [t for t, _, _ in v]) for k, v in sets.items()}
        total = time.time() - t0
        sample = [t for t, _, _ in sets['ethos']][:40]
        lat = []
        for t in sample:
            a = time.time(); M['run']([t]); lat.append((time.time() - a) * 1000)
        print(f"\n=== {mname}: file {M['size'] / 1e6:.0f} MB, load {M['load']:.1f}s, warm latency median {np.median(lat):.0f} ms (p95 {np.percentile(lat, 95):.0f} ms), memory so far {rss_mb():.0f} MB, scored {sum(len(v) for v in sets.values())} cases in {total:.0f}s")
        for head, hi in M['heads'].items():
            nonhate = np.concatenate([S[k][[not h for _, h, _ in sets[k]], hi] for k in sets])
            thr = float(np.quantile(nonhate, 1 - BAR))  # flags at most 2% of the ordinary cases (HateCheck non-hateful and ETHOS non-hate together)
            flag = {k: S[k][:, hi] > thr for k in sets}
            print(f"  head '{head}': threshold {thr:.3f} (flags {np.mean(nonhate > thr) * 100:.1f}% of {len(nonhate)} ordinary cases)")
            for k in sets:
                hate = [h for _, h, _ in sets[k]]
                fl = flag[k]
                v = verdicts[k]
                list_acts = np.array([x['flagged'] or x['judgment'] or x['self'] or x['deferred'] for x in v])
                n_h = sum(hate); caught = int(sum(f and h for f, h in zip(fl, hate)))
                new = int(sum(f and h and not a for f, h, a in zip(fl, hate, list_acts)))
                list_h = int(sum(a and h for a, h in zip(list_acts, hate)))
                print(f"    {k}: hateful caught {caught}/{n_h} ({caught / n_h * 100:.1f}%); the list or its gentle tiers act on {list_h} ({list_h / n_h * 100:.1f}%); caught only by the model {new}; non-hateful flagged {int(sum(f and not h for f, h in zip(fl, hate)))}/{len(hate) - n_h}")
                if k == 'hatecheck':
                    by = {}
                    for f, (t, h, g), a in zip(fl, sets[k], list_acts):
                        b = by.setdefault(g, [0, 0, 0, h]); b[0] += 1; b[1] += int(f); b[2] += int(a)
                    row = [(g, b[1] / b[0] * 100, b[2] / b[0] * 100) for g, b in by.items() if b[3]]
                    print('      hateful functionalities, model % / list-and-tiers %: ' + '; '.join(f"{g.replace('_h', '')} {m:.0f}/{l:.0f}" for g, m, l in row))
                    row = [(g, b[1] / b[0] * 100) for g, b in by.items() if not b[3]]
                    print('      non-hateful functionalities flagged % (the 2% pool is all of them together): ' + '; '.join(f"{g.replace('_nh', '')} {m:.0f}" for g, m in row))
                else:
                    for lab in ['violence', 'gender', 'race', 'national_origin', 'disability', 'religion', 'sexual_orientation']:
                        idx = [i for i, (t, h, g) in enumerate(sets[k]) if h and labels.get(t, {}).get(lab)]
                        if idx:
                            print(f"      {lab}: model {sum(bool(fl[i]) for i in idx)}/{len(idx)}, list-and-tiers {sum(bool(list_acts[i]) for i in idx)}/{len(idx)}, model but not list {sum(bool(fl[i]) and not list_acts[i] for i in idx)}")
            report[f'{mname}|{head}'] = dict(threshold=thr)
    os.makedirs(os.path.join(R, 'results/public'), exist_ok=True)
    json.dump(report, open(os.path.join(R, 'results/public/bakeoff-thresholds-2026-11-12.json'), 'w'), indent=1)

main()
