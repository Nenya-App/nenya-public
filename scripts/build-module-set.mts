// Builds the document the coach reads from the private store (key "modules") out of the private drafts.
//   node scripts/build-module-set.mts --lens lens-draft.json --moves moves-draft.json --out combined.json
// The drafts and the output stay outside the repository. This prints sizes and refuses to write a set that has
// a module without a trigger, a trigger without a module, or a worst case over the notes cap.
import { readFileSync, writeFileSync } from 'node:fs';
import { buildCombinedSet, NOTES_CAP } from '../src/lib/moduleSet.ts';

const arg = (name: string) => {
  const i = process.argv.indexOf('--' + name);
  return i > 0 ? process.argv[i + 1] : undefined;
};
const lensPath = arg('lens'), movesPath = arg('moves'), out = arg('out');
if (!lensPath || !movesPath || !out) {
  console.error('usage: node scripts/build-module-set.mts --lens FILE --moves FILE --out FILE');
  process.exit(2);
}
const { set, report } = buildCombinedSet(JSON.parse(readFileSync(lensPath, 'utf8')), JSON.parse(readFileSync(movesPath, 'utf8')));
console.log(`core ${report.coreChars} chars; ${Object.keys(set.modules).length} modules; worst case for one reply ${report.worstCaseChars} of ${NOTES_CAP}`);
for (const [id, n] of Object.entries(report.perModule).sort((a, b) => b[1] - a[1])) console.log(String(n).padStart(6), id);
if (report.problems.length) {
  console.error('\nNOT WRITTEN:\n- ' + report.problems.join('\n- '));
  process.exit(1);
}
writeFileSync(out, JSON.stringify(set, null, 2));
console.log('\nwrote ' + out);
