// Puts the owner-approved "make your own" guides into the site: reads docs/smithy/*.md and writes src/lib/smithyData.ts.
//   npm run smithy
// A guide marked approved that breaks a rule (src/lib/smithyGuide.ts) stops the build and says why; drafts are left out.
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseGuide, guideProblems, smithyDataSource, type Guide } from '../src/lib/smithyGuide.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const dir = join(root, 'docs/smithy');
const approved: Guide[] = [];
let drafts = 0;
for (const f of readdirSync(dir).filter((x) => x.endsWith('.md')).sort()) {
  let guide: Guide;
  try { guide = parseGuide(readFileSync(join(dir, f), 'utf8')); } catch (e) { console.error(`${f}: ${(e as Error).message}`); process.exit(1); }
  if (guide.status !== 'approved') { drafts++; continue; }
  const problems = guideProblems(guide, (p) => existsSync(join(root, p)));
  if (problems.length) { console.error(`${f} is marked approved but cannot ship: ${problems.join('; ')}`); process.exit(1); }
  approved.push(guide);
}
writeFileSync(join(root, 'src/lib/smithyData.ts'), smithyDataSource(approved));
console.log(`${approved.length} approved guide(s) written; ${drafts} draft(s) left out.`);
