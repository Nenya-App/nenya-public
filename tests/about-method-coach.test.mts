// About-thesis chapter 5 (method, design and the coach): the eight pages cite real list entries, keep the name NVC+ out of visitor text,
// and no longer carry the claims the chapter removed. Sentence-level checks name the page and the phrase, so a failure says where.
import { readFileSync } from 'node:fs';
import { ok } from './helpers.mts';
import { gradeLevel } from '../src/lib/readingLevel.ts';

const dir = 'src/app/components/about/';
const flat = (s: string) => s.replace(/\s+/g, ' ');
const PAGES = ['TheoryU', 'HumanCenteredDesign', 'HowChecksWork', 'WitnessedConversations', 'AboutCoach', 'PartnerPractice'] as const;
const read = (name: string) => readFileSync(dir + name + '.tsx', 'utf8');

// 2026-11-24: VeniceChat left this list: the page is now the short retirement note, with no citations and no references (it makes no benefit claim that would need one); it is pinned below.
// Numbers cited in the text and numbers in the list: every cited number has a list entry, and every entry is cited.
for (const name of PAGES) {
  const src = read(name);
  const cited = new Set<number>();
  for (const m of src.matchAll(/<Cite pageId=\{PAGE\} n=\{(\[[^\]]*\]|\d+)\} \/>/g)) for (const k of m[1].replace(/[[\]\s]/g, '').split(',')) cited.add(Number(k));
  const listed = [...src.matchAll(/\{"n": (\d+),/g)].map((m) => Number(m[1]));
  ok(`${name}: the list is numbered 1 to ${listed.length} with no gaps`, listed.length > 0 && listed.every((n, i) => n === i + 1));
  ok(`${name}: every number cited in the text has an entry in the list`, cited.size > 0 && [...cited].every((n) => listed.includes(n)), [...cited].filter((n) => !listed.includes(n)).join(','));
  ok(`${name}: every entry in the list is cited in the text`, listed.every((n) => cited.has(n)), listed.filter((n) => !cited.has(n)).join(','));
  ok(`${name}: the list is drawn with the shared ReferenceList`, /<ReferenceList pageId=\{PAGE\} items=\{REFS\} \/>/.test(src));
  ok(`${name}: no references carry page numbers`, !/"text": "[^"]*\b(?:pp?\. ?\d|pages? \d)/.test(src));
  ok(`${name}: the name NVC+ does not appear (the owner's decision: "our approach")`, !/NVC\+/.test(src));
}

const theory = flat(read('TheoryU'));
ok('TheoryU: says once that it is an analogy and not a tested approach, and that the evidence is thin', /This page is an analogy\. It is our own design, not a tested approach/.test(theory) && /no controlled trial/.test(theory));
ok('TheoryU: no "deepest truth", "tangible and accessible" or "any order you like" (the lens tray is not on in production)', !/deepest truth|tangible and accessible|any order you like|deepest source/.test(theory));
ok('TheoryU: the Presencing Institute figures are given as theirs and unchecked', /The Institute says it has a network of over 65,000 people/.test(theory) && /We could not check these figures/.test(theory));
ok('TheoryU: the outside link says it opens in a new tab', /Presencing Institute →<span className="sr-only"> \(opens an outside site in a new tab\)/.test(theory));

const hcd = flat(read('HumanCenteredDesign'));
ok('HumanCenteredDesign: no longer says it is "deeply rooted" in HCD, and says the user testing was not done', !/deeply rooted/.test(hcd) && /We have done no user testing, and no study of Nenya has been done/.test(hcd));
ok('HumanCenteredDesign: no "ensure", "cognitive styles", "anonymity" or "pioneered by IDEO"', !/\bensure\b|cognitive styles|anonymity|pioneered by IDEO/.test(hcd));
ok('HumanCenteredDesign: says plainly that learning styles are not supported and that the lenses were not tested with disabled users', /research does not support that idea/.test(hcd) && /not tested the lenses with disabled users/.test(hcd));

const wit = flat(read('WitnessedConversations'));
ok('WitnessedConversations: no longer says the site "vouches" for the text, and says what a signature does and does not show', !/vouches/.test(wit) && /does not show who typed the person&rsquo;s side/.test(wit) && /The signature is not an identity check/.test(wit));
ok('WitnessedConversations: says the fingerprint does not prove the text is word for word the same, and that a sent conversation is kept for the time chosen', /It does not prove that the text here is word for word the same/.test(wit) && /we keep it for the time you choose, even if we never show it/.test(wit));
ok('WitnessedConversations: the heading order holds (a hidden "Sources" heading comes before the list)', /<h2 className="sr-only">Sources<\/h2>\s*<ReferenceList/.test(read('WitnessedConversations')));

