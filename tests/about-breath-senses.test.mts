// The About thesis, chapters 1 and 2 (the Breathing Tool, Color and Feeling, and the Six Lenses): every number in the text has a list entry, the overclaims the audit
// removed stay gone, the NVC+ name is not on these pages, the Mirror of Galadriel is named in one place only, and the wording stays at an easy reading level.
import { readFileSync } from 'node:fs';
import { gradeLevel } from '../src/lib/readingLevel.ts';
import { ok } from './helpers.mts';

const dir = 'src/app/components/about/';
const pages = [
  { file: 'BreathingTool', id: 'breath' },
  { file: 'PowerOfColor', id: 'color' },
  { file: 'SixGateways', id: 'lenses' },
] as const;
const src: Record<string, string> = {};
for (const p of pages) src[p.file] = readFileSync(`${dir}${p.file}.tsx`, 'utf8');

for (const p of pages) {
  const s = src[p.file];
  const listed = new Set([...s.matchAll(/\{ n: (\d+), text: /g)].map((m) => Number(m[1])));
  const cited = new Set<number>();
  for (const m of s.matchAll(/<C n=\{\[([\d, ]+)\]\} \/>/g)) for (const n of m[1].split(',')) cited.add(Number(n.trim()));
  ok(`${p.file}: the list is numbered 1 to ${listed.size} with no gaps`, listed.size > 0 && [...listed].every((n, i) => n === i + 1));
  ok(`${p.file}: every number cited in the text has a matching list entry`, cited.size > 0 && [...cited].every((n) => listed.has(n)), `missing: ${[...cited].filter((n) => !listed.has(n)).join(',')}`);
  ok(`${p.file}: every list entry is cited somewhere on the page`, [...listed].every((n) => cited.has(n)), `uncited: ${[...listed].filter((n) => !cited.has(n)).join(',')}`);
  ok(`${p.file}: the citations use this page's own list (pageId "${p.id}")`, new RegExp(`pageId="${p.id}" n=\\{n\\}`).test(s) && new RegExp(`<ReferenceList pageId="${p.id}"`).test(s));
  ok(`${p.file}: no page numbers and no unconfirmed placeholders`, !/\bpp?\. ?\d/.test(s.slice(s.indexOf('const REFERENCES'), s.indexOf('const C = '))) && !/Owner to decide|As we engaged with users|based on user needs and feedback/i.test(s));
  ok(`${p.file}: the NVC+ name is not on the page`, !/NVC\+|NVC Plus|NVCplus/i.test(s));
  ok(`${p.file}: the overclaims the audit removed are gone`, !/\bproven\b|profound|scientifically recognized|powerful, coherent|key marker of|prepares the ground|millions of years|most dominant|evolutionary gift|Chromesthesia|survival superpower|research-backed|useless|meeting you where your neurology/i.test(s));
  // the page's own words, without the list, the tags and the citation numbers, read at about grade 9 or lower
  const text = s.slice(s.indexOf('const C = ')).replace(/<C n=\{\[[^\]]*\]\} \/>/g, '').replace(/<[^>]+>/g, ' ').replace(/&rsquo;|&lsquo;/g, "'").replace(/\{[^}]*\}/g, ' ');
  ok(`${p.file}: the wording reads at grade 9 or lower`, gradeLevel(text) <= 9, `grade ${gradeLevel(text).toFixed(1)}`);
}

const breath = src.BreathingTool, colour = src.PowerOfColor, lenses = src.SixGateways;
ok('Breathing Tool: the safety card says no clinician has reviewed the page, and that the check-first advice for heart conditions is a precaution that studies do not turn into proof of safety alone', /No clinician has reviewed this page/.test(breath) && /do not show that trying it alone is safe/.test(breath) && /general precaution/.test(breath));
ok('Breathing Tool: the pace is a design choice, slightly slower than most studies, and the limits are ours and unchecked', /six seconds in and six seconds out/.test(breath) && /this default is slightly slower/.test(breath) && /We chose\s+these limits ourselves, and no clinician has checked them/.test(breath));
ok('Breathing Tool: mixed results are stated (panic disorder, feeling more anxious)', /Not every result is positive/.test(breath) && /panic disorder/.test(breath) && /more anxious/.test(breath));
ok('Breathing Tool: the safety links to Courtney, the Cleveland Clinic and Zaccaro stay, each in a new tab', /PMC5721258/.test(breath) && /9443-pursed-lip-breathing/.test(breath) && /30245619/.test(breath));

ok('Color and Feeling: the page is titled "Color and Feeling" in the page, the menu and the address title', /<h1>Color and Feeling<\/h1>/.test(colour) && /title: 'Color and Feeling'/.test(readFileSync(`${dir}AboutMenu.tsx`, 'utf8')) && /'power-of-color': 'Color and Feeling'/.test(readFileSync('src/lib/aboutRoutes.ts', 'utf8')));
ok('Color and Feeling: Further Reading points to two free papers (Elliot 2015, Jonauskaite 2020), not the design-training site', /fpsyg\.2015\.00368/.test(colour) && /bb7fa6db/.test(colour) && !/interaction-design\.org/.test(colour) && /opens in a new tab/.test(colour));
ok('Color and Feeling: the old headings that contradicted the text are gone', !/The Universal Metaphor|Oldest Survival Language/.test(colour) && /Beyond Vision: Other Ways to Say It/.test(colour));
ok('Color and Feeling: the Present and Potential colors and the four metaphors are called our own design, not a tested measure', /are our own design\. They are not a tested measure/.test(colour));

ok('Six Lenses: the Sight subtitle is Vision and the Essence subtitle is Smell and taste; "Neuroscience:" is now "What research suggests:"', /subtitle: 'Vision'/.test(lenses) && /subtitle: 'Smell and taste'/.test(lenses) && !/Neuroscience:/.test(lenses) && (lenses.match(/What research suggests:/g) ?? []).length === 1);
ok('Six Lenses: the lenses are our own design, not a tested measure, and do not sort people into types', /are our own design\. They are not a tested measure, and they do not sort people into types/.test(lenses));
ok('Six Lenses: the accessibility note no longer calls Sight useless or Sound secondary', !/useless|secondary/.test(lenses) && /may be harder to use/.test(lenses));
ok('Six Lenses: the Pattern Lens names the Mirror of Galadriel, with the book and chapter, and quotes nothing', /Mirror of Galadriel/.test(lenses) && /<em>The Fellowship of the Ring<\/em> \(Book 2, chapter 7\)/.test(lenses) && !/[“"][^”"]{20,}[”"]\s*\(Tolkien/.test(lenses));
ok('Tolkien is named in one place across these three pages: the Pattern Lens text', (Object.values(src).join('\n').match(/Tolkien/g) ?? []).length === 1 && /Pattern Lens asks you to think[^]*Tolkien/.test(lenses));
ok('Six Lenses: what exists today still says five exchanges, an outside AI service and the 24-hour limit', /five-exchange conversation with an AI that runs on an outside service \(Venice AI\)/.test(lenses) && /24 hours at most/.test(lenses));
ok('Six Lenses: the Mirror of Galadriel text is in the page intro and covers all the Lenses (owner, 2026-11-22); the Pattern Lens points back to it', /The Lenses are inspired by the Mirror of Galadriel in J\. R\. R\. Tolkien&rsquo;s <em>The Fellowship of the Ring<\/em> \(Book 2, chapter 7\)/.test(lenses) && /We built the Lenses the same way/.test(lenses) && /Like all the Lenses, it is inspired by the Mirror of Galadriel \(see the top of this page\)/.test(lenses));
