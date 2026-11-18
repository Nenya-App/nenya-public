// The running tally on the coach pages (VITE_NEED_TALLY, off): computed in the page, never stored or sent, hidden when empty, quiet, with the credit and the one recommendation.
import { readFileSync } from 'node:fs';
import { needTallyOn, NEED_TALLY_UI } from '../src/lib/needTallyView.ts';
import { tallyOf, manyNeedsSoFar } from '../src/lib/conversationTally.ts';
import { NEED_FOCUS_SUMMARY } from '../src/lib/needFocus.ts';
import { ok } from './helpers.mts';

const code = (f: string) => readFileSync(f, 'utf8').split('\n').filter((l) => !l.trim().startsWith('//')).join('\n'); // the code, not the comments about it
const comp = code('src/coach/NeedTally.tsx');
const view = code('src/lib/needTallyView.ts');
const demo = readFileSync('src/coach/CoachDemo.tsx', 'utf8');
const sealed = readFileSync('src/coach/SealedChat.tsx', 'utf8');

ok('the switch is off by default', needTallyOn() === false);
ok('the control is closed by default, labelled, and its changes are announced politely', /<details className=/.test(comp) && !/<details[^>]*open/.test(comp) && /aria-live="polite"/.test(comp) && NEED_TALLY_UI.label === 'What has come up so far');
ok('it is hidden when nothing has come up', /if \(tally\.feelings\.length === 0 && tally\.needs\.length === 0\) return null;/.test(comp) && tallyOf(['Hello there.']).needs.length === 0);
ok('it shows the person\'s own words, the credit and the link, and the recommendation only when many needs came up', /SUMMARY_CREDIT/.test(comp) && /SUMMARY_CREDIT_LINK/.test(comp) && /manyNeedsSoFar\(tally\) && <p>\{NEED_FOCUS_SUMMARY\}<\/p>/.test(comp) && NEED_FOCUS_SUMMARY.startsWith('Several needs came up'));
const few = tallyOf(['I feel tired and I need rest.']);
const many = tallyOf(['I need rest, respect, support, understanding and honesty.']);
ok('the recommendation is for four or more different needs, and not before', !manyNeedsSoFar(few) && manyNeedsSoFar(many));
ok('it is never stored or sent, and never takes focus', !/localStorage|sessionStorage|indexedDB|document\.cookie|fetch\(|sendBeacon|countEvent|\.focus\(/.test(comp + view));
ok('the target to open it is at least 44px high', /min-h-11/.test(comp));
ok('the coach page shows it only behind the switch, not after a safety notice, from the person\'s own messages', /needTallyOn\(\) && !flag && <NeedTally userTexts=\{messages\.filter\(\(m\) => m\.role === 'user'\)/.test(demo));
ok('the sealed route shows it too, computed in the page from the messages in the tab', /needTallyOn\(\) && !flag && <NeedTally userTexts=\{lines\.filter\(\(l\) => l\.role === 'user'\)/.test(sealed));
ok('the words say what it is: your own words, from a list, only on this page', /your own words/.test(NEED_TALLY_UI.note) && /not saved or sent/.test(NEED_TALLY_UI.note));
