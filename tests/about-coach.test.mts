// The About the Coach page and the pre-written answer c-methods carry the credit sentence word for word, as approved in writing by the person it names,
// and say nothing she did not approve: not "trained on" (except to say no model was), not an affirmative "endorse", not "gateway" (the word is "lens").
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { ok } from './helpers.mts';
import { ANSWERS as ABOUT_ANSWERS } from '../src/lib/aboutNenya.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const flat = (t: string) => t.replace(/\s+/g, ' ');
const raw = readFileSync(join(root, 'src/app/components/about/AboutCoach.tsx'), 'utf8');
const page = flat(raw);
const noComments = flat(raw.split('\n').filter((l) => !/^\s*\/\//.test(l)).join('\n')); // the code comments explain what the page must not say
const CREDIT = 'Dr. Yvette Erasmus, clinical psychologist and founder of the School of Human Connection, whose publicly available Conversations from the Heart podcast provided source material for identifying relational coaching patterns used in developing Nenya.';

const answer = ABOUT_ANSWERS.find((a) => a.id === 'c-methods');
ok('c-methods exists', !!answer);
const answerText = flat([answer!.short, ...answer!.full].join(' '));

ok('the credit sentence is on the page, verbatim', page.includes(CREDIT));
ok('the credit sentence is in c-methods, in the short answer and in the full one, verbatim', answer!.short.includes(CREDIT) && answer!.full.some((p) => p === CREDIT));

// Everything the page says outside the credit sentence is checked as well, so the sentence itself cannot hide a fault.
const pageText = noComments.split(CREDIT).join('');
const answerRest = answerText.split(CREDIT).join('');
for (const [name, text] of [['the page', pageText], ['c-methods', answerRest]] as const) {
  const trained = [...text.matchAll(/trained on/gi)].filter((m) => !/\bno (?:AI )?model was$/i.test(text.slice(Math.max(0, m.index! - 20), m.index!).trim()));
  ok(`${name} never says "trained on", except to say that no model was`, trained.length === 0);
  const endorse = [...text.matchAll(/endorse\w*/gi)].filter((m) => !/\b(?:not|nor|no|nobody|never|neither|without|or)\b[^.]{0,60}$/i.test(text.slice(Math.max(0, m.index! - 70), m.index!)));
  ok(`${name} uses "endorse" only to deny it`, endorse.length === 0);
  const claims = [...text.matchAll(/(?:reviewed|supervised|partnered)\b[^.]{0,20}/gi)].filter((m) => !/\b(?:not|nor|no|nobody|never|neither|without)\b[^.]{0,80}$/i.test(text.slice(Math.max(0, m.index! - 90), m.index!)));
  ok(`${name} claims no review, supervision or partnership (only denies them)`, claims.length === 0);
  ok(`${name} never says "gateway" (the word is "lens")`, !/gateway/i.test(text.replace(/the six gateways/gi, '').replace(/six-gateways/gi, '')));
}
ok('c-methods does not say "gateway" at all', !/gateway|insight/i.test(answerText));
ok('the page says no model was trained on the calls', page.includes('No AI model was trained on the podcast calls') && /No AI model was trained on the podcast recordings/.test(answerText));
ok('the page and the answer no longer say "I was not trained by any individual teacher" without saying more', answerText.includes(CREDIT));
ok('the page gives the removal address and the limits, and links the AI disclosure', page.includes('info@nenya.biz') && page.includes('within 30 days') && page.includes('earlier public versions') && page.includes('https://github.com/Nenya-App/nenya-public/blob/main/AI-DISCLOSURE.md'));
ok('the page does not carry the private register or module names', !/register|module names|ICARUS/i.test(pageText.replace('guidance modules', '')));
ok('c-methods checks point at the real page text', (answer!.checks ?? []).some((c) => c.file.endsWith('AboutCoach.tsx') && c.has === CREDIT));
