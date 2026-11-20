// The round's rules (src/lib/rephraseRound.ts): every legal step moves on, every illegal one is ignored, and the blind-then-reveal
// order holds on each side.
import { heardVisible, initialState, readings, step, type Event, type RoundState } from '../src/lib/rephraseRound.ts';
import { TOKENIZER, type Mark } from '../src/lib/rephraseKinds.ts';
import { ok } from './helpers.mts';

const ID = 'a1b2c3d4';
const M: Mark[] = [[2, 2, 'saw'], [3, 3, 'story']];
const H: Mark[] = [[2, 2, 'saw'], [6, 6, 'feeling']];
const run = (s: RoundState, e: Event) => step(s, e);

// Two devices, driven by each other's outgoing messages.
let sp = initialState();
let hr = initialState();
const send = (from: 'sp' | 'hr', e: Event) => {
  const r = run(from === 'sp' ? sp : hr, e);
  if (from === 'sp') sp = r.state; else hr = r.state;
  if (r.send) {
    const t = run(from === 'sp' ? hr : sp, { t: 'in', kind: r.send.kind, body: r.send.body } as Event);
    if (from === 'sp') hr = t.state; else sp = t.state;
  }
  return r;
};

ok('a speaker asks: no words in the ask', JSON.stringify(send('sp', { t: 'ask', id: ID }).send) === JSON.stringify({ kind: 'rp-ask', body: { round: ID, tok: TOKENIZER } }));
ok('the hearer is deciding and holds no phrase', hr.round?.phase === 'deciding' && hr.round.phrase === undefined);
ok('the hearer cannot send a phrase or a reading yet', !run(hr, { t: 'sendHeard', mode: 'skip', ownMarks: [] }).ok && !run(hr, { t: 'reveal', meant: { marks: M } }).ok);
ok('the speaker cannot send the phrase before a yes', !run(sp, { t: 'sendPhrase', phrase: 'hello there' }).ok);
send('hr', { t: 'answer', answer: 'yes' });
ok('after a yes the speaker may send the phrase', sp.round?.phase === 'accepted' && hr.round?.phase === 'waiting-phrase');
ok('an empty phrase is not sent', !run(sp, { t: 'sendPhrase', phrase: '   ' }).ok);
send('sp', { t: 'sendPhrase', phrase: 'You were late again, and I am tired of waiting.' });
ok('the hearer now holds the phrase, and nothing of the speaker\'s marks', hr.round?.phase === 'hearing' && !!hr.round.phrase && hr.round.meant === undefined && JSON.stringify(hr).indexOf('"story"') === -1);
send('hr', { t: 'sendHeard', mode: 'send', ownMarks: H, sendMarks: [[2, 2, 'saw']], note: 'I heard worry.' });
ok('the speaker holds the reading but may not show it yet', sp.round?.phase === 'answered' && heardVisible(sp) === null && readings(sp) === null);
ok('what the hearer chose to send is all the speaker has', JSON.stringify(sp.round?.heard?.marks) === JSON.stringify([[2, 2, 'saw']]) && JSON.stringify(hr.round?.ownMarks) === JSON.stringify(H));
send('sp', { t: 'reveal', meant: { marks: M, rewrite: 'I felt tired.' } });
ok('after the reveal both devices can show both readings', sp.round?.phase === 'revealed' && hr.round?.phase === 'compared' && readings(sp)?.heard?.length === 1 && readings(hr)?.heard?.length === 2);
ok('the hearer sees what the speaker meant, and the speaker the note', JSON.stringify(readings(hr)?.meant.marks) === JSON.stringify(M) && readings(sp)?.note === 'I heard worry.' && readings(hr)?.meant.rewrite === 'I felt tired.');
ok('a second reveal is refused', !run(sp, { t: 'reveal', meant: { marks: M } }).ok);
send('hr', { t: 'done' });
ok('done clears both, with a notice and no reason', sp.round === null && hr.round === null && sp.notice === 'partner-done' && hr.notice === 'done');

// Branches.
const fresh = () => { sp = initialState(); hr = initialState(); };
fresh(); send('sp', { t: 'ask', id: ID }); send('hr', { t: 'answer', answer: 'notnow' });
ok('"Not now" clears both and nothing was shown', sp.round === null && hr.round === null && sp.notice === 'partner-notnow' && hr.notice === 'said-notnow' && !sp.asksBlocked);
send('sp', { t: 'ask', id: 'b1b2c3d4' });
ok('the speaker may ask again after "Not now"', hr.round?.phase === 'deciding');
send('hr', { t: 'answer', answer: 'never' });
ok('"Not in this cell" blocks further asks from the speaker', sp.asksBlocked && hr.ignoreAsks && !run(sp, { t: 'ask', id: 'c1b2c3d4' }).ok);
const late = run(hr, { t: 'in', kind: 'rp-ask', body: { round: 'c1b2c3d4', tok: TOKENIZER } });
ok('a modified page that asks anyway is ignored', !late.ok && late.state.round === null);

fresh(); send('sp', { t: 'ask', id: ID });
send('sp', { t: 'cancel' });
ok('the speaker can cancel an ask and the hearer is cleared', sp.round === null && hr.round === null && sp.notice === 'cancelled' && hr.notice === 'partner-done');
ok('cancel is only for an ask nobody has answered', !run(initialState(), { t: 'cancel' }).ok);

