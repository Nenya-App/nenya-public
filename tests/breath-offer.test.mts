// A coach reply that suggests a breath offers the breathing tool under it: the pop-out only. No new-tab link (owner, 2026-11-15):
// Emergency Exit cannot close a tab it did not open, so nothing in the coach opens another tab to the tool.
import { readFileSync } from 'node:fs';
import { suggestsBreath } from '../src/lib/breathOffer.ts';
import { ok } from './helpers.mts';
const coach = readFileSync('src/coach/CoachDemo.tsx', 'utf8');
const page = readFileSync('src/coach/CoachPage.tsx', 'utf8');

ok('a reply that suggests a breath is recognized', ['Would it help to take a slow breath before you talk to her?', 'You could breathe out slowly first.', 'A few deep breaths might help.', 'Try a longer exhale.'].every(suggestsBreath));
ok('an ordinary reply is not', !['It sounds like you felt unseen in that meeting.', 'Is there someone you trust you could reach out to?'].some(suggestsBreath));
ok('the offer appears only under the coach\'s replies, and opens nothing by itself', /m\.role === 'assistant' && suggestsBreath\(m\.content\)/.test(coach) && /onClick=\{\(\) => setBreathingPanel\(true\)\}/.test(coach));
ok('there is no new-tab link to the breathing tool (Emergency Exit could not close it)', !/href="\/" target="_blank"/.test(coach) && !/breathing tool in a new tab/.test(coach));
ok('the offer meets the 44px target size', /setBreathingPanel\(true\)\} className=\{`\$\{linkClass\} min-h-11`\}/.test(coach));
ok('the /coach page opens the same shared panel the logos use, so the offer works there too', /useBreathingPanel\(\)/.test(page) && /onBreathingPopoutToggle=\{toggleBreathingPanel\}/.test(page) && !/useState\(false\);\s*$/m.test(page.split('useBreathingPanel')[0].slice(-200)));
