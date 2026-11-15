// The Learn layer (owner, 2026-11-15): the approved public wording, the private ICARUS part loaded from the store only for Learn, and the
// "What's the difference?" explainer beside the choice.
import { readFileSync } from 'node:fs';
import { LEARN_LAYER } from '../src/lib/stances.ts';
import { gradeLevel } from '../src/lib/readingLevel.ts';
import { ok } from './helpers.mts';

ok('the plainer line is in, the old one is gone', /calling someone a name often hides a need of our own/.test(LEARN_LAYER) && !/a label for a whole person/.test(LEARN_LAYER));
ok('no ICARUS framework text in the public Learn wording', !/ICARUS|bottleneck|I_energy|lPosition|Ω/.test(LEARN_LAYER));
const fn = readFileSync('netlify/functions/coach.mts', 'utf8');
ok('the ICARUS part comes from the private store key "learn-icarus", capped', /privateStore\(\)\.get\('learn-icarus', \{ type: 'text' \}\)/.test(fn) && /MAX_LEARN_EXTRA_CHARS = 2000/.test(fn));
ok('it is added only when Learn is chosen and allowed (the layer is null otherwise, for distress or sensitive topics too)', /stance\.layer \? \(stance\.stance === 'vilya' \? \[stance\.layer, await loadLearnExtra\(\)\]/.test(fn) && /layerText \? layerBlock\(layerText\) : ''/.test(fn));
const picker = readFileSync('src/coach/StancePicker.tsx', 'utf8');
ok('"What\'s the difference?" sits beside the choice, closed until opened, with a 44px target', /<details className="rounded-lg border border-border p-3 text-sm">/.test(picker) && /<summary className="flex min-h-11/.test(picker));
const texts = [...picker.matchAll(/text: '([^']+)'/g)].map((m) => m[1]);
const worst = texts.map((t) => ({ t, g: gradeLevel(t) })).sort((a, b) => b.g - a.g)[0];
ok('the explainer reads at grade 8 or below', !!worst && worst.g <= 8, worst ? `${worst.g.toFixed(1)}: ${worst.t}` : 'none');
ok('it says it is an AI, not therapy, and goes back to Reflect in a hard time', /It is an AI, not therapy/.test(picker) && /goes back to Reflect/.test(picker));
