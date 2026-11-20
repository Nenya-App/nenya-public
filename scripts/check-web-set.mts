// Checks a private module set that carries the connection web's modules (joined modules and question kinds). Nothing is written.
//   node scripts/check-web-set.mts --set coach-modules-web-v0.4-DRAFT.json
// Prints sizes and every problem; exits 1 if there is one. The set stays outside the repository.
import { readFileSync } from 'node:fs';
import { JOIN_IDS, QUESTION_IDS } from '../src/lib/nvcWebData.ts';
import { webSetProblems } from '../src/lib/nvcWeb.ts';

const i = process.argv.indexOf('--set');
const path = i > 0 ? process.argv[i + 1] : undefined;
if (!path) { console.error('usage: node scripts/check-web-set.mts --set FILE'); process.exit(2); }
const set = JSON.parse(readFileSync(path, 'utf8')) as { core: string; modules: Record<string, string> };
console.log(`core ${set.core.length} chars; ${Object.keys(set.modules).length} modules`);
for (const id of [...JOIN_IDS, ...QUESTION_IDS]) console.log(String(set.modules[id]?.length ?? 0).padStart(6), id);
const problems = webSetProblems(set);
if (problems.length) { console.error('\nPROBLEMS:\n- ' + problems.join('\n- ')); process.exit(1); }
console.log('\nno problems');
