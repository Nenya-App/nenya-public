// The plain-English page and the decline popout (step 2 of the Terms-first entry): honest, static, nothing sent, counted or stored, and every line traceable to the Terms.
import { readFileSync } from 'node:fs';
import { PLAIN_ENGLISH, PLAIN_INTRO, PLAIN_UNVERIFIED } from '../src/lib/plainEnglish.ts';
import { ok } from './helpers.mts';

const lib = readFileSync('src/lib/plainEnglish.ts', 'utf8');
const plain = readFileSync('src/app/components/PlainEnglish.tsx', 'utf8');
const pop = readFileSync('src/app/components/DeclinePopout.tsx', 'utf8');
const popText = pop.split('\n').filter((l) => !l.trim().startsWith('//')).join('\n'); // the words on the page, not the comments about them
const terms = readFileSync('src/lib/legalDocument.ts', 'utf8');
const all = PLAIN_ENGLISH.map((i) => `${i.heading} ${i.text}`).join(' ') + PLAIN_INTRO;

ok('every line names the Terms section it was written from', PLAIN_ENGLISH.every((i) => i.from.length > 5));
ok('it says it is a summary and the full Terms are the binding text', /summary/.test(PLAIN_INTRO) && /binding/.test(PLAIN_INTRO));
ok('it never claims "no tracking at all", and it names the host\'s logs', !/no tracking at all|nothing is tracked|untraceable/i.test(all + popText) && /connection logs/.test(all) && /connection logs/.test(pop));
ok('the decline statement is the one the Terms\' own wording supports', /do not count or keep anything about you here/.test(pop) && /Our web host keeps ordinary connection logs/.test(pop));
// Facts checked against the Terms text (src/lib/legalDocument.ts)
ok('age: 13 and the under-18 coach consent are in the Terms', /13/.test(all) && /aged 13 and older/.test(terms) && /under 18/.test(terms) && /under 18/.test(all));
ok('crisis lines: 988 and findahelpline.com are in the Terms', /988/.test(all) && /988/.test(terms) && /findahelpline\.com/.test(all) && /findahelpline\.com/.test(terms));
ok('the 24-hour save is in the Terms', /24 hours/.test(all) && /at most 24 hours/.test(terms));
ok('no accounts, no advertising, no tracking cookies is in the Terms', /No accounts\. No advertising\. No tracking cookies/.test(all) && /No accounts, no advertising, no tracking cookies/.test(terms));
ok('daily totals start after agreement and not with Global Privacy Control, as the Terms say', /Global Privacy Control/.test(all) && /only after you agree to these terms, and not at all if your browser sends the Global Privacy Control/.test(terms));
ok('the coach: Venice AI, not stored by us, United States only, as Section 15 says', /Venice AI/.test(all) && /We do not store your messages/.test(terms) && /United States/.test(all) && /open only to connections our host places in the United States/.test(terms));
ok('what leaves the device matches the short version (report, The Color API, coach, signed note)', /Color API/.test(all) && /signed note/.test(all) && /the signed note when you agree/.test(terms));
ok('the working pair is described as the Terms do (random, changeable, not an account, not stored)', /random pair of colors/.test(all) && /a random pair you can change/.test(terms) && /not an account, we do not store them/.test(terms));
ok('the lines the Terms do not yet say are listed for the owner', PLAIN_UNVERIFIED.length === 2);

// Nothing sent, counted or stored
const code = plain + pop + lib;
ok('no request, event count, storage, cookie or other host is touched', !/fetch\(|XMLHttpRequest|sendBeacon|countEvent|localStorage|sessionStorage|indexedDB|document\.cookie|enableUsageCounts|https?:\/\//.test(code));
// Behavior
ok('the popout is a modal dialog, takes focus, and Escape returns to the Terms (it never counts as agreeing)', /role="dialog"/.test(pop) && /aria-modal="true"/.test(pop) && /\.focus\(\)/.test(pop) && /e\.key === 'Escape'\) onReadTerms\(\)/.test(pop) && !/onAgree|onFinish|Agree/.test(pop));
ok('both ways back are plain buttons with words', />Read the full Terms</.test(pop) && />Read the Terms again</.test(pop));
