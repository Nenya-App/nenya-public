// The coach and the page point people to the Feelings and Needs list next to the message box.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { greetingText } from '../src/lib/siteMessages.ts';
import { WORDS_POINTER, isStuck } from '../src/lib/practiceArc.ts';
import { ok } from './helpers.mts';
const src = (f: string) => readFileSync(join(fileURLToPath(new URL('..', import.meta.url)), f), 'utf8');
const panel = src('src/coach/WordPanel.tsx');

ok('the greeting tells people the list is there, by the name on the page, and that it is optional', /Feelings and needs/.test(greetingText(5)) && /Looking for words\?/.test(greetingText(5)) && /only if you want it/.test(greetingText(5)));
ok('the names used in the greeting and for the coach are the ones on the panel itself', /Looking for words\?/.test(panel) && /Feelings and needs/.test(panel) && /Looking for words\?/.test(WORDS_POINTER) && /Feelings and needs/.test(WORDS_POINTER));
ok('the coach is told to point to it in one sentence when the person cannot find words, and not to list words itself', /one short sentence/.test(WORDS_POINTER) && /cannot find the words/.test(WORDS_POINTER) && /do not list many words/.test(WORDS_POINTER) && /Do not mention it otherwise/.test(WORDS_POINTER));
ok('the instruction is added for ordinary turns, not for distress or hostility', /if \(!softened && !hostile\) parts\.push\(WORDS_POINTER\)/.test(src('netlify/functions/coach.mts')));
ok('the list opens by itself when the person says they are stuck for words, without changing their saved choice', /if \(isStuck\(text\)\) setWordsOpen\(true\)/.test(src('src/coach/CoachDemo.tsx')) && isStuck("I don't know what I feel") && isStuck('no idea') && !isStuck('I felt ignored at work'));