const coach = flat(read('AboutCoach'));
ok('AboutCoach: the lens word, the six-hour rest, and the framework labelled as ours', /the six lenses work without it/.test(coach) && /rest of 6 hours/.test(coach) && /our own design, not a tested instrument/.test(coach));
ok('AboutCoach: the end-of-conversation summary is described as the Terms describe it ("may", flagged messages skip it, not stored)', /may include a short summary/.test(coach) && /We do not store it/.test(coach) && /no summary is written/.test(coach));
ok('AboutCoach: the chatbot evidence is hedged and says nobody has tested this coach', /some short-term help with low mood in small trials, and also clear risks/.test(coach) && /Nobody has tested this coach/.test(coach));
ok('AboutCoach: points to "Our Approach" and keeps the credit sentence and the owner\'s name', /Our Approach\./.test(coach) && coach.includes('Estëlle Streiff'));

const checks = flat(read('HowChecksWork'));
ok('HowChecksWork: the switch-dependent checks say "when this check is switched on", and the page does not claim the group-contempt stance or the distress text is on', /When this check is switched on, the coach says plainly where it stands/.test(checks) && /if that check is switched on/.test(checks) && !/Stance on contempt for a group:/.test(checks) && !/DATE TO CONFIRM/.test(checks));
ok('HowChecksWork: the learning-card status is dated', /Learning cards:<\/strong> as of 22 November 2026, switched on for the live site/.test(checks));
ok('HowChecksWork: stop and soften are told apart, and the two missing checks are listed', /Stop: words that clearly suggest/.test(checks) && /Soften: words that are less clear/.test(checks) && /Orders to the coach/.test(checks) && /Checks on the coach&rsquo;s replies/.test(checks));
ok('HowChecksWork: no longer promises that no conversation is ever used; says what is true', !/never use anyone&rsquo;s conversation/.test(checks) && /We never train anything on anyone&rsquo;s conversation/.test(checks) && /choose to let us use it for testing/.test(checks));
ok('HowChecksWork: "at most" is gone from the false-alarm line, and the figure still comes from the report file', !/ordinary text at most/.test(checks) && /about \{FALSE_ALARMS\.modelLine\}% of ordinary text in our tests/.test(checks));
ok('HowChecksWork: no user testing and no study of Nenya, said plainly (owner, 2026-11-22)', /We have done no user testing and no study of how people use Nenya/.test(checks));
ok('HowChecksWork: the old pinned phrases are kept', ['plain daily counts only', 'reports you to anyone', 'No outside professional has reviewed these checks', 'would like them to be', 'This was a mistake'].every((s) => checks.includes(s)));

