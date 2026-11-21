// The running tally of feelings and needs named so far (src/lib/conversationTally.ts): the person's own words matched to CNVC's inventory; page state only.
import { readFileSync } from 'node:fs';
import { ok } from './helpers.mts';
import { manyNeedsSoFar, tallyLine, tallyOf } from '../src/lib/conversationTally.ts';
import { pickMessages, withSummaryNeedFocus } from '../src/lib/finalSummary.ts';

const texts = ['I am so tired and anxious, and I feel lonely.', 'I need rest and respect. Still tired, honestly. It is cold out and I got lost on the way.', 'What I want is understanding and connection.'];
const t = tallyOf(texts);
ok('the words the person used are found, most often named first, with how many messages and the first one', t.feelings[0].word === 'tired' && t.feelings[0].count === 2 && t.feelings[0].first === 0 && t.feelings.map((e) => e.word).sort().join() === 'anxious,lonely,tired' && t.needs.map((e) => e.word).sort().join() === 'connection,respect,rest,understanding');
ok('everyday words (still, cold, lost) are not counted as feelings', !t.feelings.some((e) => ['still', 'cold', 'lost'].includes(e.word)));
ok('four different needs across the conversation make "many"; three do not', manyNeedsSoFar(t) && !manyNeedsSoFar(tallyOf(['I need rest and respect.', 'And understanding.'])));
ok('the tally reads as one plain line, empty when nothing came up', tallyLine(t) === 'Feelings: tired, lonely, anxious. Needs: rest, respect, connection, understanding.' && tallyLine(tallyOf(['Hello there.'])) === '' && tallyOf([]).needs.length === 0);
ok('at most eight of each are kept', tallyOf(['exhausted tired weary sleepy lethargic listless depleted burnt out worn out sad']).feelings.length === 8);
ok('the picking call is given the tally as a hint, and no word the person did not use', (() => { const m = pickMessages([{ role: 'user', content: 'I am tired and I need rest.' }]).messages[0].content; return /Words the person used.*tired/.test(m) && /rest/.test(m); })());
const src = readFileSync(new URL('../src/lib/conversationTally.ts', import.meta.url), 'utf8');
ok('it is pure page state: no storage, no network, no cookie in the module', !/localStorage|sessionStorage|indexedDB|fetch\(|document\.cookie|XMLHttpRequest|sendBeacon/.test(src));
ok('a summary gets the one-to-three recommendation when four different needs came up in the person\'s own messages, even if it names fewer; once only', /one to three/.test(withSummaryNeedFocus('You felt tired. You were looking for rest and respect.', texts)) && withSummaryNeedFocus(withSummaryNeedFocus('You felt tired.', texts), texts).match(/one to three/g)?.length === 1 && !/one to three/.test(withSummaryNeedFocus('You felt tired.', ['I need rest.'])));
