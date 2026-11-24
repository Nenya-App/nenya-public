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

// The privacy page says a conversation you choose to send us is kept "as the terms describe (Section 15, “Transcripts”)". Section 15 had its
// "Continuing on Venice" part renamed on 2026-11-24, which prompted a check that the number was still right: it is, because the sending of a
// signed transcript is described in Section 15's "Transcripts" part (with the choices, the keeping times and deleting it), and Section 5 and Section 14
// only point to or list other kinds of sending. The page names the part so the pointer cannot drift again.
{
  const transcripts = byNumber.get(15)!.subsections?.find((x) => x.heading === 'Transcripts');
  const body = (transcripts?.paragraphs ?? []).join(' ');
  ok('Section 15 has a "Transcripts" part that describes sending a signed transcript, what we may do with it and how long we keep it', !!transcripts && /If you choose to send a signed transcript to us/.test(body) && /how long we keep it \(30 days, 90 days, one year, or until you ask us to delete it\)/.test(body) && /keeps it in our own private storage until the time you chose/.test(body));
  ok('Section 14 does not hold the choices and keeping times for a sent conversation (it only mentions a transcript in passing), so it is not where that answer lives', !/If you choose to send a signed transcript/.test(textOf(14)) && !/keeps it in our own private storage until the time you chose/.test(textOf(14)));
  ok('the privacy page points to Section 15 “Transcripts” for a conversation you choose to send, and nowhere to the retired part', /as the terms describe \(Section 15, “Transcripts”\)/.test(src('src/app/components/about/PrivacyPromise.tsx')) && !/Continuing on Venice/.test(src('src/app/components/about/PrivacyPromise.tsx')));
}
