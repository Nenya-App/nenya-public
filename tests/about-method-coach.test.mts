// About-thesis chapter 5 (method, design and the coach): the eight pages cite real list entries, keep the name NVC+ out of visitor text,
// and no longer carry the claims the chapter removed. Sentence-level checks name the page and the phrase, so a failure says where.
import { readFileSync } from 'node:fs';
import { ok } from './helpers.mts';
import { gradeLevel } from '../src/lib/readingLevel.ts';

const dir = 'src/app/components/about/';
const flat = (s: string) => s.replace(/\s+/g, ' ');
const PAGES = ['TheoryU', 'HumanCenteredDesign', 'HowChecksWork', 'VeniceChat', 'WitnessedConversations', 'AboutCoach', 'PartnerPractice'] as const;
const read = (name: string) => readFileSync(dir + name + '.tsx', 'utf8');

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
ok('TheoryU: says once that it is an analogy and not a tested method, and that the evidence is thin', /This page is an analogy\. It is our own design, not a tested method/.test(theory) && /no controlled trial/.test(theory));
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

const venice = flat(read('VeniceChat'));
ok('VeniceChat: no longer says "trained", "Encrypted & Private", "companion" or that free accounts can use characters', !/trained in|NVC\+ Trained|Encrypted &amp; Private|Encrypted & Private|AI companion|without needing a paid subscription/.test(venice) && /a written description and prompt, not a model we trained/.test(venice));
ok('VeniceChat: Venice\'s statements are given in its voice, dated, with "we cannot check"', /Venice says its default private mode/.test(venice) && /read 22 November 2026/.test(venice) && /We cannot check these statements/.test(venice) && /updated 8 June 2026/.test(venice));
ok('VeniceChat: the account is needed, free accounts can chat with characters for up to 10 turns (owner, 2026-11-22), and the card is called an older version still to be updated', /you need to create an account/.test(venice) && /A free account can chat with characters for up to 10 turns\./.test(venice) && !/does not say plainly whether free accounts/.test(venice) && /older version of our prompt\. We still need to update it\./.test(venice));
ok('RegionGate: the rest of Nenya "works everywhere" without claiming it sends nothing (owner, 2026-11-22), in the gate and in the two fixed answers', /The rest of Nenya works everywhere\. The breathing tool, the six Lenses/.test(readFileSync('src/coach/RegionGate.tsx', 'utf8')) && !/sends nothing: the breathing tool/.test(readFileSync('src/coach/RegionGate.tsx', 'utf8') + readFileSync('src/lib/aboutNenya.ts', 'utf8')));
ok('VeniceChat: still links Venice\'s terms and privacy policy and keeps the referral disclosure', /VENICE_TERMS_URL/.test(venice) && /VENICE_PRIVACY_URL/.test(venice) && /REFERRAL_NOTE/.test(venice));
ok('VeniceChat: nobody has tested this character, said before any evidence', /Nobody has tested this character\./.test(venice) && /Nobody has tested this character that way/.test(venice));

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
