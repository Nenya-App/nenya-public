// Rephrasing's message format (src/lib/rephraseProtocol.ts, src/lib/rephraseKinds.ts): every message round-trips, anything else
// is refused, and the largest legal message still fits the report limit.
import { decode, encode, PAD_SIZES, isRpKind, MAX_NOTE, MAX_PHRASE, MAX_REWRITE, MAX_TOTAL, newRoundId, RP_KINDS, textsOf, type MeantBody } from '../src/lib/rephraseProtocol.ts';
import { markMap, marksFromMap, plainWord, tokenize, TOKENIZER, type Mark } from '../src/lib/rephraseKinds.ts';
import { ok } from './helpers.mts';

const round = newRoundId();
ok('round ids are 8 hex characters and differ', /^[0-9a-f]{8}$/.test(round) && newRoundId() !== round);
ok('six kinds, each recognised, chat kinds are not', RP_KINDS.length === 6 && RP_KINDS.every(isRpKind) && !isRpKind('text') && !isRpKind('pause') && !isRpKind(5));

const marks: Mark[] = [[1, 2, 'saw'], [3, 3, 'story'], [6, 6, 'feeling']];
const cases: [Parameters<typeof encode>[0], unknown][] = [
  ['rp-ask', { round, tok: TOKENIZER }],
  ['rp-answer', { round, answer: 'yes' }],
  ['rp-answer', { round, answer: 'notnow' }],
  ['rp-answer', { round, answer: 'never' }],
  ['rp-phrase', { round, tok: TOKENIZER, phrase: 'You were late again, and I am tired of waiting.' }],
  ['rp-heard', { round, mode: 'send', marks, note: 'I heard worry.' }],
  ['rp-heard', { round, mode: 'keep' }],
  ['rp-heard', { round, mode: 'skip' }],
  ['rp-meant', { round, marks, rewrite: 'I felt tired waiting.', sliders: [{ need: 'rest', level: 3 }] }],
  ['rp-control', { round, step: 'done' }],
  ['rp-control', { step: 'away' }],
];
for (const [k, b] of cases) {
  const t = encode(k, b as never);
  ok(`${k} ${JSON.stringify(b).slice(0, 40)} round-trips`, JSON.stringify(decode(k, t)) === JSON.stringify(b));
}

const dec = (k: Parameters<typeof decode>[0], o: unknown) => decode(k, JSON.stringify(o));
ok('an unknown version is refused', dec('rp-ask', { v: 2, round, tok: TOKENIZER }) === null);
ok('a different tokenizer is refused', dec('rp-ask', { v: 1, round, tok: 'w2' }) === null && dec('rp-phrase', { v: 1, round, tok: 'w2', phrase: 'hi' }) === null);
ok('a bad round id is refused', dec('rp-ask', { v: 1, round: 'XYZ', tok: TOKENIZER }) === null && dec('rp-answer', { v: 1, answer: 'yes' }) === null);
ok('an answer that is not one of three is refused', dec('rp-answer', { v: 1, round, answer: 'maybe' }) === null);
ok('a phrase that is empty or too long is refused', dec('rp-phrase', { v: 1, round, tok: TOKENIZER, phrase: '  ' }) === null && dec('rp-phrase', { v: 1, round, tok: TOKENIZER, phrase: 'a'.repeat(MAX_PHRASE + 1) }) === null);
ok('a phrase of more than 200 words is refused', dec('rp-phrase', { v: 1, round, tok: TOKENIZER, phrase: 'a '.repeat(201) }) === null);
ok('a note or rewrite that is too long is refused', dec('rp-heard', { v: 1, round, mode: 'send', marks: [], note: 'n'.repeat(MAX_NOTE + 1) }) === null && dec('rp-meant', { v: 1, round, marks: [], rewrite: 'r'.repeat(MAX_REWRITE + 1) }) === null);
ok('marks must be [start, end, kind] with a known kind, in range', dec('rp-meant', { v: 1, round, marks: [[2, 1, 'saw']] }) === null && dec('rp-meant', { v: 1, round, marks: [[0, 0, 'angry']] }) === null && dec('rp-meant', { v: 1, round, marks: [[0, 500, 'saw']] }) === null && dec('rp-meant', { v: 1, round, marks: [[-1, 0, 'saw']] }) === null && dec('rp-meant', { v: 1, round, marks: [[0, 0]] }) === null && dec('rp-meant', { v: 1, round, marks: 'saw' }) === null);
ok('a sent reading needs marks; keep and skip must carry none', dec('rp-heard', { v: 1, round, mode: 'send' }) === null && dec('rp-heard', { v: 1, round, mode: 'keep', marks }) === null && dec('rp-heard', { v: 1, round, mode: 'skip', note: 'x' }) === null);
ok('sliders are checked', dec('rp-meant', { v: 1, round, marks: [], sliders: [{ need: 'rest', level: 5 }] }) === null && dec('rp-meant', { v: 1, round, marks: [], sliders: [{ need: '', level: 1 }] }) === null);
ok('control steps are checked', dec('rp-control', { v: 1, step: 'wipe' }) === null);
ok('fields the format does not know are dropped, not passed on', JSON.stringify(dec('rp-answer', { v: 1, round, answer: 'yes', extra: 'x', name: 'Sam' })) === JSON.stringify({ round, answer: 'yes' }));
ok('not JSON, an array, or over the report limit is refused', decode('rp-ask', 'nope') === null && decode('rp-ask', '[]') === null && decode('rp-ask', ' '.repeat(MAX_TOTAL + 1)) === null);
ok('encode refuses a body the format would refuse', (() => { try { encode('rp-answer', { round, answer: 'maybe' } as never); return false; } catch { return true; } })());

