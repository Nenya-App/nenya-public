// The words the site itself shows in a conversation, and the process notes on why a message was flagged: what a signed transcript carries
// so that it shows exactly what the visitor was shown.
import { siteMessagesFor, checkNotesFor, greetingText, CLOSING_TEXT } from '../src/lib/siteMessages.ts';
import { explainConversation, checkConversation } from '../src/lib/safetyFlags.ts';
import { readableTranscript } from '../src/lib/transcript.ts';
import { ok } from './helpers.mts';

const u = (c: string) => ({ role: 'user' as const, content: c });
const a = (c: string) => ({ role: 'assistant' as const, content: c });
const five: any[] = [];
for (let i = 1; i <= 5; i++) five.push(u(`message ${i}`), a(`reply ${i}`));

ok('the greeting is always there, first', siteMessagesFor([u('hello')], 5)[0].kind === 'greeting' && siteMessagesFor([u('hello')], 5)[0].after === -1 && siteMessagesFor([u('hello')], 5)[0].text === greetingText(5));
ok('a conversation in progress shows only the greeting', siteMessagesFor([u('hello'), a('hi'), u('more')], 5).length === 1);
const done = siteMessagesFor(five, 5);
ok('five finished exchanges add the closing message after the last reply', done.length === 2 && done[1].kind === 'closing' && done[1].after === 9 && done[1].text === CLOSING_TEXT);
const soft = [u('I feel so hopeless'), a('That sounds heavy.')];
const sf = siteMessagesFor(soft, 5);
ok('a message flagged but not stopped shows the notice with resources, as the page does', sf.length === 2 && sf[1].kind === 'notice' && sf[1].after === 1 && sf[1].resources!.length >= 4);
const softDone = [...five.slice(0, 8), u('I feel so hopeless'), a('Reply 5')];
ok('a finished conversation with a flag shows the notice and not the closing message', siteMessagesFor(softDone, 5).map((x) => x.kind).join() === 'greeting,notice');
const stopped = [u('I am going to kill myself tonight')];
ok('a stopped message gets the notice right after it', siteMessagesFor(stopped, 5).map((x) => `${x.kind}@${x.after}`).join() === 'greeting@-1,notice@0');

// process notes
const n1 = checkNotesFor(stopped);
ok('a note says which words matched a phrase list', n1.length === 1 && n1[0].source === 'phrase' && /kill myself/i.test(n1[0].matched!) && n1[0].tier === 'stop' && n1[0].message === 0);
ok('a message that is not flagged has no note', checkNotesFor([u('I had a hard day'), a('Tell me more.')]).length === 0);
const lad = [u('I used to self-harm as a teenager.'), a('r'), u('Work has been hard.'), a('r'), u('I did it again last night.')];
const nl = checkNotesFor(lad);
ok('the self-injury ladder explains its rung and which earlier messages count', nl.some((x) => x.source === 'ladder' && x.rung === 'escalates' && x.tier === 'stop' && x.message === 4 && JSON.stringify(x.basedOn) === '[1]'), JSON.stringify(nl));
ok('an earlier general account has its own note', nl.some((x) => x.message === 0 && x.rung === 'a general account' && x.tier === 'soften'));
ok('the explanation never changes the decision', ['I am going to kill myself tonight', 'I feel so hopeless', 'I had a hard day', 'I cut myself again tonight'].every((t) => JSON.stringify(checkConversation([t])) === JSON.stringify(explainConversation([t])?.flag ?? null)));
ok('matched words are cut short', (explainConversation(['I feel ' + 'x'.repeat(10) + ' so hopeless'])?.why.matched ?? '').length <= 120);

// readable copy
const rt = readableTranscript(stopped, { color1: '#111111', color2: '#222222' }, null, '', undefined, siteMessagesFor(stopped, 5), checkNotesFor(stopped));
ok('the readable copy shows the greeting before and the notice after, marked as written by the site', rt.indexOf('Coach (written by the site, not the AI): Hello.') < rt.indexOf('You: I am going') && rt.indexOf('You: I am going') < rt.indexOf('Safety notice (written by the site, not the AI)') && rt.includes('  - 988 Suicide & Crisis Lifeline (US): Call or text 988, any time'));
ok('and the process note says what matched and that the check can be wrong', rt.includes('Process note (written by the site): the safety check flagged this message as self-harm (stop). Why: matched words in the message: "kill myself".') && rt.includes('can be wrong'));
