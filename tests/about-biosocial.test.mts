// The BioSocialDesign About page after the thesis rewrite (Chapter 4a, 2026-11-22): every cited number has a list entry and every entry is cited,
// the overclaims the audit removed stay gone, the name NVC+ is not on the page, the statements about the product match the code, and the
// wording stays plain. The page is read as source text, as the other About tests do.
import { readFileSync } from 'node:fs';
import { gradeLevel } from '../src/lib/readingLevel.ts';
import { BIOSOCIAL_FURTHER_READING, BIOSOCIAL_REFERENCES } from '../src/app/components/about/biosocialReferences.ts';
import { ok } from './helpers.mts';

const page = readFileSync('src/app/components/about/BioSocialDesign.tsx', 'utf8');
const refsSrc = readFileSync('src/app/components/about/biosocialReferences.ts', 'utf8');
const text = page + '\n' + refsSrc;

// ---- citations ----
const cited = new Set<number>();
let citeTags = 0;
for (const m of page.matchAll(/<Cite pageId="biosocial" n=\{(\[[^\]]*\]|\d+)\} \/>/g)) {
  citeTags++;
  for (const k of m[1].replace(/[[\]]/g, '').split(',').map((x) => Number(x.trim()))) cited.add(k);
}
ok('every <Cite> on the page names this page\'s list and has numbers', citeTags > 40 && (page.match(/<Cite /g) ?? []).length === citeTags);
const listed = BIOSOCIAL_REFERENCES.map((r) => r.n);
ok('the reference numbers run 1 to 62 with no gaps or repeats', listed.length === 62 && listed.every((n, i) => n === i + 1));
ok('every cited number has a matching list entry', [...cited].every((n) => listed.includes(n)), [...cited].filter((n) => !listed.includes(n)).join(','));
ok('every list entry is cited on the page', listed.every((n) => cited.has(n)), listed.filter((n) => !cited.has(n)).join(','));
ok('the page prints the list once, under its own page id', (page.match(/<ReferenceList /g) ?? []).length === 1 && /<ReferenceList pageId="biosocial" items=\{BIOSOCIAL_REFERENCES\}/.test(page));
ok('each entry has authors with a year, a free or publisher link, and no page numbers', BIOSOCIAL_REFERENCES.every((r) => /\(\d{4}\)\./.test(r.text) && /^https:\/\//.test(r.href ?? '') && !/\bpp?\. ?\d/.test(r.text)));
ok('a link that is not a free copy says it may need payment', BIOSOCIAL_REFERENCES.every((r) => r.linkLabel === 'Free full text' || /may need payment|Publisher page/.test(r.linkLabel ?? '')) && BIOSOCIAL_REFERENCES.filter((r) => /may need payment/.test(r.linkLabel ?? '')).length >= 15);
ok('the two further-reading papers are listed apart and are not cited', BIOSOCIAL_FURTHER_READING.length === 2 && /Further reading/.test(page) && /may need payment/.test(page));

// ---- what was removed stays removed ----
const BANNED: [string, RegExp][] = [
  ['"proven"', /\bproven\b/i], ['"profound"', /\bprofound/i], ['"scientifically recognized"', /scientifically recogni[sz]ed/i],
  ['the invented percentages', /30-50%|20-35%|15-25%|\b90%/], ['"neuroplastic intervention"', /neuroplastic intervention/i],
  ['"the primary driver"', /primary driver/i], ['"neuroscience is unambiguous"', /unambiguous/i], ['"chronic regulatory deficit"', /regulatory deficit/i],
  ['"modern capitalism"', /capitalism/i], ['"severed"', /severed/i], ['"Rapid Carbon De-escalation"', /de-escalation/i], ['"the research is clear"', /research is clear/i],
  ['"documented links"', /documented links/i], ['"Socratic methodology"', /Socratic methodology/i], ['"harvesting"', /harvesting/i],
  ['"Engagement-optimized cloud AI" column', /Engagement-optimi[sz]ed/i], ['"typical products"', /typical products/i], ['"Nenya stores no messages"', /stores no messages/i],
  ['the "edge" promise', /\bthe edge\b|edge computing|on the Edge/i], ['"collapse" and "devastation"', /ecological collapse|Ecological Devastation/i],
  ['the unsourced Google Doc analysis', /docs\.google\.com|AI Environmental Impact Analysis/i], ['"NPU"', /\bNPU\b/],
  ['"Vagal tone improves"', /vagal tone improves/i], ['the check-mark list of results', /✓/],
];
for (const [name, re] of BANNED) ok(`the page no longer has ${name}`, !re.test(text));
ok('the name NVC+ does not appear on the page (any spacing)', !/NVC ?\+|NVC-plus|NVCplus/i.test(text));
ok('the page says "our approach" where it used to name the method', /our approach/.test(page));
ok('the Lenses are named as Sight, Sound, Touch, Essence, Movement and Pattern, and "Insight" is not used as a lens', /Sight, Sound, Touch, Essence, Movement and Pattern/.test(page) && !/Insight/.test(page));

// ---- what the page must say plainly ----
const MUST: [string, RegExp][] = [
  ['it is our idea, not a finding', /It is our idea, not a finding/], ['nobody has reviewed the page or the idea', /No scientist or clinician has reviewed this page or the idea/],
  ['no study and no user testing (owner confirmed 2026-11-22)', /No study of Nenya has been done, and it has had no user testing, so its effects on people, spending or the planet have not been measured/], ['no study of the whole chain was found', /we did not find a study of the whole chain/],
  ['polyvagal theory is contested and not relied on', /contested, so we do not rely on it/], ['the coach is hosted, not on the device', /runs on servers, not on your device/],
  ['on-device is a privacy goal, not an energy saving', /privacy goal, not an energy saving/], ['the energy figure is labelled a rough estimate with wide uncertainty', /rough estimate[^.]*0\.06 to 0\.6 watt-hours, with wide uncertainty/],
  ['no figures for spending or carbon are invented', /We will not invent them/], ['the hopes are labelled as hopes', /These are hopes\. No study of Nenya has been done, so none has been measured/],
  ['the coach is not studied', /This coach has not been studied/], ['the Lens set is our own design', /our own design, not a tested list/],
  ['the page title is Connection, Spending and the Planet (owner, 2026-11-22)', /Connection, Spending and the Planet/], ['a sent transcript is mentioned in the data row', /transcript, report or message you choose to send to us/],
];
for (const [name, re] of MUST) ok(`the page says: ${name}`, re.test(page));
ok('the provider is named through the shared helper, not typed in', /COACH_SERVICE\.name/.test(page) && !/Venice/.test(page));
ok('the About menu label follows the new page title', /title: 'Connection, Spending and the Planet'/.test(readFileSync('src/app/components/about/AboutMenu.tsx', 'utf8')));

// ---- the product statements, against the code ----
const panelLogo = readFileSync('src/app/components/PanelLogo.tsx', 'utf8');
ok('"Select the logo to open the breathing settings": the page logo is a button that opens the breathing panel', /<button/.test(panelLogo) && /onClick=\{toggleBreathingPanel\}/.test(panelLogo) && /PanelLogo size=/.test(page));
ok('"six seconds in and six out" is the default pace', /ih: 6000, hi: 0, ex: 6000, ho: 0, lb: '6·6', desc: 'Steady[^']*\(the default\)'/.test(readFileSync('src/lib/breathingPresets.ts', 'utf8')));
ok('the page no longer claims the logo is synchronised to the chosen pace or stays subtle in both colour modes', !/synchroni[sz]ed to the breathing pace/i.test(page) && !/light and dark mode/i.test(page) && !/light or dark/i.test(page));
const app = readFileSync('src/app/App.tsx', 'utf8');
ok('"a Lens first": the coach cannot be opened from the menu until a Lens is done (it sends you to the Lens page)', /if \(screen === 'session' && gatewayData\.length === 0\) \{\s*navigateTo\('home'\)/.test(app));
const coach = readFileSync('netlify/functions/coach.mts', 'utf8');
ok('"capped at five exchanges" matches the server cap', /const MAX_TURNS = 5;/.test(coach));
ok('"use your own words / say what feeling or need it hears / at most one question / not tell you what to do" match the coach instructions', /Use the person's own words/.test(coach) && /name the feeling or need underneath/.test(coach) && /Ask at most one question/.test(coach) && /do not tell the person what they must do/.test(coach));

// ---- reading level (AAA 3.1.5): the text nodes of the page, read together, near grade 9 or lower ----
const nodes = [...page.replace(/<Cite[^>]*\/>/g, '').replace(/\{COACH_SERVICE\.name\}/g, 'Venice AI').matchAll(/>([^<>{}]{40,})</g)].map((m) => m[1].replace(/\s+/g, ' ').trim()).filter((t) => t.split(' ').length >= 8);
const g = gradeLevel(nodes.join(' '));
ok(`the page's paragraphs, read together, are at grade 9 or below (${g.toFixed(1)})`, nodes.length > 30 && g <= 9);
const worst = nodes.map((t) => ({ t, g: gradeLevel(t) })).sort((a, b) => b.g - a.g)[0];
ok(`no paragraph is above grade 11 (worst ${worst.g.toFixed(1)})`, worst.g <= 11);

// ---- links on the page are real controls ----
ok('the two link cards are real buttons with a visible name and an "opens a separate page" note', (page.match(/<button type="button" onClick=\{\(\) => setCurrentSubSection/g) ?? []).length === 2 && (page.match(/This opens a separate page\./g) ?? []).length === 2);
ok('the page keeps a scrolling root', /size-full overflow-auto scroll-container/.test(page));
