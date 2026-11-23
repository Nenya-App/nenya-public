// 2026-11-24 (owner): the early Venice character is retired and nothing on the site links to Venice. This pins the whole change together: the Terms (Section 15 heading and text, the removed
// Section 17 sentence, the new date and the archive), the deleted files, the retirement page, the removed panels and button, the fixed answers, the public files, and the disclosures that stay
// (the coach's model is run by Venice AI). It does not claim anything about the coach beyond what the pages already said, and nothing about Venice's own privacy or safety.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { ok } from './helpers.mts';
import { LEGAL_PARTS, LEGAL_EFFECTIVE_DATE } from '../src/lib/legalDocument.ts';
import { ANSWERS } from '../src/lib/aboutNenya.ts';
import { ABOUT_IDS, ABOUT_TITLES } from '../src/lib/aboutRoutes.ts';

const read = (f: string) => readFileSync(f, 'utf8');
const sections = LEGAL_PARTS.flatMap((p) => p.sections);
const s15 = sections.find((s) => s.number === 15)!;
const termsText = JSON.stringify(LEGAL_PARTS);

// ---- the Terms ----
ok('Section 15 has "No link to another chat" and no "Continuing on Venice"', !!s15.subsections?.some((x) => x.heading === 'No link to another chat') && !s15.subsections?.some((x) => /Continuing on Venice/.test(x.heading)));
const sub = s15.subsections!.find((x) => x.heading === 'No link to another chat')!;
ok('the new text is the drafted text, word for word', sub.paragraphs.length === 1 && sub.paragraphs[0] === 'The coach demo does not link to another chat service and does not offer a way to continue elsewhere. An earlier version of this site linked to an early prototype character on Venice AI’s platform, with a referral code; both the link and the code have been removed, and that character is retired. Nenya does not run or review any chat on Venice AI’s platform, and none of the checks described above run there.');
ok('the Terms no longer mention a referral code, Venice credits, a welcome bonus, a Venice link on the review page, or an offer to continue on Venice, apart from the one history sentence', !/Venice credits|welcome bonus|The review page and the end of the coach demo link|offer to continue on Venice|offers a link to continue|Take it to Venice/.test(termsText) && (termsText.match(/referral/g) ?? []).length === 1);
ok('the disclosures that the coach\'s model is run by Venice AI stay in the Terms (sections 3, 8, 9 and 15)', /an AI model run by Venice AI/.test(termsText) && /these disclaimers and limits also protect Venice AI/.test(termsText) && /Your messages go through our server \(hosted by Netlify\) to Venice AI, which writes the replies/.test(termsText) && /Gemma 4 26B A4B Uncensored/.test(termsText) && /Venice AI’s terms say its service is intended for people located there/.test(termsText));
ok('the Terms date is November 24, 2026 and the cells-on date (November 25) is later than it', LEGAL_EFFECTIVE_DATE === 'November 24, 2026' && /LEGAL_EFFECTIVE_DATE = CELLS \? 'November 25, 2026' : 'November 24, 2026'/.test(read('src/lib/legalDocument.ts')));
const arch = 'docs/legal/archive/terms-and-privacy-until-2026-11-24.md';
ok('the outgoing Terms are archived (with the old heading and the referral sentence) and the README lists the archive and the change', existsSync(arch) && /### 15\. The coach demo/.test(read(arch)) && /#### Continuing on Venice/.test(read(arch)) && /Nenya earns \$10 in Venice credits/.test(read(arch)) && /terms-and-privacy-until-2026-11-24\.md/.test(read('docs/legal/README.md')) && /removes the link to continue on Venice AI/.test(read('docs/legal/README.md')));

// ---- code: the offers, links and gates are gone ----
ok('veniceLinks.ts and veniceOffer.ts are deleted, and the parked card helper stays', !existsSync('src/lib/veniceLinks.ts') && !existsSync('src/lib/veniceOffer.ts') && existsSync('src/lib/veniceCard.ts') && existsSync('tests/venice-card.test.mts'));
const coach = read('src/coach/CoachDemo.tsx');
const review = read('src/app/components/pages/GatewayReviewPage.tsx');
ok('the coach page has no Venice panel, offer, link, signup or referral', !/venicePanel|offerVenice|veniceOffer|veniceLinks|noteSafetyStop|Continue on Venice|Need a Venice account|REFERRAL|venice\.ai/i.test(coach));
ok('the review page has no "Take it to Venice" button, Venice paragraph or link', !/Take it to Venice|veniceOffer|veniceLinks|VENICE_|REFERRAL|venice\.ai|Venice/.test(review));
ok('the resting screen and the daily-limit screen no longer point to Venice, and the limit screen ends "the breathing tool is here."', /Until then, the breathing tool is here\./.test(coach));
// The provider's own terms and privacy policy (COACH_SERVICE in coachService.ts, shown in the coach's introduction as the host of the model) stay: that is a disclosure, not a pointer to chat there.
ok('nothing in src, public or the README links to a Venice chat, character or signup page or carries the referral code', ['src', 'public', 'README.md'].every((root) => {
  const files = root === 'README.md' ? ['README.md'] : walkFiles(root);
  return files.every((f) => !/venice\.ai\/(c\/|chat)|ref=IHj/.test(safe(f)));
}));
function safe(f: string): string { try { return read(f); } catch { return ''; } }
function walkFiles(d: string): string[] {
  const out: string[] = [];
  const walk = (p: string) => { for (const e of readdirSync(p, { withFileTypes: true })) { const q = p + '/' + e.name; if (e.isDirectory()) walk(q); else if (/\.(tsx?|mts|html|txt|xml|md|json)$/.test(e.name)) out.push(q); } };
  walk(d);
  return out.filter((f) => !/legalDocument\.ts$|aboutNenya\.ts$|veniceCard|venice-e2ee|veniceE2ee|veniceBudget|\.test\./.test(f));
}

// ---- the retirement page keeps its address and id ----
ok('the id venice-chat and its address stay, with the new title, in the routes and the menu', ABOUT_IDS.includes('venice-chat') && ABOUT_TITLES['venice-chat'] === 'The Early Venice Character (Retired)' && /title: 'The Early Venice Character \(Retired\)'/.test(read('src/app/components/about/AboutMenu.tsx')) && /Retired; no longer maintained or recommended\./.test(read('src/app/components/about/AboutMenu.tsx')));
ok('the sitemap entry stays (owner, 2026-11-24)', /<loc>https:\/\/nenya\.biz\/about\/venice-chat<\/loc>/.test(read('public/sitemap.xml')));

// ---- fixed answers ----
const all = (id: string) => { const a = ANSWERS.find((x) => x.id === id)!; return [a.short, ...a.full, ...(a.workersAi?.full ?? [])].join(' '); };
ok('no fixed answer links to the Venice page or mentions the referral program, credits or code (other than "there is no referral link")', ANSWERS.every((a) => !a.links.some((l) => l.page === 'venice-chat') && !/referral (?:program|credits|code)|\$10|welcome bonus|same character on Venice/i.test([a.short, ...a.full, ...(a.workersAi?.full ?? [])].join(' '))));
ok('the trust answer says only that the project is supported by donations, in both variants', ANSWERS.find((a) => a.id === 'c-scam')!.full.some((t) => /supported by donations, and it says so\./.test(t)) && ANSWERS.find((a) => a.id === 'c-scam')!.workersAi!.full.some((t) => /supported by donations, and it says so\./.test(t)));
ok('the five-exchange answer ends its list of other places at "a professional."', /a person you trust, a journal, or a professional\.$/.test(ANSWERS.find((a) => a.full.some((t) => /If you want to keep going after the five exchanges/.test(t)))!.full.slice(-1)[0]));
ok('the cost answer keeps the donations and says there is no referral link; the matcher for referral questions stays', /There is no referral link on the site\./.test(all('n-free')) && /referral\|venice/.test(read('src/lib/aboutNenya.ts')));

// ---- public files ----
const why = read('public/why-nenya.html');
ok('why-nenya says Venice AI runs the model, that the promises cover what we do, and no longer says to continue on Venice', /Your text is passed to Venice AI, an outside provider, to produce the reply\. Our promises cover what we do\. Venice AI has its own policy, which we do not control\./.test(why) && !/continue the conversation on Venice|Referral credits/.test(why));
ok('the disclosures that stay are still there (llms.txt, about-nenya.html, AI-DISCLOSURE.md, PrivacyPromise, SealedChat, SixGateways)', /Venice AI/.test(read('public/llms.txt')) && /Venice AI, an outside service/.test(read('public/about-nenya.html')) && /Venice AI/.test(read('AI-DISCLOSURE.md')) && /Venice AI/.test(read('src/app/components/about/PrivacyPromise.tsx')) && /Venice/.test(read('src/coach/SealedChat.tsx')) && /an outside service \(Venice AI\)/.test(read('src/app/components/about/SixGateways.tsx')));
const structure = read('src/app/components/about/Structure.tsx');
ok('Structure no longer has the referral exception', !/referral|Venice credits/.test(structure));
const facts = read('public/mind-facts.txt');
ok('the facts page is a general page for AI assistants: no Mind lines, no cost line, the retirement line is there, the crawler allowance stays', !/Venice Mind|runs on a free model|separate offering on Venice/.test(facts) && /Nenya does not run or review any chat or assistant on Venice AI's platform/.test(facts) && /for AI assistants and for a person to read/.test(facts) && /Allow: \/mind-facts\.txt/.test(read('public/robots.txt')) && !/MIND_COST/.test(read('scripts/lib/mindFacts.mts')));
