// What the outer layers add, per model (docs/outer-layers-scope.md). Reads saved persona runs made with --layers (scripts/bakeoff-workers-ai.mts or scripts/eval-persona.mts) and compares them:
// how often the model's FIRST reply broke a check, how often the layers rescued it, which guards did the work, and which cases nothing caught. No model calls, no key.
//
//   node scripts/layers-report.mts <run.json> [<run.json> ...] [--out report.md]
// Each file is one row: the model and instructions come from the file. Put runs of different models side by side to read the 2x2 (same base, different tuning; same family, different size).
import { readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';
import { summarizeLayers, type LayerRecord } from '../src/lib/layerTrace.ts';

const args = process.argv.slice(2);
const out = args.includes('--out') ? args[args.indexOf('--out') + 1] : undefined;
const files = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--out');
if (!files.length) { console.error('Give one or more saved runs made with --layers.'); process.exit(2); }

const lines: string[] = ['# What the outer layers add', '', '| Run | Model | Instructions | Cases | First reply failed | Failed after layers | Rescued | Made worse | Nothing caught | Turns asked again |', '|---|---|---|---|---|---|---|---|---|---|'];
const detail: string[] = [];
for (const f of files) {
  const j = JSON.parse(readFileSync(f, 'utf8'));
  const rows = (j.results ?? []) as { id: string; outcome: string; layers?: LayerRecord; failures?: string[] }[];
  const s = summarizeLayers(rows.map((r) => ({ result: r, layers: r.layers })));
  if (!s.cases) { lines.push(`| ${basename(f)} | ${j.model ?? '?'} | ${j.instructions ?? '?'} | no layer records (run it with --layers) | | | | | | |`); continue; }
  lines.push(`| ${basename(f)} | ${j.model ?? '?'} | ${j.instructions ?? '?'} | ${s.cases} | ${s.rawFailed} | ${s.finalFailed} | ${s.rescued} | ${s.broken} | ${s.stillFailing} | ${s.askedAgain} |`);
  const rescued = rows.filter((r) => r.layers?.rawOutcome === 'fail' && r.outcome !== 'fail');
  const still = rows.filter((r) => r.layers?.rawOutcome === 'fail' && r.outcome === 'fail');
  const worse = rows.filter((r) => r.layers?.rawOutcome === 'pass' && r.outcome === 'fail');
  detail.push(`## ${basename(f)}`, '', `Guards that acted: ${Object.entries(s.byGuard).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k.replace(/^coach\./, '')} ×${v}`).join(', ') || 'none'}`, '');
  if (rescued.length) detail.push(`Rescued by the layers: ${rescued.map((r) => `${r.id} (${r.layers!.events.map((e) => e.replace(/^coach\./, '')).join(', ') || 'a repeat or a site answer'})`).join('; ')}`, '');
  if (still.length) detail.push(`**Nothing caught** (read these): ${still.map((r) => `${r.id} (${(r.failures ?? []).join(', ')})`).join('; ')}`, '');
  if (worse.length) detail.push(`**Made worse by the layers** (read these): ${worse.map((r) => `${r.id} (${(r.failures ?? []).join(', ')})`).join('; ')}`, '');
}
const text = [...lines, '', ...detail, '', 'The raw reply is the model\'s first answer, before any guard asks again or repairs it, scored with the same checks as the final reply. A case where a site answer or a crisis stop replaced the model has no raw reply and is not counted.'].join('\n') + '\n';
console.log(text);
if (out) writeFileSync(out, text);