// 2026-11-24 (owner, option A): the VeniceChat page is the retirement note. These replace the old assertions about the Venice page's content (trained/encrypted wording, Venice's dated statements,
// the account and 10-turn text, the Venice terms and referral links, "nobody has tested this character"), all of which were removed with that content.
const venice = flat(read('VeniceChat'));
ok('VeniceChat: the title and the drafted note are on the page, word for word', /The Early Venice Character \(Retired\)/.test(venice) && /Before the coach on this site existed, Nenya had an early prototype: a written character prompt on Venice AI&rsquo;s platform\. It was an early test of an idea\. It is retired\. It is no longer maintained, and Nenya does not recommend it\. This site does not link to it\./.test(venice) && /Nenya does not run or review any chat on Venice AI&rsquo;s platform\. If you find a Nenya-named character or assistant there, it is outside Nenya, and none of Nenya&rsquo;s checks run on it\./.test(venice));
ok('VeniceChat: the coach is described with the standing statements only (optional, early prototype, needs more testing, not therapy, not a crisis service, no study, no clinician review) and its model host is disclosed', /The coach on this site is where the work continues\. It is optional, and it is still an early prototype that needs more testing\. It is not therapy and not a crisis service\. No study of it has been done, and no clinician has reviewed it\. Its replies are written by an AI model that Venice AI runs, reached through our server; the Terms \(Section 15\) say what is sent, what is checked and what is not kept\./.test(venice) && /call or text 988/.test(venice));
ok('VeniceChat: no link to Venice, no signup, referral, price, privacy or upload text, and no benefit claim', !/venice\.ai|href=\{VENICE|VENICE_|REFERRAL|referral|target="_blank"|<Cite|ReferenceList|ExternalLink|Sign up|sign up|account|Pro\b|\$\d|upload|helps|works better|safer|replaces/i.test(venice));
ok('VeniceChat: only internal links (the menu, the coach demo at /coach/, the Terms page)', /href="\/coach\/"/.test(venice) && !/href="https?:/.test(venice) && /AboutPageLink page="terms"/.test(venice));
ok('RegionGate: the rest of Nenya "works everywhere" without claiming it sends nothing (owner, 2026-11-22), in the gate and in the two fixed answers', /The rest of Nenya works everywhere\. The breathing tool, the six Lenses/.test(readFileSync('src/coach/RegionGate.tsx', 'utf8')) && !/sends nothing: the breathing tool/.test(readFileSync('src/coach/RegionGate.tsx', 'utf8') + readFileSync('src/lib/aboutNenya.ts', 'utf8')));

const partner = flat(read('PartnerPractice'));
ok('PartnerPractice: the "no one can join a cell" notice shows only while the test cell is off', /\{cellOpen \? \(.*Planned, and only partly built.*\) : \(.*Planned, not built for visitors.*No one can join a cell now/.test(partner));
ok('PartnerPractice: says what is true about revoking access without accounts, and the 3-hour limit', /We have not worked out how to do this without accounts/.test(partner) && /up to 3 hours in the test version/.test(partner) && /nothing is kept longer than 3 hours/.test(partner));
ok('PartnerPractice: no "Structured Integration", "research", "anonymity" or "no stored conversations"', !/Structured Integration|professionals and research|anonymity|no stored conversations/.test(partner));
ok('PartnerPractice: no clinician has reviewed the idea, and the studies are called small', /No clinician has reviewed this idea/.test(partner) && /Two small studies/.test(partner));

// Where the Coach Is Open: the citations sit in the shared explainer, the list on the page
{
  const region = read('CoachRegion');
  const explainer = readFileSync('src/coach/IpExplainer.tsx', 'utf8');
  const cited = new Set<number>();
  for (const m of explainer.matchAll(/\{c\((\[[^\]]*\]|\d+)\)\}/g)) for (const k of m[1].replace(/[[\]\s]/g, '').split(',')) cited.add(Number(k));
  const listed = [...region.matchAll(/\{"n": (\d+),/g)].map((m) => Number(m[1]));
  ok('CoachRegion: the list is numbered 1 to 6 and every number cited in the explainer has an entry, and every entry is cited', listed.length === 6 && listed.every((n, i) => n === i + 1) && [...cited].every((n) => listed.includes(n)) && listed.every((n) => cited.has(n)));
  ok('CoachRegion: the page asks for the cited explainer and draws the list; the coach gate shows the same words without numbers', /<IpExplainer cited \/>/.test(region) && /<ReferenceList pageId="coach-region" items=\{REFS\} \/>/.test(region) && /cited \? <Cite pageId="coach-region"/.test(explainer) && !/cited/.test(readFileSync('src/coach/RegionGate.tsx', 'utf8')));
  const text = flat(region + explainer);
  ok('CoachRegion: no longer says everything else "sends nothing", nor gives unsourced reasons for a wrong country (borders, satellite, school)', !/sends nothing: the breathing|near borders|satellite|school networks|most common reason/.test(text) && /does not send what you write/.test(text));
  ok('CoachRegion: says the guestbook and other optional tools make their own one-way codes, and points to the Terms', /A few optional tools, such as the guestbook, make their own one-way codes for their own limits/.test(text) && /The Terms list them/.test(text));
  ok('CoachRegion: the name NVC+ does not appear', !/NVC\+/.test(text));
}

// new paragraphs stay near grade 9 or lower
{
  const paras = [theory, hcd, wit, coach, checks, venice, partner].flatMap((s) => [...s.matchAll(/<p[^>]*>([^<]{60,}(?:<(?:Cite|strong|em|a)[^>]*>[^<]*(?:<\/(?:strong|em|a)>)?[^<]*)*)<\/p>/g)].map((m) => m[1].replace(/<Cite[^>]*\/>/g, '').replace(/<[^>]+>/g, '').replace(/&rsquo;|&apos;/g, "'").replace(/&ldquo;|&rdquo;/g, '"')));
  const high = paras.filter((p) => gradeLevel(p) > 12).map((p) => `${gradeLevel(p).toFixed(1)}: ${p.slice(0, 60)}`);
  ok('the new paragraphs stay readable (none above grade 12 by the repo estimate)', paras.length > 10 && high.length === 0, high.join(' | '));
}
