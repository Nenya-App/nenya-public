// Links in the words the site and the coach write to a visitor: external addresses are safe, real links that open in a new tab; links to the About pages and the
// Terms say so plainly ("You can read about this on the About page"); the owner's full name is where the owner is identified; and the Terms were revised the way the
// repo's own process says (the outgoing text archived, the README row added).
import { readFileSync, existsSync } from 'node:fs';
import { ok } from './helpers.mts';
import { linkify, safeExternalHref, KNOWN_RESOURCE_DOMAINS } from '../src/lib/externalLinks.ts';
import { pageLinkWords, detailForLabel, READ_LEAD } from '../src/lib/pageLinkWords.ts';
import { ANSWERS } from '../src/lib/aboutNenya.ts';
import { LEGAL_PARTS } from '../src/lib/legalDocument.ts';

const read = (f: string) => readFileSync(f, 'utf8');
const links = (t: string) => linkify(t).filter((p) => p.kind === 'link') as { kind: 'link'; text: string; href: string }[];
const joined = (t: string) => linkify(t).map((p) => p.text).join('');

// Safe addresses
ok('a plain https address is accepted', safeExternalHref('https://findahelpline.com/') === 'https://findahelpline.com/');
for (const bad of ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:text/html,<script>alert(1)</script>', 'http://example.com', 'mailto:a@b.com', 'tel:988', '//example.com', 'https://user:pass@example.com', 'https://exam ple.com', 'https://localhost', 'https://xn--e1afmkfd.example.com', 'https://exаmple.com', 'https://example.com/"onmouseover="x', 'ftp://example.com', '']) {
  ok(`not a safe address: ${JSON.stringify(bad)}`, safeExternalHref(bad) === null);
}

