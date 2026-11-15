// "How Nenya removes identifiers" (owner, 2026-11-15): the tutorial runs the real scrubber in the browser, says truthfully what it catches and misses,
// and its technical table comes from descriptions kept beside the rules, so it cannot drift.
import { readFileSync, existsSync } from 'node:fs';
import { SCRUB_RULES_DOC, scrubPII } from '../src/lib/piiScrub.ts';
import { gradeLevel } from '../src/lib/readingLevel.ts';
import { ok } from './helpers.mts';

const lib = readFileSync('src/lib/piiScrub.ts', 'utf8');
const tags = new Set([...lib.matchAll(/tag: '([A-Z ]+)'/g)].map((m) => m[1]));
const documented = new Set(SCRUB_RULES_DOC.map((r) => r.tag));
ok('every placeholder the scrubber uses has a plain description (and none is invented)', [...tags].every((t) => documented.has(t)) && [...documented].every((t) => tags.has(t) || t === 'NAME'));
ok('the bare-name step (no telling phrase) is described too', SCRUB_RULES_DOC.some((r) => r.tag === 'NAME' && /lists of common given names/.test(r.how)));

const page = readFileSync('src/app/components/PIIScrubbingDemo.tsx', 'utf8');
ok('the page runs the real scrubber, and sends nothing', /import \{ SCRUB_RULES_DOC, describeScrub, scrubPII \} from '..\/..\/lib\/piiScrub'/.test(page) && /const result = scrubPII\(input\)/.test(page) && !/fetch\(|sendBeacon|XMLHttpRequest/.test(page));
ok('the old "planned pipeline" claims are gone', !/aspirational|building toward|privacy pipeline we're building|\[CITY\]|optional sign-in/i.test(page));
const example = /const EXAMPLE =\s*'([^']+)'/.exec(page)![1];
const out = scrubPII(example);
ok('the example really does what the page says: names, address, email and phone go; Portland stays', /\[NAME\]/.test(out.text) && /\[ADDRESS\]/.test(out.text) && /\[EMAIL\]/.test(out.text) && /\[PHONE\]/.test(out.text) && /Portland/.test(out.text) && /overwhelmed at work/.test(out.text));
ok('it says plainly that it can miss things and is not anonymous', /pattern matching, not understanding/.test(page) && /never calls the coach anonymous/.test(page));
ok('the technical details are one closed disclosure, and the tests it names exist', /<summary className="flex min-h-11[^>]*>Show the technical details<\/summary>/.test(page) && existsSync('tests/pii-names.test.mts') && existsSync('tests/safety-scrub-guard.test.mts'));
const plain = SCRUB_RULES_DOC.map((r) => r.catches).join('. ');
ok('the rule names read plainly', gradeLevel(plain) <= 8, gradeLevel(plain).toFixed(1));
