// The bake-off for selecting modules and cards by meaning (docs/small-model-detection-scope.md). Compares the phrase matcher (src/lib/coachModules.ts) and an embedder against the
// invented messages in src/lib/selectionEvalSet.ts, topic by topic, at several thresholds.
//   node scripts/eval-select.mts                         # the word-overlap stand-in (a floor, no model)
//   node scripts/eval-select.mts --embedder ./path.mts   # a module whose default export is an Embedder ({ embed(texts): Promise<number[][]> }), e.g. a candidate small model
//   node scripts/eval-select.mts --json out.json         # also write the numbers
// Measures, for each threshold: RECALL (a topic's own messages that select it within the top three), MISS-RATE of its other messages (the "nonMatches": same words, other topic),
// and CROSS (a message selecting some other topic than its own). A good model has high recall with low cross and false rates at one threshold.
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { lexicalEmbedder, rank, pick, topicVectors, type Embedder } from '../src/lib/semanticSelect.ts';
import { TOPICS } from '../src/lib/moduleDescriptions.ts';
import { SELECTION_EVAL } from '../src/lib/selectionEvalSet.ts';
import { selectModules, MODULE_IDS } from '../src/lib/coachModules.ts';

const args = process.argv.slice(2);
const flag = (n: string): string | undefined => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
const embedderPath = flag('--embedder');
const embedder: Embedder = embedderPath ? (await import(pathToFileURL(resolve(embedderPath)).href)).default : lexicalEmbedder;
const name = embedderPath ?? 'word-overlap stand-in (no model)';

const vectors = await topicVectors(embedder, TOPICS);
const items = SELECTION_EVAL.flatMap((e) => [
  ...e.matches.map((text) => ({ id: e.id, text, should: true })),
  ...e.nonMatches.map((text) => ({ id: e.id, text, should: false })),
]);
const msgVecs = await embedder.embed(items.map((i) => i.text));
const ranked = msgVecs.map((v) => rank(v, vectors));

const thresholds = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6];
const rows = thresholds.map((th) => {
  let hit = 0, total = 0, falseOwn = 0, nonTotal = 0, cross = 0, msgs = 0;
  items.forEach((it, i) => {
    const picked = pick(ranked[i], th, 3).map((c) => c.id);
    if (it.should) { total++; if (picked.includes(it.id)) hit++; msgs++; if (picked.some((p) => p !== it.id)) cross++; }
    else { nonTotal++; if (picked.includes(it.id)) falseOwn++; }
  });
  return { threshold: th, recall: hit / total, falseOwn: falseOwn / nonTotal, cross: cross / msgs };
});

// the phrase matcher, for the module topics it covers
const phraseIds = new Set(MODULE_IDS);
const phraseItems = items.filter((i) => phraseIds.has(i.id));
let pHit = 0, pTot = 0, pFalse = 0, pNon = 0;
for (const it of phraseItems) { const got = selectModules([it.text], 20); if (it.should) { pTot++; if (got.includes(it.id)) pHit++; } else { pNon++; if (got.includes(it.id)) pFalse++; } }

const pct = (x: number): string => `${(x * 100).toFixed(0)}%`.padStart(4);
console.log(`Embedder: ${name}\nTopics: ${TOPICS.length}   test messages: ${items.length} (${items.filter((i) => i.should).length} should match, ${items.filter((i) => !i.should).length} should not)\n`);
console.log('threshold  recall(top3)  false(own topic)  cross(other topics)');
for (const r of rows) console.log(`   ${r.threshold.toFixed(2)}      ${pct(r.recall)}          ${pct(r.falseOwn)}              ${pct(r.cross)}`);
console.log(`\nPhrase matcher, on the ${phraseIds.size} module topics it covers: recall ${pct(pHit / Math.max(1, pTot))}, false (own topic, non-matching messages) ${pct(pFalse / Math.max(1, pNon))}. (Cards are not covered by this matcher.)`);
// topics that nothing finds, at the middle threshold
const mid = 0.3;
const missing = SELECTION_EVAL.filter((e) => e.matches.every((t) => !pick(rank(msgVecs[items.findIndex((x) => x.text === t)], vectors), mid, 3).some((c) => c.id === e.id))).map((e) => e.id);
console.log(`Topics none of whose messages is found at ${mid}: ${missing.join(', ') || 'none'}`);
const out = flag('--json');
if (out) { writeFileSync(out, JSON.stringify({ embedder: name, rows, phrase: { recall: pHit / Math.max(1, pTot), false: pFalse / Math.max(1, pNon) }, missing }, null, 2)); console.log(`\nWrote ${out}`); }
