// Every "Section N" reference, in the Terms and on the rest of the site, points at the right section.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { LEGAL_PARTS } from '../src/lib/legalDocument.ts';
import { ok } from './helpers.mts';
const src = (f: string) => readFileSync(join(fileURLToPath(new URL('..', import.meta.url)), f), 'utf8');
const sections = LEGAL_PARTS.flatMap((p) => p.sections);
const byNumber = new Map(sections.map((s) => [s.number, s]));
const textOf = (n: number) => { const s = byNumber.get(n)!; return [s.heading, ...s.paragraphs, ...(s.bullets ?? []), ...(s.after ?? []), ...(s.subsections ?? []).flatMap((x) => [x.heading, ...x.paragraphs])].join(' '); };

ok('the sections are numbered 1 to 21 without gaps', sections.map((s) => s.number).join() === Array.from({ length: 21 }, (_, i) => i + 1).join());
const all = sections.map((s) => textOf(s.number)).join(' ');
const internal = [...all.matchAll(/Sections? (\d+)(?: and (\d+))?/g)].flatMap((m) => [m[1], m[2]].filter(Boolean).map(Number));
ok('every reference inside the Terms names a section that exists', internal.length > 10 && internal.every((n) => byNumber.has(n)));

// What each kind of reference is about, and the words its section must contain.
const topics: [RegExp, number, RegExp][] = [
  [/age|13/, 2, /aged 13/],
  [/crisis/, 4, /988/],
  [/coach demo|safety checks/, 15, /The coach demo/],
  [/form|submissions/, 14, /The report form/],
  [/visit|host/, 13, /visit statistics/],
  [/device|Remember/, 16, /What stays on your device/],
  [/email us|Contact/, 21, /info@nenya\.biz/],
];
for (const [, n, must] of topics) ok(`Section ${n} holds what references to it expect`, must.test(textOf(n)));

const about = src('src/lib/aboutNenya.ts');
const labels = [...about.matchAll(/'Terms, Section (\d+)(?:: ([^']+))?'/g)];
ok('the site’s answers link only to sections that exist', labels.length > 5 && labels.every((m) => byNumber.has(Number(m[1]))));
ok('a link that names a section uses that section’s own heading', labels.filter((m) => m[2]).every((m) => byNumber.get(Number(m[1]))!.heading.toLowerCase() === m[2].toLowerCase()));
ok('the host’s logs and visit totals are referred to Section 13', /Section 13 of the terms describes them/.test(src('src/app/components/about/Structure.tsx')) && /\(Section 13 of the terms\)/.test(src('src/app/components/about/PrivacyPromise.tsx')));
