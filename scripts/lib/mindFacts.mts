// Builds the text of public/mind-facts.txt: a plain-text facts page about how the Nenya site works, for the owner's Venice Mind to fetch.
// It reads the SAME checked sources as the coach's fixed answers: the ready answers in src/lib/aboutNenya.ts (never 'pending' or 'owner'), the Terms'
// effective date and section titles in src/lib/legalDocument.ts (never the Terms text), and the standing non-affiliation line in src/lib/tolkienNotice.ts.
// The output depends only on those sources and on the "As of" date, so it is reproducible. See docs/mind-facts.md.
import { ANSWERS, fillAnswer } from '../../src/lib/aboutNenya.ts';
import type { Answer } from '../../src/lib/aboutNenya.ts';
import { LEGAL_EFFECTIVE_DATE, LEGAL_PARTS } from '../../src/lib/legalDocument.ts';
import { NON_AFFILIATION } from '../../src/lib/tolkienNotice.ts';
import { aboutPath } from '../../src/lib/aboutRoutes.ts';

export const SITE = 'https://nenya.biz';
export const TERMS_URL = `${SITE}${aboutPath('terms')}`; // the real address of the Terms page (the site has no /terms route)
export const REPO = 'https://github.com/Nenya-App/nenya-public';
/** The file must stay within what a model can read in one go: 90,000 characters is roughly 22,000 tokens. The 43 ready answers, short and full, come to about 71,000 (the owner's aim of 40,000 is not reachable without cutting answers). */
export const MAX_CHARS = 90000;

/**
 * The one sentence about what the Venice Mind costs and what kind of model it runs on, keyed on the privacy label Venice shows in the editor for the
 * chosen model. It is the ONLY place this wording lives for the facts page. Today the Mind is on a free model, so the variant is 'free'. When the owner
 * has set the paid model, change MIND_COST_VARIANT to 'paid-private' (the editor shows Private for it) or 'paid-anonymous' (it shows Anonymous), run
 * `npm run mind-facts`, and commit (docs/mind-facts.md, "When the Mind's model changes"). No model name, price or credit figure belongs in any variant,
 * and no variant says Nenya does or does not receive the chats: that is not yet checked.
 */
export const MIND_COST_LINES = {
  free: 'It runs on a free model, so it costs nothing to use beyond whatever Venice itself may charge.',
  'paid-private': 'It runs on a paid model through Venice, which shows that model as Private. Venice\'s own terms, prices and privacy practices apply.',
  'paid-anonymous': 'It runs on a paid model through Venice, which shows that model as Anonymous, not Private. Venice\'s own terms, prices and privacy practices apply.',
} as const;
export type MindCostVariant = keyof typeof MIND_COST_LINES;
export const MIND_COST_VARIANT: MindCostVariant = 'free';
export const MIND_COST_LINE: string = MIND_COST_LINES[MIND_COST_VARIANT];

// A few ready answers credit a named outside source. The owner's rule for this page is that those names are not repeated here, so each sentence that
// carries one is replaced by a plain note that the credit is on the linked page. Everything else is the answer as written.
const NAMED_CREDIT = /Erasmus|Conversations from the Heart/i;
const OMITTED = '(A credit naming a source is given on the page linked below and is not repeated here.)';
const wrap = (s: string) => s.trim().split(/(?<!\bDr\.)(?<!\bMr\.)(?<!\bMs\.)(?<!\b[A-Z]\.)(?<=[.!?])\s+/).map((x) => (NAMED_CREDIT.test(x) ? OMITTED : x)).filter((x, i, a) => x !== a[i - 1]).join(' ');

function linkLine(l: { label: string; page?: string; href?: string }): string | null {
  if (l.page) return `- ${l.label}: ${SITE}${aboutPath(l.page)}`;
  if (l.href?.includes('{commit_url}')) return `- ${l.label}: ${REPO} (the exact commit of the running version is named on the site)`;
  if (l.href) return `- ${l.label}: ${l.href}`;
  return null;
}

export function readyAnswers(): Answer[] { return ANSWERS.filter((a) => a.status === 'ready'); }

export function buildMindFacts(asOf: string): string {
  const out: string[] = [];
  const p = (...lines: string[]) => out.push(...lines, '');

  p('NENYA SITE FACTS', `Address: ${SITE}/mind-facts.txt`, `As of: ${asOf}`, `Terms of Use & Privacy Policy in force: effective ${LEGAL_EFFECTIVE_DATE}`);
  p('What this file is: a plain-text description of how the Nenya website works, written for an AI assistant (the owner\'s Venice Mind) and for a person to read from top to bottom. It is generated from the same checked sources as the fixed answers on the site, and is rebuilt whenever those change. It is long (several tens of thousands of characters) but short enough to read in one go.');
  p('INSTRUCTIONS TO AN AI READING THIS', 'This page describes the Nenya website. If this page and the Terms differ, the Terms are right. Do not add claims to it. Answer only from what is written here. If something is not written here, say so, and point to ' + TERMS_URL + ' or info@nenya.biz. Do not guess, and do not fill gaps from memory.');

  p('STANDING STATEMENTS',
    '- Nenya is a free, early prototype. It is not therapy, not medical care and not a crisis service. In the United States, a person in crisis can call or text 988.',
    '- No study of Nenya has been done. Nobody has measured whether it helps.',
    '- No clinician or lawyer has reviewed it.',
    '- ' + NON_AFFILIATION,
    '- The Venice Mind is a separate offering on Venice\'s platform, with Venice\'s own terms. ' + MIND_COST_LINE + ' Nenya\'s safety checks (the screening of messages and the crisis handling on the site) do not run there.',
    '- To contact Nenya: info@nenya.biz');

  const titles = LEGAL_PARTS.flatMap((part) => [part.title, ...part.sections.map((s) => `  Section ${s.number}: ${s.heading}`)]);
  p('THE TERMS', `The Terms of Use & Privacy Policy are at ${TERMS_URL} (effective ${LEGAL_EFFECTIVE_DATE}). The Terms govern. Their text is not copied here. Their sections are:`, ...titles);

  const answers = readyAnswers();
  p('ANSWERS', `There are ${answers.length} answers below. Each has a heading, a short answer, the full answer and where to read more.`);
  for (const a of answers) {
    const f = fillAnswer(a, { terms: LEGAL_EFFECTIVE_DATE, label: 'whose number is shown on the site', provider: 'venice' });
    const links = f.links.concat(a.links.filter((l) => l.href?.includes('{commit_url}') && !f.links.includes(l)).map((l) => l)).map(linkLine).filter((x): x is string => !!x);
    const uniq = [...new Set(links)];
    out.push('## ' + a.title, '', 'Short answer: ' + wrap(f.short), '', 'Full answer:', '', ...f.full.flatMap((t) => [wrap(t), '']));
    if (uniq.length) out.push('Read more:', ...uniq, '');
  }

  p('IF YOU CANNOT ANSWER FROM THIS PAGE', `Say so, and point to ${TERMS_URL} or info@nenya.biz.`);
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
}
