// Generates public/mind-facts.txt (served at https://nenya.biz/mind-facts.txt) from the site's checked sources. See docs/mind-facts.md.
//
//   npm run mind-facts                      rebuild the file with the date already in public/mind-facts.meta.json
//   npm run mind-facts -- --as-of 2026-12-01   set that date (written to the meta file) and rebuild
//
// The date is never taken from the clock, so the committed file is reproducible. tests/mind-facts.test.mts fails if the file is stale.
import { readFileSync, writeFileSync } from 'node:fs';
import { buildMindFacts } from './lib/mindFacts.mts';

const META = 'public/mind-facts.meta.json';
const i = process.argv.indexOf('--as-of');
if (i > 0) {
  const d = process.argv[i + 1] ?? '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || Number.isNaN(Date.parse(d))) { console.error('--as-of needs a date like 2026-12-01'); process.exit(1); }
  writeFileSync(META, JSON.stringify({ asOf: d }, null, 2) + '\n');
}
const { asOf } = JSON.parse(readFileSync(META, 'utf8')) as { asOf: string };
const text = buildMindFacts(asOf);
writeFileSync('public/mind-facts.txt', text);
console.log(`public/mind-facts.txt written: ${text.length} characters, as of ${asOf}`);