fresh(); send('sp', { t: 'ask', id: ID }); send('hr', { t: 'answer', answer: 'yes' }); send('sp', { t: 'sendPhrase', phrase: 'Hello there friend' });
send('hr', { t: 'sendHeard', mode: 'keep', ownMarks: H });
ok('"keep" sends no marks: the speaker holds nothing, the hearer keeps theirs', sp.round?.heard?.mode === 'keep' && sp.round.heard.marks === undefined && hr.round?.ownMarks?.length === 2);
send('sp', { t: 'reveal', meant: { marks: M } });
ok('with "keep" the hearer compares, the speaker sees only their own side', readings(hr)?.heard?.length === 2 && readings(sp)?.heard === null);
fresh(); send('sp', { t: 'ask', id: ID }); send('hr', { t: 'answer', answer: 'yes' }); send('sp', { t: 'sendPhrase', phrase: 'Hello there friend' }); send('hr', { t: 'sendHeard', mode: 'skip', ownMarks: H });
send('sp', { t: 'reveal', meant: { marks: M } });
ok('with "skip" neither side has a reading of the hearer', readings(hr)?.heard === null && readings(sp)?.heard === null && hr.round?.ownMarks?.length === 0);

// Illegal steps are ignored.
fresh();
const bad: Event[] = [
  { t: 'in', kind: 'rp-answer', body: { round: ID, answer: 'yes' } },
  { t: 'in', kind: 'rp-phrase', body: { round: ID, tok: TOKENIZER, phrase: 'sneaky' } },
  { t: 'in', kind: 'rp-heard', body: { round: ID, mode: 'skip' } },
  { t: 'in', kind: 'rp-meant', body: { round: ID, marks: M } },
  { t: 'in', kind: 'rp-control', body: { round: ID, step: 'done' } },
  { t: 'in', kind: 'rp-ask', body: { round: ID, tok: 'w9' } },
  { t: 'done' }, { t: 'answer', answer: 'yes' }, { t: 'sendPhrase', phrase: 'hi there' }, { t: 'reveal', meant: { marks: M } },
];
ok('with no round, every step but a first ask is ignored', bad.every((e) => !run(initialState(), e).ok));
send('sp', { t: 'ask', id: ID });
ok('a second ask while one is open is ignored on both sides', !run(sp, { t: 'ask', id: 'd1b2c3d4' }).ok && !run(hr, { t: 'in', kind: 'rp-ask', body: { round: 'd1b2c3d4', tok: TOKENIZER } }).ok);
ok('an answer for another round is ignored', !run(sp, { t: 'in', kind: 'rp-answer', body: { round: 'd1b2c3d4', answer: 'yes' } }).ok);
ok('an answer that arrives at the hearer is ignored', !run(hr, { t: 'in', kind: 'rp-answer', body: { round: ID, answer: 'yes' } }).ok);
ok('a heard before a phrase is ignored by the speaker', !run(sp, { t: 'in', kind: 'rp-heard', body: { round: ID, mode: 'skip' } }).ok);
ok('a meant that arrives before the hearer has returned is ignored', !run(hr, { t: 'in', kind: 'rp-meant', body: { round: ID, marks: M } }).ok);
ok('a stale "done" for another round is ignored', !run(hr, { t: 'in', kind: 'rp-control', body: { round: 'e1e2e3e4', step: 'done' } }).ok);

// Stop and away.
send('hr', { t: 'stop' });
ok('stop clears both and says so, and is allowed with no round', sp.round === null && hr.round === null && sp.notice === 'partner-stopped' && hr.notice === 'stopped' && run(initialState(), { t: 'stop' }).ok);
send('sp', { t: 'ask', id: 'f1f2f3f4' });
ok('after a stop a new round can begin', hr.round?.phase === 'deciding');
const away = run(hr, { t: 'in', kind: 'rp-control', body: { step: 'away' } });
ok('away and back are noted and change no round', away.state.partnerAway && away.state.round === hr.round && !run(away.state, { t: 'in', kind: 'rp-control', body: { step: 'back' } }).state.partnerAway);
ok('the machine never mutates the state it is given', (() => { const s = initialState(); const j = JSON.stringify(s); step(s, { t: 'ask', id: ID }); return JSON.stringify(s) === j; })());

// Two asks at the same moment: one yields, the same way on both devices.
fresh();
const x = run(sp, { t: 'ask', id: 'a0000000' }); sp = x.state;
const y = run(hr, { t: 'ask', id: 'b0000000' }); hr = y.state;
sp = run(sp, { t: 'in', kind: 'rp-ask', body: { round: 'b0000000', tok: TOKENIZER } }).state;
hr = run(hr, { t: 'in', kind: 'rp-ask', body: { round: 'a0000000', tok: TOKENIZER } }).state;
ok('when both ask at once the lower id stays the speaker and the other becomes the hearer', sp.round?.side === 'speaker' && sp.round.id === 'a0000000' && hr.round?.side === 'hearer' && hr.round.id === 'a0000000' && hr.round.phase === 'deciding');
