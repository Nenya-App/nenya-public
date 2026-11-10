// The learning cards: the reading of a card, the rules a card must meet to ship, the build that ships only approved ones, and when one is offered.
// All text here is invented. No real list entry and no real card text is in the repository.
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { parseCard, othersInSeries, type LearningCard } from '../src/lib/learningCards.ts';
import { offerFor, REPORTING, OFFER_MAP } from '../src/lib/learningOffer.ts';
import { compile, match, type LexRow } from '../src/lib/lexicon.ts';
import { ok } from './helpers.mts';

const BODY = 'People were split into groups for no good reason at all, and they still tended to favor their own group when handing out rewards. This shows how quickly a line between us and them can be drawn, and how little it needs to rest on. It says nothing about what any one person will do.';
const md = (o: { id?: string; status?: string; body?: string; url?: string; extra?: string } = {}) => `---
id: ${o.id ?? 'prop-03'}
series: propaganda
type: card
order: 3
shown-when: test
title: Us and them
content-note: Content note: a group being cast as a threat comes up here.
sources:
  - person-or-org: A. Researcher
    work: A study
    year: 1971
    url: ${o.url ?? 'https://example.org/study'}
    how-used: paraphrase
    license: unknown
status: ${o.status ?? 'approved'}
---
*Content note: a group being cast as a threat comes up here.*

## Key idea
People can be split into groups on a trivial basis and still favor their own group.

## In plain words
${o.body ?? BODY}

## Something to try
Pick a group you would call us. What does the line between you and them rest on?

## Where this comes from
A. Researcher (1971). Paraphrased.
${o.extra ?? ''}
## A way out
You can go back to the conversation. Or stop here.
`;

const r = parseCard(md())!;
ok('a card is read: id, title, content note, sections, one address, status', r.card.id === 'prop-03' && r.card.title === 'Us and them' && /^Content note:/.test(r.card.contentNote) && r.card.key.startsWith('People can') && r.card.url === 'https://example.org/study' && r.status === 'approved');
ok('a good card passes every rule', r.problems.length === 0, r.problems.join('; '));
const bad = (o: Parameters<typeof md>[0]) => parseCard(md(o))!.problems.join('|');
ok('a body outside 40 to 80 words, or a missing address, stops a card', /words/.test(bad({ body: 'Too short to ship.' })) && /address/.test(bad({ url: 'to be confirmed' })));
ok('banned words, dashes, exclamation marks and "you should" stop a card', /heal/.test(bad({ body: BODY + ' This can heal.' })) && /dash/.test(bad({ body: BODY.replace('and they', '— and they') })) && /exclamation/.test(bad({ body: BODY + ' Wow!' })) && /should/.test(bad({ body: BODY + ' You should stop.' })));
ok('a link in the text stops a card (the address belongs in the front matter)', /link in the text/.test(bad({ body: BODY + ' See https://example.org/x for more.' })));
ok('read-more over 250 words stops a card', /250/.test(bad({ extra: '\n## Read more\n' + 'word '.repeat(260) + '\n' })));
ok('something that is not a card is refused', parseCard('just some text') === null);

// the build ships only approved cards
const dir = mkdtempSync(join(tmpdir(), 'lc-'));
writeFileSync(join(dir, 'prop-03-us-and-them.md'), md({ status: 'draft-v4' }));
writeFileSync(join(dir, 'prop-04-x.md'), md({ id: 'prop-04', status: 'approved' }));
const dataFile = new URL('../src/lib/learningCardsData.ts', import.meta.url);
const before = readFileSync(dataFile, 'utf8');
try {
  const out = execFileSync('node', ['scripts/build-learning-cards.mts', dir], { cwd: new URL('..', import.meta.url).pathname }).toString();
  const data = readFileSync(dataFile, 'utf8');
  ok('the build ships only approved cards and says how many were left out', /1 approved card\(s\) written; 1 not approved/.test(out) && /"id": "prop-04"/.test(data) && !/"id": "prop-03"/.test(data));
  writeFileSync(join(dir, 'prop-05-y.md'), md({ id: 'prop-05', status: 'approved', url: 'to be confirmed' }));
  let failed = false;
  try { execFileSync('node', ['scripts/build-learning-cards.mts', dir], { cwd: new URL('..', import.meta.url).pathname, stdio: 'pipe' }); } catch (e) { failed = /cannot ship/.test(String((e as { stderr?: Buffer }).stderr)); }
  ok('an approved card that breaks a rule stops the build and says why', failed);
} finally {
  writeFileSync(dataFile, before); // leave the repository's data file as it was
}
ok('the repository holds no approved card unless the owner has approved one', !/"status"/.test(before));

// "read another"
const C = (id: string, order: number): LearningCard => ({ ...r.card, id, order });
ok('read another goes to the next card in the same series, then wraps to earlier ones', othersInSeries('prop-02', [C('prop-01', 1), C('prop-02', 2), C('prop-03', 3)]).map((c) => c.id).join() === 'prop-03,prop-01');

// when a card is offered
const M = compile([{ term: 'blorvish', variants: [], category: 'slur', target: 't', severity: 3, matchMode: 'token', contextNote: '', cues: [], language: 'en', source: 's', confidence: 'high' } as LexRow, { term: 'grimble', variants: [], category: 'harassing-insult', target: 't', severity: 1, matchMode: 'token', contextNote: '', cues: [], language: 'en', source: 's', confidence: 'low' } as LexRow, { term: 'tweepish', variants: [], category: 'ai-insult', target: 'ai-coach', severity: 2, matchMode: 'token', contextNote: 'llm-tell', cues: [], language: 'en', source: 's', confidence: 'low' } as LexRow]);
const all = Object.values(OFFER_MAP).flat();
const base = { shown: [] as string[], available: all, flagged: false, abuseAtCoach: false };
const offer = (text: string, o: Partial<typeof base> = {}) => offerFor({ ...base, ...o, hits: match(text, M), text });
ok('a card is offered for a match at or above the minimum severity, from the list for that kind of language', offer('what a blorvish')?.id === 'dehum-01' && offer('what a blorvish', { available: ['dehum-04'] })?.id === 'dehum-04');
ok('a low-severity match gets no card by default, and does when the minimum is lowered', offer('such a grimble') === null && offerFor({ ...base, hits: match('such a grimble', M), text: 'such a grimble', minSeverity: 1 })?.id === 'conn-01');
ok('never when the crisis check flagged the message', offer('what a blorvish', { flagged: true }) === null);
ok('never a card already offered, and never more than two offers', offer('what a blorvish', { shown: ['dehum-01'] })?.id === 'dehum-04' && offer('what a blorvish', { shown: ['dehum-01', 'dehum-04'] }) === null);
ok('only cards that exist can be offered', offer('what a blorvish', { available: [] }) === null);
ok('a person reporting what someone called them is not offered a card about using the word', offer('my boss called me a blorvish today') === null && offer('he said "blorvish" to me') === null && REPORTING.test('they told me I was a blorvish') && !REPORTING.test('what a blorvish'));
ok('abuse aimed at the coach is offered the card about that', offer('you are useless', { abuseAtCoach: true })?.id === 'ai-01' && offer('you are useless', { abuseAtCoach: true, shown: ['ai-01'] }) === null);
ok('a lexical tell that is not abuse never triggers anything', offer('so tweepish') === null);
ok('ordinary messages get nothing', offer('I had a long week and I feel tired') === null);
