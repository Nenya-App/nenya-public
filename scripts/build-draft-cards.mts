// Collects the DRAFT learning cards (status "draft..." and not merged or on hold) from the private card folder into one JSON file, for TESTING on a dev site only. The file is not part of the build and never
// goes in the repository: the owner uploads it to the dev site's private store (key cards/drafts.json), and the site loads it only where COACH_CARD_DRAFTS=on (and the page was built with VITE_CARD_DRAFTS=on).
// Production sets neither, so no draft card is ever shown or even requested there. Each card must pass the same rules as an approved card; the ones that do not are listed and left out.
//   node scripts/build-draft-cards.mts "<private card folder>"          writes <folder>/_drafts.json
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parseCard } from '../src/lib/learningCards.ts';

const root = process.argv[2];
if (!root) { console.error('usage: build-draft-cards.mts <private card folder>'); process.exit(1); }
const out: unknown[] = [];
const left: string[] = [];
for (const sub of ['cleaned', 'history', 'thinking', 'ideas']) {
  const dir = join(root, sub);
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir).filter((x) => /^(prop|dehum|conn|ai|hist|idea|think)-\d\d-.*\.md$/.test(x)).sort()) {
    const r = parseCard(readFileSync(join(dir, f), 'utf8'));
    if (!r) { left.push(`${f}: not in the expected shape`); continue; }
    if (!/^draft/i.test(r.status) || /merged|hold/i.test(r.status)) continue;
    if (r.problems.length) { left.push(`${f}: ${r.problems.join('; ')}`); continue; }
    out.push(r.card);
  }
}
writeFileSync(join(root, '_drafts.json'), JSON.stringify(out));
console.log(`${out.length} draft cards written to ${join(root, '_drafts.json')}`);
for (const l of left) console.log('left out:', l);