// Linkifying words
const a = linkify('Visit https://www.example.org/help, then rest.');
ok('a trailing comma is not part of the address', a.some((p) => p.kind === 'link' && p.text === 'https://www.example.org/help'));
ok('linkifying keeps every character in order', joined('Visit https://www.example.org/help, then rest.') === 'Visit https://www.example.org/help, then rest.');
ok('a trailing full stop is not part of the address', links('See https://example.com/a.')[0]?.text === 'https://example.com/a');
ok('a closing bracket around an address is left to the sentence', links('(see https://example.com/a)')[0]?.text === 'https://example.com/a');
ok('every known bare domain becomes a https link', KNOWN_RESOURCE_DOMAINS.every((d) => links(`Try ${d}.`)[0]?.href === new URL(`https://${d}`).href));
ok('a known domain is found in any case and linked with its real path', links('try IASP.info/Crisis-Centres-Helplines')[0]?.href === 'https://iasp.info/crisis-centres-helplines');
ok('the emergency exit line gives two links', links('findahelpline.com or iasp.info/crisis-centres-helplines').length === 2);
ok('a bare domain that is not on the list is not linked', links('Try example.com or evil.org/help').length === 0);
ok('a known domain inside an email address or a longer name is not linked', links('write to me@findahelpline.com or notfindahelpline.com or findahelpline.com.evil.net').length === 0);
ok('javascript: and data: addresses are never links', links('click javascript:alert(1) or data:text/html;base64,AAAA').length === 0);
ok('http (not https) is not linked', links('go to http://example.com now').length === 0);
ok('HTML the model writes stays text and links nothing unsafe', links('<a href="javascript:alert(1)">x</a><img src=x onerror=alert(1)>').length === 0);
ok('HTML around a real address does not carry the markup into the link', (() => { const l = links('<a href="https://example.com/x">hi</a>'); return l.length === 1 && !/[<>"]/.test(l[0].href); })());
ok('a Markdown link to javascript: is not linked', links('[click](javascript:alert(1))').length === 0);
ok('every link produced is https', links('https://a.example.com/x?y=1#z findahelpline.com stopitnow.org').every((l) => l.href.startsWith('https://')));
ok('a very long address is refused', safeExternalHref('https://example.com/' + 'a'.repeat(3000)) === null);

// The site's own resource list: every web address on it is linkable
const flags = read('src/lib/safetyFlags.ts');
for (const d of ['stopitnow.org', 'report.cybertip.org', 'findahelpline.com', 'iasp.info/crisis-centres-helplines']) ok(`${d} is on the resource list and in the known list`, flags.includes(d) && KNOWN_RESOURCE_DOMAINS.includes(d));

// Outdated crisis-resource wording, checked on the official pages 2026-11-25 (988lifeline.org, iasp.info): the US line's current name, and IASP's current directory page.
const exit = read('src/app/components/EmergencyExit.tsx');
ok('the emergency exit names the US line "988 Suicide & Crisis Lifeline", with the same number', exit.includes('988 Suicide & Crisis Lifeline:</strong>') && exit.includes('Call or text 988 (US)'));
ok('the emergency exit line for other countries is the two current addresses', exit.includes('text="findahelpline.com or iasp.info/crisis-centres-helplines"'));
ok('the old service name and the old directory address are gone from the crisis text and the link list', [exit, flags, read('src/lib/externalLinks.ts'), read('src/lib/addressGuard.ts')].every((s) => !/National Suicide Prevention Lifeline|resources\/crisis_centres/i.test(s)));

// The words around About and Terms links
const w = pageLinkWords('privacy-promise', 'Our Privacy Promise')!;
ok('an About page link reads "You can read about this on the About page"', w.lead + w.linkText + w.tail === 'You can read about this on the About page: Our Privacy Promise.');
ok('a Terms link reads "...on the Terms page"', (() => { const t = pageLinkWords('terms')!; return t.lead + t.linkText + t.tail === 'You can read about this on the Terms page.' && t.href === '/about/terms'; })());
ok('a Terms link keeps its section as a note', (() => { const t = pageLinkWords('terms', detailForLabel('terms', 'Terms, Section 15'))!; return t.tail === ': Section 15.'; })());
ok('the lead is the one the owner asked for', READ_LEAD === 'You can read about this on the ');
ok('an unknown page gives no link', pageLinkWords('no-such-page') === null);
ok('the page named six-gateways links to its own lens address', pageLinkWords('six-gateways')!.href === '/about/six-lenses');
const pages = ANSWERS.flatMap((x) => x.links.filter((l) => l.page).map((l) => l.page!));
ok('every page named in the pre-written answers has a link', pages.length > 0 && pages.every((p) => pageLinkWords(p) !== null));

// How the pages use them
const rd = (f: string) => read(f);
const ext = rd('src/app/components/ExternalLink.tsx');
ok('the external link opens in a new tab with noopener noreferrer, is underlined, and says so', /target="_blank"/.test(ext) && /rel="noopener noreferrer"/.test(ext) && /underline/.test(ext) && /\(opens in a new tab\)/.test(ext) && /sr-only/.test(ext));
ok('an unsafe address is shown as text, not a link', /safeExternalHref\(href\)/.test(ext) && /if \(!safe\) return/.test(ext));
for (const f of ['src/app/components/ExternalLink.tsx', 'src/app/components/AboutPageLink.tsx', 'src/coach/AnswerCard.tsx', 'src/coach/CoachDemo.tsx', 'src/coach/FlagNotice.tsx']) ok(`${f} never sets HTML from text`, !/dangerouslySetInnerHTML|innerHTML/.test(rd(f)));
const demo = rd('src/coach/CoachDemo.tsx');
ok('the coach replies and the page-written lines go through the linkifier', /m\.role === 'assistant' \? <LinkedText text=\{m\.content\} \/>/.test(demo) && /<LinkedText text=\{text\} \/>/.test(demo));
ok('the visitor\'s own messages are not linkified', !/m\.role === 'user' \? <LinkedText/.test(demo));
ok('the safety notice resources and the emergency exit use the linkifier', /LinkedText/.test(rd('src/coach/FlagNotice.tsx')) && /LinkedText/.test(rd('src/app/components/EmergencyExit.tsx')));
ok('the pre-written answers\' links use the About page words, and other sites use the external link', /AboutPageLink/.test(rd('src/coach/AnswerCard.tsx')) && /<ExternalLink href=\{l\.href\}/.test(rd('src/coach/AnswerCard.tsx')));
for (const f of ['CoachDemo', 'LearningCard', 'NeedTally', 'SummaryRequest', 'WordPanel', 'AnswerCard', 'FlagNotice']) ok(`${f} has no hand-written new-tab anchor`, !/target="_blank"/.test(rd(`src/coach/${f}.tsx`)));
ok('no bare "Read the Terms" or "Read more:" link is left in the pages', !/Read the Terms|Read more: /.test(rd('src/app/components/about/CoachRegion.tsx') + rd('src/app/components/about/PrivacyPromise.tsx')));
ok('the region page says "on the About page" through the shared link', /<AboutPageLink page="coach-region"/.test(rd('src/coach/RegionGate.tsx')));

// The owner's full name, where the owner is identified
const NAME = 'Estëlle Streiff';
const terms = LEGAL_PARTS.flatMap((p) => p.sections).flatMap((s) => [...s.paragraphs, ...(s.bullets ?? []), ...(s.after ?? [])]).join(' ');
ok('the Terms name the operator in full', terms.includes(`operated by ${NAME} as a sole proprietor`));
const who = ANSWERS.find((x) => x.id === 'n-who')!, founder = ANSWERS.find((x) => x.id === 'n-founder')!;
ok('the "who runs it" answer names the owner in full, in the short and the full answer', who.short.includes(NAME) && who.full[0].includes(NAME));
ok('the "who is behind it" answer names the owner in full', founder.short.includes(NAME) && founder.full[0].includes(NAME));
for (const f of ['src/app/components/about/Structure.tsx', 'src/app/components/about/AboutTheFounder.tsx', 'src/app/components/about/AboutCoach.tsx', 'src/app/components/SupportThisWork.tsx', 'AI-DISCLOSURE.md']) ok(`${f} names the owner in full`, rd(f).includes(NAME));
ok('later mentions on the founder page stay "Estëlle"', /— Estëlle, Designer/.test(rd('src/app/components/about/AboutTheFounder.tsx')));
ok('the answers\' drift checks still point at the Terms\' words', who.checks!.some((c) => c.has.includes(`operated by ${NAME}`)));

// The Terms change process: outgoing text archived, README row added, same-day effective date kept
const arch = 'docs/legal/archive/terms-and-privacy-until-2026-11-19-b.md';
ok('the outgoing Terms text is archived under the -b name', existsSync(arch) && /Estëlle as a sole proprietor/.test(read(arch)) && !/operated by Estëlle Streiff/.test(read(arch)));
ok('the legal README lists the archive and the new text', read('docs/legal/README.md').includes('terms-and-privacy-until-2026-11-19-b.md') && read('docs/legal/README.md').includes('Section 11, "Who we are"'));
