// The Name page argument of 2026-11-23 (passage A, approved by the owner): no seeing-stones, no Feanor, sources numbered 1 to 15.
import { readFileSync } from 'node:fs';
import { ok } from './helpers.mts';
import { gradeLevel } from '../src/lib/readingLevel.ts';

const page = readFileSync('src/app/components/about/NamePhilosophy.tsx', 'utf8');
const html = readFileSync('public/about-nenya.html', 'utf8');
const lower = (s: string) => s.toLowerCase();

for (const word of ['palantír', 'palantíri', 'seeing-stone', 'fëanor', 'silmaril', 'thousands of lives', 'same line of craft', 'one craft, two ways']) {
  ok(`Name page: "${word}" is gone`, !lower(page).includes(word));
  ok(`static page: "${word}" is gone`, !lower(html).includes(word));
}

for (const s of [
  'Why the difference matters',
  'work <strong className="text-nenya-gold-text dark:text-nenya-gold-light">on</strong> the person using it',
  'Some tools are built to watch.',
  'We call these tools that master.',
  'The evidence is mixed',
  'No study has tested a reflection tool',
  'So what follows is our position, not a finding.',
  'keep as little as it can, say what it keeps, and publish its code',
  'Our Privacy Promise page lists where it does not yet.',
]) ok(`Name page has: ${s.slice(0, 50)}`, page.includes(s));
ok('Name page: the "what happened" paragraph about the old first paragraph is gone', !page.includes('Does what you have made'));
ok('static page: links to the Name page and keeps the closing line', html.includes('https://nenya.biz/about/name-philosophy') && html.includes('A space for reflection should attend to a person, not extract from them.'));
ok('static page: still says "no claim of any connection"', /no claim of any connection/.test(html));

const cited = new Set<number>();
for (const m of page.matchAll(/<Cite pageId="name" n=\{\[([^\]]*)\]\} \/>/g)) m[1].split(',').forEach((x) => cited.add(Number(x.trim())));
const listed = [...page.matchAll(/\{ n: (\d+), text:/g)].map((m) => Number(m[1]));
ok('15 list entries, numbered 1 to 15 in order', listed.length === 15 && listed.every((n, i) => n === i + 1));
ok('every Cite number has a list entry', [...cited].every((n) => listed.includes(n)));
ok('every list entry is cited', listed.every((n) => cited.has(n)));
ok('no page numbers in the list', !/\bpp?\. ?\d/.test(page.slice(page.indexOf('<ReferenceList'))));

ok('Name page: the standing non-affiliation line is still shown', page.includes('{NON_AFFILIATION}'));

const text = (page.slice(page.indexOf('name-argument'), page.indexOf('name-question')))
  .replace(/<Cite[^>]*\/>/g, '').replace(/<[^>]+>/g, ' ').replace(/&rsquo;/g, "'").replace(/\s+/g, ' ');
ok(`new text reads at about grade 9 or lower (${gradeLevel(text).toFixed(1)})`, gradeLevel(text) <= 9);
