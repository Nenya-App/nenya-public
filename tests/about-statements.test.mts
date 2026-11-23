// Chapter 6 of the About thesis (2026-11-22): the statement and position pages (Privacy Promise, Name, Where We Stand, Structure, Support Us, Contact Us, About the Designer).
// Checks that every reference number in the text has a list entry (and the reverse), that the claims the thesis removed are gone, that the old name NVC+ and the Harp's name
// are not on these pages, that the privacy page follows the code and the Terms, and that the reading level stays near grade 9. Terms of Use is not touched here.
import { readFileSync } from 'node:fs';
import { ok } from './helpers.mts';
import { gradeLevel } from '../src/lib/readingLevel.ts';

const DIR = 'src/app/components/about/';
const PAGES = {
  privacy: 'PrivacyPromise',
  name: 'NamePhilosophy',
  stand: 'WhereWeStand',
  structure: 'Structure',
  support: 'SupportUs',
  contact: 'ContactUs',
  founder: 'AboutTheFounder',
} as const;
const src: Record<string, string> = Object.fromEntries(Object.entries(PAGES).map(([id, f]) => [id, readFileSync(`${DIR}${f}.tsx`, 'utf8')]));
const visible = (s: string) => s.replace(/\/\/.*$/gm, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/<[^>]+>/g, ' ').replace(/&rsquo;|&apos;/g, "'").replace(/&ldquo;|&rdquo;/g, '"').replace(/\s+/g, ' ');
const norm = (s: string) => visible(s).toLowerCase();

