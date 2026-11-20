// The comparison (src/lib/rephraseCompare.ts) and the words (src/lib/rephraseWords.ts): the four plain statements only, the same
// on both devices, no numbers or verdicts anywhere, the CNVC credit exact.
import { compare, sectionLine, statement, type Comparison } from '../src/lib/rephraseCompare.ts';
import { ANNOUNCE, CATEGORIES_NOTE, CNVC_CREDIT, EXTENSION_NOTE, KIND_PLAIN, NOTICES, WORDS } from '../src/lib/rephraseWords.ts';
import { KINDS, type Mark } from '../src/lib/rephraseKinds.ts';
import { ok } from './helpers.mts';

const phrase = 'You were late again, and I am tired of waiting.';
const S: Mark[] = [[1, 2, 'saw'], [3, 3, 'story'], [7, 7, 'feeling'], [9, 9, 'saw']];
const H: Mark[] = [[2, 2, 'saw'], [3, 3, 'story'], [7, 7, 'feeling'], [9, 9, 'story'], [4, 4, 'request']];
const onSpeaker = compare(phrase, S, H, 'speaker');
const onHearer = compare(phrase, S, H, 'hearer');

ok('words are the same split on both sides', JSON.stringify(onSpeaker.words) === JSON.stringify(onHearer.words) && onSpeaker.words.length === 10);
ok('rows are in word order and only for words someone marked', onSpeaker.rows!.map((r) => r.index).join() === '1,2,3,4,7,9' && onSpeaker.rows!.every((r) => r.speaker || r.hearer));
ok('every row is one of the four relations', onSpeaker.rows!.map((r) => r.relation).join() === 'only-speaker,same,same,only-hearer,same,different');
ok('both devices compute the same rows (relation, word, kinds), worded for the viewer', JSON.stringify(onSpeaker.rows!.map((r) => [r.index, r.word, r.speaker, r.hearer, r.relation])) === JSON.stringify(onHearer.rows!.map((r) => [r.index, r.word, r.speaker, r.hearer, r.relation])));
ok('the statements read right for each viewer', onSpeaker.rows![0].text === 'Marked only by you.' && onHearer.rows![0].text === 'Marked only by them.' && onSpeaker.rows![3].text === 'Marked only by them.' && onHearer.rows![3].text === 'Marked only by you.');
ok('"different" names both kinds, the speaker first, and calls the hearer\'s guess a guess', onSpeaker.rows![5].text === 'Marked by both of you, as different kinds. You: what was seen or heard. They: a story.' && onHearer.rows![5].text === 'Marked by both of you, as different kinds. They: what was seen or heard. You: a story.' && statement('different', 'story', 'feeling', 'hearer') === 'Marked by both of you, as different kinds. They: a story. You: a guess at a feeling.');
ok('"same" names the kind and nothing else', onSpeaker.rows![1].text === 'Marked the same way by both of you (what was seen or heard).');
ok('sections are in the fixed order of the kinds (the workbench order)', onSpeaker.speaker.map((s) => s.kind).join() === 'saw,feeling,story' && onSpeaker.hearer!.map((s) => s.kind).join() === 'saw,feeling,request,story');
ok('a hearer\'s feelings are called guesses in the sentence', sectionLine({ kind: 'feeling', words: ['tired'] }, true) === 'A guess at a feeling: tired.' && sectionLine({ kind: 'feeling', words: ['tired'] }, false) === 'A feeling: tired.');
const kept = compare(phrase, S, null, 'speaker');
ok('with no reading of the hearer there are no rows and no hearer sections', kept.rows === null && kept.hearer === null && kept.speaker.length === 3);
ok('nothing marked by either gives no rows, which is a normal state', compare(phrase, [], [], 'speaker').rows!.length === 0);

// No numbers, no verdicts, no ranking in anything a person reads.
const BANNED = /\b(wrong|incorrect|mismatch(?:es|ed)?|missed|misunderstood|misread|agree(?:d|ment|s)?|disagree\w*|score[sd]?|scoring|gap|accurate|accuracy|correct(?:ly)?|right one|better|worse|best|worst|match(?:es|ed)?|similar|similarity|percent|grade[sd]?|rate[sd]?|rating|rank\w*|win|lose|fault|blame|should have|failed)\b|%|\d/i;
const strings = (o: unknown): string[] => (typeof o === 'string' ? [o] : typeof o === 'function' ? [] : Array.isArray(o) ? o.flatMap(strings) : o && typeof o === 'object' ? Object.values(o).flatMap(strings) : []);
const all = [...strings(WORDS), ...strings(NOTICES), ...strings(KIND_PLAIN), ...strings(ANNOUNCE), WORDS.minutesLeft(15).replace(/\d+/, 'N'), ...KINDS.flatMap((k) => [k.name, k.desc, k.short])];
// The one number allowed is the national hotline in the first-use screen.
const hits = all.filter((t) => BANNED.test(t.replace('Neither is the right one.', '').replace('call or text 988', 'call or text the hotline')));
ok('no word of the screens scores, judges, ranks, or counts (checked over every string)', hits.length === 0, hits.slice(0, 3).join(' | '));
const rowsText = (c: Comparison) => (c.rows ?? []).map((r) => r.text).join(' ');
ok('no statement in a comparison has a number or a verdict', !BANNED.test(rowsText(onSpeaker)) && !BANNED.test(rowsText(onHearer)));
ok('"Neither is the right one." is the only mention of right, and it is a refusal to rank', WORDS.compareHint === 'Neither is the right one.' && all.filter((t) => /right/i.test(t) && !/Neither is the right one/.test(t)).length === 0);

// Credit and wording.
ok('the CNVC credit line is exact and the extension note says what it is', CNVC_CREDIT === 'The Center for Nonviolent Communication © 2023, www.CNVC.org' && /project extension/.test(EXTENSION_NOTE) && CATEGORIES_NOTE.includes(CNVC_CREDIT));
ok('every kind has a plain one-line description and a text label', KINDS.length === 8 && KINDS.every((k) => k.desc.length > 10 && k.short.length > 2 && k.glyph.length === 1 && k.name.length > 5));
ok('the cues differ between kinds (a mark is never colour alone)', new Set(KINDS.map((k) => k.cue)).size === 8 && new Set(KINDS.map((k) => k.glyph)).size === 8);
ok('the first-use screen says what cannot be stopped, what is checked, what is not, and the hotline', WORDS.firstPoints.some((p) => /copy or screenshot/.test(p)) && WORDS.firstPoints.some((p) => /can miss things/.test(p)) && WORDS.firstPoints.some((p) => /988/.test(p)) && WORDS.firstPoints.some((p) => /two devices/.test(p)) && WORDS.firstPoints.some((p) => /not therapy/.test(p)));
ok('no notice gives a reason or names who declined beyond "they"', Object.values(NOTICES).every((t) => !/because|reason:|refus|ignored|rejected/i.test(t)));
ok('the report notice says exactly what is revealed and that the reporter is not named', /exactly as it arrived/.test(WORDS.reportExplain) && /every word/.test(WORDS.reportExplain) && /does not tell them who reported/.test(WORDS.reportExplain));
ok('arrival announcements carry no phrase words', !/phrase:/.test(ANNOUNCE.phrase) && ANNOUNCE.phrase.length < 80 && ANNOUNCE.ask.length < 100);
ok('English only: plain ASCII letters apart from typographic quotes, dashes and the copyright sign', all.every((t) => /^[\x20-\x7E‘’“”—©■○▲◆✦]*$/.test(t)));
