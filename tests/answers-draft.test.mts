// The draft pre-written answers (src/lib/aboutNenya.ts): every checkable fact is still in the file that says it, every link goes to a real
// About section, nothing promises what the site cannot keep, and every answer has a place in the tutorial map. Fails when a source changes under an answer.
import { readFileSync, existsSync } from 'node:fs';
import { ANSWERS } from '../src/lib/aboutNenya.ts';
import { DISCREPANCIES, TUTORIAL_MAP } from '../docs/drafts/answers/review-notes.mts';
import { ok } from './helpers.mts';

const norm = (s: string) =>
  s.replace(/\{' '\}/g, ' ').replace(/&rsquo;|&apos;|&#39;|[‘’]/g, "'").replace(/&ldquo;|&rdquo;|[“”]/g, '"').replace(/&amp;/g, '&').replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\s+/g, ' ').trim().toLowerCase();
const cache = new Map<string, string>();
const text = (f: string) => { if (!cache.has(f)) cache.set(f, existsSync(f) ? norm(readFileSync(f, 'utf8')) : ''); return cache.get(f)!; };

const missingFile = ANSWERS.flatMap((a) => a.checks.filter((c) => !existsSync(c.file)).map((c) => `${a.id}: ${c.file}`));
ok('every source file named by a check exists', missingFile.length === 0, missingFile.join(' | '));
const gone = ANSWERS.flatMap((a) => a.checks.filter((c) => existsSync(c.file) && !text(c.file).includes(norm(c.has))).map((c) => `${a.id}: "${c.has}" not in ${c.file}`));
ok('every fact an answer relies on is still in its source', gone.length === 0, gone.join(' | '));

const menu = readFileSync('src/app/components/about/AboutMenu.tsx', 'utf8');
const pages = new Set([...menu.matchAll(/id: '([a-z-]+)'/g)].map((m) => m[1]));
const badPage = ANSWERS.flatMap((a) => a.links.filter((l) => l.page && !pages.has(l.page)).map((l) => `${a.id}: ${l.page}`));
ok('every link to an About section names a real one', badPage.length === 0, badPage.join(' | '));
ok('every link has a page or an address, and external addresses are the repository or https', ANSWERS.every((a) => a.links.length > 0 && a.links.every((l) => !!l.page !== !!l.href && (!l.href || /^https:\/\//.test(l.href) || l.href === '{commit_url}'))));

const ids = ANSWERS.map((a) => a.id);
ok('ids are unique and each is "n-" or "c-" by part', new Set(ids).size === ids.length && ANSWERS.every((a) => a.id.startsWith(a.part === 'nenya' ? 'n-' : 'c-')));
ok('every answer has a short, a full, examples of how it is asked, a tutorial slot, a source, and a status', ANSWERS.every((a) => a.short.length > 60 && a.full.length >= 2 && a.asked.length >= 3 && a.tutorial.length > 10 && a.checks.length >= 2 && ['ready', 'owner', 'pending'].includes(a.status)));
ok('a card is short enough to read in one glance (under 520 characters)', ANSWERS.every((a) => a.short.length < 520), ANSWERS.filter((a) => a.short.length >= 520).map((a) => `${a.id} ${a.short.length}`).join(', '));
ok('an answer that needs the owner has a note saying what', ANSWERS.every((a) => a.status === 'ready' || (a.ownerNote ?? '').length > 60));

// nothing that promises, claims compliance, or overstates privacy
// an answer may say what it does NOT say ("…and not that nothing is kept anywhere"); strip those clauses before looking for the absolute itself
const all = (a: (typeof ANSWERS)[number]) => [a.short, ...a.full].join(' ').replace(/(?:and )?not (?:that )?["“]?nothing is (?:kept|stored|saved) anywhere["”]?/gi, '');
const forbidden: [string, RegExp][] = [
  ['an end-to-end claim', /end-to-end/i],
  ['a compliance claim', /\bHIPAA[- ]compliant\b|\bGDPR[- ]certified\b|\bSOC ?2\b/i],
  ['"nothing is kept anywhere" or similar', /nothing is (?:kept|stored|saved) anywhere|never stored anywhere|no data (?:is )?collected/i],
  ['a promise to pass a message on', /\bwe(?:'ll| will) pass (?:it|this|that) on\b|\bI(?:'ll| will) (?:pass|tell|forward)/i],
  ['a promise to remember or be there', /\bI(?:'ll| will) (?:remember|be here|be there|miss)/i],
  ['an unnamed infrastructure claim', /\b(?:AWS|Amazon|Google Cloud|Azure|OpenAI|ChatGPT|Anthropic)\b/],
  ['a claim of guaranteed effect', /\bguarantee(?:s|d)? (?:you|that it will|results)/i],
  ['"fully accessible"', /fully accessible/i],
];
const hits = ANSWERS.flatMap((a) => forbidden.filter(([, re]) => re.test(all(a)) && !(a.id === 'n-howworks' && /ChatGPT/.test(a.asked.join()) && !re.test(all(a)))).map(([name]) => `${a.id}: ${name}`));
ok('no answer claims what the site cannot keep (end-to-end, compliance, "nothing is kept", passing things on, remembering, other vendors, guarantees)', hits.length === 0, hits.join(' | '));
ok('the coach\'s answers never offer to remember, pass on, or be there', ANSWERS.filter((a) => a.part === 'coach').every((a) => !/\bI(?:'ll| will) (?:remember|pass|be there|be waiting|miss)/i.test(all(a))));
ok('the privacy answers say "does not keep the conversation" or "do not store", never an absolute', ['n-privacy-coach', 'c-memory'].every((id) => /does(?:n't| not) keep|do not store|doesn't keep/i.test(all(ANSWERS.find((a) => a.id === id)!))));
ok('the data answer names Venice AI and says it has its own policy', /Venice AI/.test(all(ANSWERS.find((a) => a.id === 'n-privacy-coach')!)) && /own (?:terms|policy)|own terms and privacy policy/i.test(all(ANSWERS.find((a) => a.id === 'n-privacy-coach')!)));
ok('the cost answer discloses both the donations and the referral credits', /donations/i.test(all(ANSWERS.find((a) => a.id === 'n-free')!)) && /referral/i.test(all(ANSWERS.find((a) => a.id === 'n-free')!)));
ok('the version answer keeps its two placeholders for the site to fill', /\{version\}/.test(ANSWERS.find((a) => a.id === 'n-version')!.short) && /\{terms\}/.test(ANSWERS.find((a) => a.id === 'n-version')!.short));

// the tutorial map
const tIds = new Set(TUTORIAL_MAP.flatMap((t) => t.uses));
ok('every lesson uses real answers, and every answer is used by at least one lesson', TUTORIAL_MAP.every((t) => t.uses.every((u) => ids.includes(u))) && ids.every((id) => tIds.has(id)), [...tIds].filter((u) => !ids.includes(u)).join(',') + ' | unused: ' + ids.filter((id) => !tIds.has(id)).join(','));
ok('the discrepancies each say where, what is said, the conflict, and a suggestion', DISCREPANCIES.length >= 6 && DISCREPANCIES.every((d) => d.where && d.says && d.but && d.suggest));
// the discrepancies are real: what is quoted is actually in the pages
const quoted: [string, string, string][] = [
  ['d1', 'src/app/components/about/Structure.tsx', 'will remain free'],
  ['d2', 'src/app/components/about/PrivacyPromise.tsx', 'Nenya is a Large Language Model (LLM)'],
  ['d3', 'src/lib/legalDocument.ts', 'a model that Venice labels'],
  ['d5', 'src/app/components/about/VeniceChat.tsx', 'trained in NVC+ principles'],
  ['d6', 'src/app/components/about/ContactUs.tsx', '2-3 business days'],
  ['d8', 'src/app/components/about/PrivacyPromise.tsx', 'Hex Code identity is your only required identifier'],
];
const unreal = quoted.filter(([, f, s]) => !text(f).includes(norm(s))).map(([d, f, s]) => `${d}: "${s}" not in ${f}`);
ok('what the discrepancies quote is really there (so the list does not go stale unnoticed)', unreal.length === 0, unreal.join(' | '));
