// Uploads the cleaned private list to the site's private storage (run on your own computer; the file never goes in the repository).
//   NETLIFY_SITE_ID=... NETLIFY_API_TOKEN=... node scripts/upload-private-list.mts <path-to-slurs.en.csv> [store-name] [--decisions <path-to-review-decisions.csv>]
// The decisions file (the reviewers' drop, slur, model and judgment decisions by term) is uploaded beside the list and applied when the list is loaded; with it missing, the list runs unreviewed.
// Use the same store name as the site (COACH_STORE_NAME, or the default). Staging and production keep separate stores: upload to each on purpose.
import { readFileSync } from 'node:fs';
import { getStore } from '@netlify/blobs';
import { createHash } from 'node:crypto';
import { readLexicon } from '../src/lib/lexiconLoader.ts';
import { storeNameFrom } from '../src/lib/originHosts.ts';
import { DECISIONS_KEY, LEXICON_KEY } from '../src/lib/lexiconStore.ts';
import { applyDecisions, parseDecisions } from '../src/lib/lexiconDecisions.ts';

const argv = process.argv.slice(2);
const di = argv.indexOf('--decisions');
const decisionsFile = di >= 0 ? argv[di + 1] : undefined;
if (di >= 0) argv.splice(di, 2);
const [file, storeName] = argv;
if (!file || !process.env.NETLIFY_SITE_ID || !process.env.NETLIFY_API_TOKEN) { console.error('needs a file, NETLIFY_SITE_ID and NETLIFY_API_TOKEN'); process.exit(1); }
const csv = readFileSync(file, 'utf8');
const { report } = readLexicon(csv);
if (report.problems.length) { console.error('The file has problems: ' + report.problems.join('; ')); process.exit(1); }
const store = getStore({ name: storeNameFrom(storeName ?? process.env.COACH_STORE_NAME), siteID: process.env.NETLIFY_SITE_ID, token: process.env.NETLIFY_API_TOKEN });
const version = createHash('sha256').update(csv).digest('hex').slice(0, 12);
let decisionsText = '';
if (decisionsFile) {
  decisionsText = readFileSync(decisionsFile, 'utf8');
  const parsed = parseDecisions(decisionsText);
  if (parsed.problems.length) { console.error('The decisions file has problems: ' + parsed.problems.join('; ')); process.exit(1); }
  const c = applyDecisions(readLexicon(csv).rows, parsed.decisions).counts;
  console.log(`decisions: ${parsed.decisions.size} terms (dropped ${c.dropped} rows, slur ${c.slur}, model ${c.model}, judgment ${c.judgment})`);
}
await store.set(LEXICON_KEY, csv);
if (decisionsText) { await store.set(DECISIONS_KEY, decisionsText); await store.set(`lexicon/en/decisions-${createHash('sha256').update(decisionsText).digest('hex').slice(0, 12)}`, decisionsText); }
else console.log('No decisions file given: the list will run as prepared, unreviewed.');
await store.set(`lexicon/en/${version}`, csv);
console.log(`uploaded ${report.kept} rows (version ${version}); switched off: ${report.switchedOff.length}; context rows without cues: ${report.contextWithoutCues}`);