// The largest legal messages fit the report limit.
const wide = Array.from({ length: 199 }, (_, i) => [i, i, 'story'] as Mark);
const big: MeantBody = { round, marks: wide.slice(0, 120), rewrite: 'r'.repeat(MAX_REWRITE), sliders: Array.from({ length: 12 }, (_, i) => ({ need: 'n'.repeat(40) + i, level: 4 as const })).map((s) => ({ ...s, need: s.need.slice(0, 40) })) };
ok('the largest meant message is within the report limit', encode('rp-meant', big).length <= MAX_TOTAL, String(encode('rp-meant', big).length));
ok('the largest phrase message is within the report limit', encode('rp-phrase', { round, tok: TOKENIZER, phrase: 'w '.repeat(100).trim() + 'x'.repeat(0) }).length <= MAX_TOTAL);
ok('the largest reading is within the report limit', encode('rp-heard', { round, mode: 'send', marks: wide, note: 'n'.repeat(MAX_NOTE) }).length <= MAX_TOTAL, String(encode('rp-heard', { round, mode: 'send', marks: wide, note: 'n'.repeat(MAX_NOTE) }).length));

// Texts for the safety checks.
ok('textsOf lists the phrase, rewrite and note, nothing else', JSON.stringify(textsOf('rp-meant', encode('rp-meant', { round, marks, rewrite: 'R' }))) === '["R"]' && JSON.stringify(textsOf('rp-heard', encode('rp-heard', { round, mode: 'send', marks, note: 'N' }))) === '["N"]' && JSON.stringify(textsOf('rp-phrase', encode('rp-phrase', { round, tok: TOKENIZER, phrase: 'P q' }))) === '["P q"]');
ok('textsOf gives a chat message whole and nothing for broken rephrasing text', JSON.stringify(textsOf('text', 'hello')) === '["hello"]' && textsOf('rp-phrase', 'broken').length === 0);

// Words and marks.
ok('tokenize splits on any spaces and drops empties', JSON.stringify(tokenize('  You were\n late,  again ')) === '["You","were","late,","again"]');
ok('plainWord strips punctuation around a word and keeps a lone mark', plainWord('late,') === 'late' && plainWord('“hello!”') === 'hello' && plainWord('—') === '—');
const mm = markMap([[0, 1, 'saw'], [1, 1, 'story']]);
ok('markMap lets a later mark override and marksFromMap gives one mark per word in order', mm.get(0) === 'saw' && mm.get(1) === 'story' && JSON.stringify(marksFromMap(mm)) === '[[0,0,"saw"],[1,1,"story"]]');

// Padding: the length the mailbox sees is one of a few sizes.
const sizes = cases.map(([k, b]) => encode(k, b as never).length);
ok('every message is padded to one of the fixed sizes', sizes.every((n) => (PAD_SIZES as readonly number[]).includes(n)), sizes.join());
ok('short and long phrases of different lengths give the same size', encode('rp-phrase', { round, tok: TOKENIZER, phrase: 'a b c' }).length === encode('rp-phrase', { round, tok: TOKENIZER, phrase: 'word '.repeat(40).trim() }).length);
ok('a longer one steps up to the next size', encode('rp-phrase', { round, tok: TOKENIZER, phrase: 'word '.repeat(150).trim() }).length === 1024);
ok('padding is ignored on reading and never exceeds the report limit', JSON.stringify(decode('rp-answer', encode('rp-answer', { round, answer: 'yes' }))) === JSON.stringify({ round, answer: 'yes' }) && encode('rp-meant', big).length <= MAX_TOTAL);
ok('the filler is plain letters and holds nothing', /"pad":"x+"/.test(encode('rp-ask', { round, tok: TOKENIZER })));

const lockCases = [dec('rp-phrase', { v: 1, round, tok: TOKENIZER, phrase: 'hi there', lock: 'x'.repeat(65) }), dec('rp-phrase', { v: 1, round, tok: TOKENIZER, phrase: 'hi there', lock: '' }), dec('rp-meant', { v: 1, round, marks: [], lockKey: 'k'.repeat(65) })];
ok('a lock or key that is empty or too long is refused', lockCases.every((x) => x === null));
ok('a lock and a key round-trip', decode('rp-phrase', encode('rp-phrase', { round, tok: TOKENIZER, phrase: 'hi there', lock: 'AAAA' }))?.lock === 'AAAA' && decode('rp-meant', encode('rp-meant', { round, marks, lockKey: 'BBBB' }))?.lockKey === 'BBBB');
