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

// ── the invitation to send feedback ──
import { INVITATION_TEXT } from '../src/lib/siteMessages.ts';
const crit = (c: string) => { const m: any[] = []; for (let i = 1; i <= 5; i++) m.push(u(i === 3 ? c : `message ${i}`), a(`reply ${i}`)); return m; };
const withInv = (m: any[]) => siteMessagesFor(m, 5).some((x) => x.kind === 'invitation');
ok('a finished conversation with a critique ends with the closing message and then the invitation', siteMessagesFor(crit('NVC is just manipulation with nicer words.'), 5).map((x) => x.kind).join() === 'greeting,closing,invitation' && siteMessagesFor(crit("That wasn't very helpful."), 5).at(-1)!.text === INVITATION_TEXT);
ok('critique of a reply, of the site, of NVC and of AI use all get it', ['That wasn\'t very helpful.', 'This site is pointless.', 'NVC is a cult.', "An AI shouldn't be doing this."].every((c) => withInv(crit(c))));
ok('no invitation without a critique, or for abuse', !withInv(crit('A normal message')) && !withInv(crit('You are a useless piece of garbage bot.')));
ok('no invitation while the conversation is still going', !withInv([u('NVC is a cult.'), a('hm')]));
ok('no invitation when a message was flagged (distress comes first)', !withInv([...crit('NVC is a cult.').slice(0, 8), u('I feel so hopeless'), a('Reply 5')]));
ok('the invitation is an invitation: nothing is sent unless the person chooses', /up to you/.test(INVITATION_TEXT) && /nothing is sent unless you choose/.test(INVITATION_TEXT) && !/please|must|should/i.test(INVITATION_TEXT));

// ── replies the site replaced with a fixed sentence are marked as written by the site
{
  const { INFRA_FALLBACK } = await import('../src/lib/infraGuard.ts');
  const { PERSONA_FALLBACK } = await import('../src/lib/personaGuard.ts');
  const msgs = (reply: string) => [{ role: 'user' as const, content: 'Do you have kids?' }, { role: 'assistant' as const, content: reply }];
  const a = siteMessagesFor(msgs(PERSONA_FALLBACK), 5).filter((x) => x.kind === 'replacement');
  ok('a reply replaced by the persona guard is marked as written by the site', a.length === 1 && a[0].after === 1 && /not by the AI/.test(a[0].text) && /human life/.test(a[0].text));
  const b = siteMessagesFor(msgs(INFRA_FALLBACK), 5).filter((x) => x.kind === 'replacement');
  ok('a reply replaced by the infrastructure and data guard is marked too', b.length === 1 && /how Nenya runs or what happens to your data/.test(b[0].text));
  ok('an ordinary reply is not marked', siteMessagesFor(msgs('What is it like for you?'), 5).every((x) => x.kind !== 'replacement'));
  const { LEGAL_PARTS } = await import('../src/lib/legalDocument.ts');
  const terms = JSON.stringify(LEGAL_PARTS);
  ok('the Terms list the replacement and say a signed transcript marks it', /replace the AI.s whole reply with a short fixed sentence/.test(terms) && /marks a reply replaced this way as written by the site/.test(terms));
}

// Edits the site made to a reply (a sentence added, sentences removed) are marked after that reply.
{
  const { mirrorRemovals, withoutMirroring } = await import('../src/lib/valuesRule.ts');
  const conv = [u('I hate them'), a('Here is a reply.')];
  const e = siteMessagesFor(conv, 5, [], '', [], [{ after: 1, kind: 'added', n: 1 }, { after: 1, kind: 'removed', n: 2 }]).filter((x) => x.kind === 'edit');
  ok('an added sentence and removed sentences are each marked after the reply', e.length === 2 && e.every((x) => x.after === 1) && /added the opening sentence/.test(e[0].text) && /removed 2 sentences/.test(e[1].text));
  ok('with no edits nothing is marked', siteMessagesFor(conv, 5).every((x) => x.kind !== 'edit'));
  const r = 'I hear how angry you are. That makes sense, you hate them. What do you need?';
  ok('the removal count matches what withoutMirroring takes out', mirrorRemovals(r) === r.split(/(?<=[.!?])\s+/).length - withoutMirroring(r).split(/(?<=[.!?])\s+/).length);
}
