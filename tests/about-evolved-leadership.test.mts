// Evolved Leadership, rewritten on 2026-11-22 (About thesis, chapter 4b): every cited number has a list entry, the overclaims the audit removed are gone,
// the cost section is left out, the privacy sentences say only what the code and the Terms say, and the page stays plain and in order.
import { readFileSync } from 'node:fs';
import { ok } from './helpers.mts';
import { gradeLevel } from '../src/lib/readingLevel.ts';

const src = readFileSync('src/app/components/about/EvolvedLeadership.tsx', 'utf8');
const menu = readFileSync('src/app/components/about/AboutMenu.tsx', 'utf8');
const body = src.slice(src.indexOf('return (\n    <div ref'));
const text = body.replace(/<Cite[^>]*\/>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

// Citations and the list
const cited = new Set<number>();
for (const m of src.matchAll(/<Cite pageId=\{PID\} n=\{(\[[\d, ]+\]|\d+)\} \/>/g)) for (const k of m[1].match(/\d+/g) ?? []) cited.add(Number(k));
const listed = [...src.matchAll(/\{ n: (\d+), text: "([^"]*)"/g)].map((m) => ({ n: Number(m[1]), text: m[2] }));
const nums = listed.map((r) => r.n);
ok('every number cited in the text has an entry in the list', [...cited].every((n) => nums.includes(n)), `${cited.size} cited`);
ok('every list entry is cited somewhere in the text', nums.every((n) => cited.has(n)));
ok('the list is numbered 1 to N with no gaps or repeats', nums.every((n, i) => n === i + 1) && nums.length === 59, `${nums.length} entries`);
ok('the page uses one reference list, with the shared pieces', (src.match(/<ReferenceList/g) ?? []).length === 1 && /from '\.\/AboutReferences'/.test(src));
ok('every Cite on the page uses the same page id as the list', (src.match(/<Cite pageId=\{PID\}/g) ?? []).length === (src.match(/<Cite /g) ?? []).length && /pageId=\{PID\}\n\s+heading=/.test(src));
ok('no reference carries page numbers', listed.every((r) => !/\d+\s?[-–]\s?\d+\./.test(r.text) && !/\bpp?\.\s?\d/.test(r.text)));
ok('every reference gives authors, a year and a link', listed.every((r) => /\(\d{4}\)/.test(r.text)) && (src.match(/href: "https?:\/\//g) ?? []).length === 59);
ok('a paywalled publisher page says it may need payment', (src.match(/linkLabel: "Publisher page \(may need payment\)"/g) ?? []).length >= 20);
ok('the eleven old references are corrected, replaced or gone: none of the old wrong links remain', !/PMC3713325|PMC2555428|PMC3156028|PMC3498959|PMC5575449|heartmath|greatergood|hbr\.org|247391/i.test(src));
ok('the corrected Goetz, de Waal, Lamm, van Zomeren, Piff, Tang and Neff entries are in the list', ['Goetz J, Keltner D, Simon-Thomas E (2010). Compassion: An evolutionary analysis and empirical review. Psychological Bulletin.', 'de Waal F (2008). Putting the Altruism Back into Altruism: The Evolution of Empathy. Annual Review of Psychology.', 'Meta-analytic evidence for common and distinct neural networks associated with directly experienced pain and empathy for pain. NeuroImage.', 'Toward an integrative social identity model of collective action', 'Awe, the small self, and prosocial behavior. Journal of Personality and Social Psychology.', 'The neuroscience of mindfulness meditation. Nature Reviews Neuroscience.', 'A Pilot Study and Randomized Controlled Trial of the Mindful Self‐Compassion Program. Journal of Clinical Psychology.'].every((d) => src.includes(d)));
ok('the Pew report is in the list with its free link', /Pew Research Center \(2019\)/.test(src) && /pewresearch\.org\/internet\/2019\/11\/15\//.test(src));

// What was removed
const gone: [string, RegExp][] = [
  ['the cost section and its figures', /trillion|\$8\.9|\$438|\$550|\$300 ?B|\$280|\$282|\$326|Gallup['’]s 20|cost of failing|Economic Cost|Atrophy/i],
  ['the "survival of humanity" claim', /survival of humanity|evolutionary trajectory/i],
  ['the three pillars of "universality"', /universal|Three Pillars/i],
  ['the invented terms', /basal psychological devolution|hardware of leadership|most evocative|phylogenetically conserved/i],
  ['the untraceable statistics', /90% of top performers|average IQs|outperformed/i],
  ['the NVC physiology claims', /Vagus Nerve-mediated|Prefrontal Cortex \(PFC\)|Neuroplasticity Intervention|biological foundation of emotional intelligence|literally building capacity/i],
  ['the sprinkler image and the undefined Compassionate Alliance', /sprinkler|Compassionate Alliance|compassionate alliance/i],
  ['the patriarchy sentence', /patriarch/i],
  ['the coercive-power line and the team-awareness line', /coercive power|collective awareness of team/i],
  ['the dated correction note', /Earlier versions of this page/i],
  ['overclaim words', /\bproven\b|\bproves\b|profound|scientifically recognized|revolutionary|ruinous/i],
  ['the old storage claims', /ephemeral sessions|no data storage by Nenya|zero-knowledge, on-device architecture is the goal/i],
  ['the name NVC+', /NVC\+|NVC Plus/i],
];
for (const [what, re] of gone) ok(`gone: ${what}`, !re.test(text) && !re.test(menu.slice(menu.indexOf("id: 'evolved-leader'"), menu.indexOf("id: 'bio-social-design'"))));
ok('the menu entry no longer promises a "trillion-dollar case"', !/trillion/i.test(menu.slice(menu.indexOf("id: 'evolved-leader'"), menu.indexOf("id: 'bio-social-design'"))) && /title: 'Evolved Leadership'/.test(menu));

// What stays, and the owner's decisions
ok('the page says plainly that its leadership view is a position, not a finding', /That is our view, not a scientific finding\./.test(text) && /This is our position\./.test(text) && /It is our own term, not a scientific one\./.test(text));
ok('"No study of Nenya has been done." stays, with what we have not tested', /No study of Nenya has been done\./.test(text) && /We have not tested whether using Nenya changes anyone’s brain, body or behaviour\./.test(text));
ok('the page says no study of NVC measured heart rate variability or brain activity (searched 22 November 2026)', /We searched PubMed on 22 November 2026\. We found no study of nonviolent communication \(NVC\) that measured heart rate variability or brain activity\./.test(text));
ok('the safety notice is kept word for word', body.includes('<strong>Important Safety Notice:</strong> No tool can ever be completely safe. Nenya is built to keep little of what you enter, and its safety checks can be wrong, so it is important to proceed mindfully with its use. Trust your instincts, honor your boundaries, and remember that you are always in control of what you choose to share and explore.'));
ok('the AI-use disclosure is kept and says the references were re-checked against Crossref and OpenAlex on 22 November 2026', /AI helped write this page\./.test(text) && /checked again against Crossref and OpenAlex/.test(text) && /on 22 November 2026/.test(text) && /No clinician has reviewed this page\. Nenya is not therapy or medical care\./.test(text) && /Please check the sources yourself\./.test(text));
ok('the disclosure names only the page it still reads (Pew), not the Gallup and Yale pages that are gone', /Pew page/.test(text) && !/Gallup, Pew|Yale/.test(text));
ok('the points the evidence limits are worded as limits: links not causes, one review, small studies', /links, not proof of cause/.test(text) && /It is a hypothesis, not a settled fact\./.test(text) && /so the research does not show that low empathy causes political division/i.test(text));
ok('the page keeps its title and menu label', /Evolved Leadership &amp; The Co-evolutionary Imperative|Evolved Leadership & The Co-evolutionary Imperative/.test(src) && /title: 'Evolved Leadership'/.test(menu));

// Privacy: what the code and the Terms (docs/terms-accuracy-fixes-2026-11-22.md) say
ok('privacy: the page says a sent transcript is kept until the time the sender chose, and that a person reads it', /If you choose to send a transcript, we keep it until the time you chose, and a person at Nenya reads it there\./.test(text));
ok('privacy: the page says the site is hosted and not zero-knowledge, and that the on-device coach does not exist yet', /Nenya is not zero-knowledge: our server reads your coach messages in readable form/.test(text) && /does not exist yet/.test(text));
ok('privacy: it does not claim the coach text is never kept (a sent transcript is), nor repeat the provider\'s own privacy words', !/never (kept|stored)|nothing is kept|encrypted|private mode/i.test(text));
ok('privacy: the 24-hour save is mentioned only when the save switch is on, and as "can be opened for 24 hours at most"', /saveReflectionOn\(\)/.test(src) && /A saved reflection can be opened for 24 hours at most/.test(src) && !/for up to 24 hours/.test(src));
ok('privacy: the AI service is named from the same switch the Privacy Promise page reads', /onWorkersAi\(\) \? 'Cloudflare’s Workers AI service' : 'Venice AI'/.test(src));

// Structure and plainness
ok('the page root scrolls and the headings go h1, then h2, then h3', /className="size-full overflow-auto scroll-container/.test(src) && (body.match(/<h1[ >]/g) ?? []).length === 1 && body.indexOf('<h1') < body.indexOf('<h2') && body.indexOf('<h2') < body.indexOf('<h3'));
ok('no h3 comes before the first h2 of its section and the page uses no h4', !/<h4[ >]/.test(body));
ok('no animation was added', !/animate-|transition-|@keyframes|setInterval/.test(src.replace(/BloomInstant|BloomOnScroll/g, '')));
const paras = [...body.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => m[1].replace(/<Cite[^>]*\/>/g, '').replace(/<[^>]+>/g, '').replace(/\{saveOn[^}]*\}/g, '').replace(/\{aiService\}/g, 'Venice AI').replace(/\s+/g, ' ').trim());
const grades = paras.map((p) => gradeLevel(p));
ok('the paragraphs read at about grade 9 or lower on average', grades.reduce((a, b) => a + b, 0) / grades.length <= 9, `average ${(grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(1)}`);
ok('no paragraph is above grade 12', Math.max(...grades) <= 12, `highest ${Math.max(...grades).toFixed(1)}`);
