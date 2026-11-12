#!/usr/bin/env python3
"""Exports the cardiffnlp hate model to ONNX and quantizes it to int8 (docs/coach-screening-flow-scope.md, section 12). Files go to the research folder (models/cardiffnlp-onnx/), never the repository.
Needs the python packages onnx, onnxruntime and torch (the research folder has a venv: Nenya Research/tool/pyvenv). Prints sizes and a score comparison on invented sentences.
  "$HOME/Desktop/Nenya Research/tool/pyvenv/bin/python" scripts/export-onnx.py
"""
import os, sys, time
import numpy as np, torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

R = os.path.join(os.path.expanduser('~'), 'Desktop', 'Nenya Research')
src = os.path.join(R, 'models/cardiffnlp-hate-latest')
out = os.path.join(R, 'models/cardiffnlp-onnx'); os.makedirs(out, exist_ok=True)
tok = AutoTokenizer.from_pretrained(src)
model = AutoModelForSequenceClassification.from_pretrained(src).eval()
enc = tok(['an invented sentence for tracing', 'another one, a little longer than the first'], padding=True, return_tensors='pt')
fp32 = os.path.join(out, 'model.onnx')
torch.onnx.export(model, (enc['input_ids'], enc['attention_mask']), fp32, input_names=['input_ids', 'attention_mask'], output_names=['logits'],
                  dynamic_axes={'input_ids': {0: 'batch', 1: 'seq'}, 'attention_mask': {0: 'batch', 1: 'seq'}, 'logits': {0: 'batch'}}, opset_version=17, dynamo=False)
print('fp32 onnx', os.path.getsize(fp32) // 1_000_000, 'MB')
from onnxruntime.quantization import quantize_dynamic, QuantType
variants = {}
q1 = os.path.join(out, 'model_int8.onnx')
quantize_dynamic(fp32, q1, weight_type=QuantType.QInt8)
variants['int8 (matrix weights only)'] = q1
try:
    q2 = os.path.join(out, 'model_int8_gather.onnx')
    quantize_dynamic(fp32, q2, weight_type=QuantType.QInt8, op_types_to_quantize=['MatMul', 'Gather'], extra_options={'EnableSubgraph': True})
    variants['int8 (matrix weights and embeddings)'] = q2
except Exception as e:
    print('embedding quantization not available:', str(e)[:100])
import onnxruntime as ort
tests = ['I love everybody', 'Those people should all be killed.', 'My boss is such an asshole, he took credit for my work.', 'It is not okay to call anyone stupid.', 'I am so stupid, I forgot the deadline again.', 'Grief is awful and I miss my mother every day.']
with torch.no_grad():
    ref = torch.softmax(model(**tok(tests, padding=True, return_tensors='pt')).logits, -1).numpy()[:, 1]
print('reference (torch fp32) hate scores on invented sentences:', np.round(ref, 3))
for name, path in [('fp32 onnx', fp32)] + list(variants.items()):
    s = ort.InferenceSession(path, providers=['CPUExecutionProvider'])
    e = tok(tests, padding=True, return_tensors='np')
    lg = s.run(None, {'input_ids': e['input_ids'].astype('int64'), 'attention_mask': e['attention_mask'].astype('int64')})[0]
    p = np.exp(lg - lg.max(-1, keepdims=True)); p = (p / p.sum(-1, keepdims=True))[:, 1]
    print(f'{name}: {os.path.getsize(path) // 1_000_000} MB, scores {np.round(p, 3)}, max difference from torch {np.abs(p - ref).max():.3f}')