// 1. References: every cited number has a list entry, every entry is cited, the numbers run 1..n, and the list carries no page numbers
for (const id of ['privacy', 'name', 'stand', 'structure', 'support', 'founder'] as const) {
  const s = src[id];
  const cited = new Set<number>();
  for (const m of s.matchAll(/<Cite pageId="(\w+)" n=\{\[([\d, ]+)\]\} \/>/g)) {
    if (m[1] !== id) ok(`${id}: a Cite uses the page's own id`, false, m[1]);
    m[2].split(',').forEach((x) => cited.add(Number(x.trim())));
  }
  const list = s.slice(s.indexOf('<ReferenceList'));
  const entries = [...list.matchAll(/\{ n: (\d+), text: '((?:[^'\\]|\\.)*)'/g)];
  const have = entries.map((e) => Number(e[1]));
  ok(`${id}: the page has a reference list with pageId "${id}"`, new RegExp(`<ReferenceList\\s+pageId="${id}"`).test(s) && entries.length > 0);
  ok(`${id}: the list numbers run 1 to ${have.length} in order`, have.every((n, i) => n === i + 1));
  ok(`${id}: every number cited in the text has a matching list entry`, [...cited].every((n) => have.includes(n)), [...cited].filter((n) => !have.includes(n)).join(','));
  ok(`${id}: every list entry is cited in the text`, have.every((n) => cited.has(n)), have.filter((n) => !cited.has(n)).join(','));
  ok(`${id}: no reference carries a page number (pp. or p. before digits)`, entries.every((e) => !/\bpp?\. ?\d/.test(e[2])), entries.filter((e) => /\bpp?\. ?\d/.test(e[2])).map((e) => e[1]).join(','));
  ok(`${id}: every list link is https and says whether it is free or may need payment`, [...list.matchAll(/href: '([^']+)'(?:, linkLabel: '([^']+)')?/g)].every((m) => /^https:\/\//.test(m[1]) && !!m[2]));
}
ok('the old footnote markers [1] and [2] and their note are gone from the Privacy Promise', !/<sup>\[\d\]<\/sup>/.test(src.privacy) && !/refer to aggregated research/.test(src.privacy));
ok('Contact Us makes no empirical claim, so it carries no reference list', !/ReferenceList/.test(src.contact));

// 2. Overclaims the thesis removed stay removed (checked page by page, and a few across all seven)
const gone: [string, string[]][] = [
  ['privacy', ['ruinous', 'foundational resilience', 'trillions in lost productivity', 'emotional and spiritual atrophy', 'economic cost', 'economic burden', 'controlled hive', 'all-seeing eye', 'fundamentally incompatible', 'making data extraction impossible', 'your growth in emotional literacy', 'being watched changes how people think', 'architectural allergy', 'your safety is our architecture', 'direct countermeasure', 'the onus is on the user', 'synthetic analysis', 'architectural integrity', 'proves']],
  ['name', ['thousands of lives', 'two trees that were dying', 'harp of móru', 'mellonamin', 'a structural fact rather than a policy', 'nothing persists between sessions', 'they exist for the duration of a session']],
  ['stand', ['none of this is a matter of two sides', 'matters of opinion', 'has been found to be', 'have been found to be', 'the government has apologized', 'no jewish person anywhere', 'no palestinian is responsible', 'a court has not yet ruled', 'the case will take years', 'international association of genocide scholars']],
  ['structure', ['nothing of commercial value', 'full creative and directional independence', 'thousands of independent artists', 'a leading 501', 'well-established model', 'sovereign direction', 'not a policy. we cannot share what we do not collect', 'handles financial administration']],
  ['support', ['leave you more present', 'full financial transparency', 'the research that grounds the work', 'public charity', 'go directly toward', '8 percent']],
  ['contact', ['never share your contact information with third parties', 'treated with confidentiality', 'support your journey']],
  ['founder', ['leave you more present', 'míriel', 'miriel', 'intentional leadership for social change', 'inseparable', 'letting it become wisdom', 'reaches across cultural and linguistic']],
];
for (const [id, phrases] of gone) {
  const t = norm(src[id]);
  const found = phrases.filter((p) => t.includes(p));
  ok(`${id}: the removed claims are gone`, found.length === 0, found.join(' | '));
}
for (const word of ['proven', 'profound', 'scientifically recognized', 'scientifically recognised', 'groundbreaking', 'cutting-edge']) {
  const bad = Object.keys(PAGES).filter((id) => new RegExp(`\\b${word}\\b`).test(norm(src[id])));
  ok(`no page in this chapter says "${word}"`, bad.length === 0, bad.join(','));
}
ok('the name NVC+ does not appear on any page of this chapter', Object.keys(PAGES).every((id) => !/NVC\s*\+|NVC plus/i.test(src[id])));
ok('the Harp is not named on any page of this chapter (owner note of 2026-11-08)', Object.keys(PAGES).every((id) => !/harp of m[oó]ru|mellonamin/i.test(src[id])));
ok('no page of this chapter carries a Tolkien page number', Object.keys(PAGES).every((id) => !/tolkien[^.]{0,80}\bpp?\. ?\d/i.test(src[id])));

// 3. Privacy Promise: what is kept must match the code and the Terms (docs/terms-accuracy-fixes-2026-11-22.md)
{
  const t = norm(src.privacy);
  ok('the privacy page says the sealed save is the one exception and that it lasts up to 24 hours', /"save and return later"/.test(t) && /up to 24 hours/.test(t));
  ok('it names the word-list note (written without the Remember switch) and the Remember switch separately', /word lists open or folded/.test(t) && /if you turn on "remember"/.test(t));
  ok('it says what "Forget me" and Emergency Exit leave (the sent-here note and the exit flag, until the tab closes)', /forget me/.test(t) && /already sent something/.test(t) && /until you close the tab/.test(t) && /one-word flag/.test(t));
  ok('it says a sent transcript is kept as the Terms describe, and names Sections 13 and 15', /keep it as the terms describe \(section 15\)/.test(t) && /\(section 13 of the terms\)/.test(t));
  ok('it names the Color API service and says the coach demo reads messages briefly in memory (no end-to-end claim)', /thecolorapi\.com/.test(t) && /not encryption all the way from your device/.test(t));
  ok('it does not claim Nenya measures growth, and it says it keeps daily totals', /we do not try to measure whether you grow/.test(t) && /daily totals of how often parts of the site are opened/.test(t));
  ok('it says nothing about spy-proofing: the hoped-for features are called ideas and untested', (t.match(/an idea:/g) ?? []).length >= 4 && /none of them exists yet/.test(t) && /we have not yet tested any of them with survivors of abuse/.test(t));
  ok('it says no study of reflection tools was found, and labels the link as our own reasoning', /we found no study of reflection tools in particular/.test(t) && /our own reasoning/.test(t));
}

// 4. Where We Stand: the corrections and labelled positions, the review date, and the optional extras that were not added
{
  const t = norm(src.stand);
  ok('the review date is 22 November 2026 and the page still exports it', /export const WHERE_WE_STAND_REVIEWED = '22 November 2026'/.test(src.stand) && /last reviewed \{where_we_stand_reviewed\}/.test(t));
  ok('the ICJ order of 26 January 2024 is described: plausible rights, real and imminent risk, protective steps, no decision on genocide', /on 26 january 2024 the court found that at least some of the rights south africa claims are plausible/.test(t) && /real and imminent risk/.test(t) && /did not decide whether genocide has happened/.test(t));
  ok('later provisional measures and the case status as of 22 September 2026 are stated', /28 march and 24 may 2024/.test(t) && /as of 22 september 2026 the case was still at the written stage/.test(t));
  ok('"a US president" apologised (Biden, October 2024), not "the government"', /in october 2024 president biden formally apologized/.test(t));
  ok('organizations "concluded" (they are not courts), and our agreement is labelled a position, not a ruling', /have concluded that israel/.test(t) && /these are organizations, not courts/.test(t) && /none of these bodies is a court/.test(t) && /that is our position\. it is not a court's ruling/.test(t));
  ok('the Jewish and the Palestinian sentences are labelled "our position" and say responsibility is personal', /being jewish does not make anyone responsible for what the israeli government does/.test(t) && /people are responsible for what they themselves do or order\. that is our position/.test(t) && /being palestinian does not make anyone responsible for what hamas does/.test(t));
  ok('Israel\'s government\'s rejections are stated (the opinion, the apartheid label, the genocide conclusions)', /israel's government rejects the opinion/.test(t) && /israel's government rejects the label/.test(t) && /israel's government rejects these conclusions/.test(t));
  ok('scholars on both sides of the genocide question are cited (Dannenbaum and Dill, Sultany, Polzin, Moses)', ['Dannenbaum T, Dill J', 'Sultany N', 'Polzin M', 'Moses A'].every((a) => src.stand.includes(a)));
  ok('the optional extras were not added: no scholars\' association resolution, no Shalev, no ICC, no new primary-statement links', !/genocide scholars/i.test(src.stand) && !/shalev/i.test(src.stand) && !/international criminal court|\bICC\b/.test(src.stand) && !/icj-cij\.org|ohchr\.org\/sites/.test(visible(src.stand)) && (src.stand.match(/<L href=/g) ?? []).length === 6);
  ok('the "Where you can learn more" links to the UN mirror are kept as they were', (src.stand.match(/un\.org\/unispal\/document\//g) ?? []).length === 2);
}

// 5. Facts only the owner can confirm are not stated
ok('Structure and Support Us do not state the 8 percent fee (the owner has not confirmed it applies to Nenya); the fee is said only as Fractured Atlas states it', !/8 percent|8%/.test(norm(src.structure) + norm(src.support)) && /administrative fee/.test(norm(src.support)));
ok('the designer page does not give the exact University of Minnesota degree title, and does not name Míriel', !/B\.S\./.test(src.founder) && /bachelor's degree from the university of minnesota/.test(norm(src.founder)));
ok('Contact Us names no email provider and does not promise "never" to share with third parties', /handled by our email provider/.test(norm(src.contact)) && !/never share/.test(norm(src.contact)));

// 6. Reading level: the whole text of each page stays near grade 9 or lower (legal names and titles raise a few sentences; the proposal's own average was about 6)
for (const [id, f] of Object.entries(PAGES)) {
  const text = visible(src[id].slice(0, src[id].includes('<ReferenceList') ? src[id].indexOf('<ReferenceList') : undefined))
    .replace(/\{[^}]*\}/g, ' ')
    .replace(/^.*?(?:export default function)/, '');
  const g = gradeLevel(text);
  ok(`${f}: reading grade ${g.toFixed(1)} is at most 11 (target about 9)`, g <= 11, g.toFixed(1));
}
