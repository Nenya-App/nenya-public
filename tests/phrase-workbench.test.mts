// The phrase workbench's pure core (docs/phrase-workbench-scope.md): tokens, marks, levels, plain-text annotation, keeping and restoring.
import * as core from '../src/lib/phraseWorkbench.ts';
import { tokenize, createWorkbench, addMark, removeMark, clearMarks, setDetail, setLevel, marksFor, textOf, markLabel, levelName, levelSpoken, annotated, serialize, parse, overBy, MAX_SENTENCE, MAX_MARKS } from '../src/lib/phraseWorkbench.ts';
import { ok } from './helpers.mts';

const S = 'When you left again without telling me, I felt hurt and uneasy, because I need to count on you.';

// tokenize
const t = tokenize(S);
ok('words and punctuation become tokens; punctuation is not markable', t.some((x) => x.text === ',' && !x.markable) && t.filter((x) => x.markable).length === 19);
ok('token places match the sentence', t.every((x) => S.slice(x.start, x.end) === x.text));
ok('a contraction and a hyphenated word stay one token', tokenize("don't worry, well-being").filter((x) => x.markable).map((x) => x.text).join('|') === "don't|worry|well-being");
ok('empty, non-string and emoji input do not throw', tokenize('').length === 0 && tokenize(undefined as unknown as string).length === 0 && tokenize('😀 ok 日本語').filter((x) => x.markable).length === 2);
ok('overBy counts characters past the limit', overBy('a'.repeat(MAX_SENTENCE)) === 0 && overBy('a'.repeat(MAX_SENTENCE + 7)) === 7);
ok('a sentence over the limit is cut at the limit', createWorkbench('a '.repeat(500)).sentence.length === MAX_SENTENCE);

// marks
const hurt = t.find((x) => x.text === 'hurt')!.id, uneasy = t.find((x) => x.text === 'uneasy')!.id, need = t.find((x) => x.text === 'count')!.id;
let w = createWorkbench(S);
const w0 = w;
w = addMark(w, { kind: 'feeling', from: hurt, to: hurt });
ok('a mark is added with a stable id, and the old state is not changed', w.marks.length === 1 && w.marks[0].id === 1 && w0.marks.length === 0);
w = addMark(w, { kind: 'feeling', from: uneasy, to: uneasy });
w = addMark(w, { kind: 'saw', from: hurt, to: uneasy });
ok('the same kind twice, and different kinds on the same words, are allowed', w.marks.length === 3 && marksFor(w, hurt).length === 2);
ok('textOf gives the words as typed, and a phrase keeps its spacing', textOf(w, w.marks[2]) === 'hurt and uneasy');
const bad = addMark(w, { kind: 'feeling', from: 0, to: 999 });
ok('a range outside the sentence changes nothing', bad === w);
const comma = t.find((x) => x.text === ',')!.id;
ok('punctuation cannot be marked', addMark(w, { kind: 'feeling', from: comma, to: comma }) === w);
ok('an unknown kind changes nothing', addMark(w, { kind: 'bogus' as never, from: hurt, to: hurt }) === w);
ok('a reversed range is put in order', addMark(w, { kind: 'story', from: uneasy, to: hurt }).marks[3].from === hurt);
ok('removing an id that does not exist changes nothing; removing one works', removeMark(w, 99) === w && removeMark(w, 1).marks.length === 2);
ok('removed ids are not reused', addMark(removeMark(w, 3), { kind: 'saw', from: hurt, to: hurt }).marks.at(-1)!.id === 4);
ok('clearMarks empties them', clearMarks(w).marks.length === 0);
let many = createWorkbench(S);
for (let i = 0; i < MAX_MARKS + 10; i++) many = addMark(many, { kind: 'saw', from: hurt, to: hurt });
ok('there is a ceiling on marks', many.marks.length === MAX_MARKS);

// details and levels
let n = addMark(createWorkbench(S), { kind: 'need', from: need, to: need + 2 });
const id = n.marks[0].id;
ok('a level starts unmarked', n.marks[0].level === undefined && levelName(n.marks[0].level) === 'Not marked yet' && levelSpoken(undefined) === 'Not marked yet');
n = setLevel(n, id, 4);
ok('setLevel sets a step and names it; the position is only spoken', n.marks[0].level === 4 && levelName(4) === 'Mostly' && levelSpoken(4) === 'Mostly, step 5 of 7');
ok('levels outside 0 to 6 or not whole are ignored', setLevel(n, id, 7) === n && setLevel(n, id, -1) === n && setLevel(n, id, 2.5) === n);
ok('null clears a level', setLevel(n, id, null).marks[0].level === undefined);
const f = addMark(createWorkbench(S), { kind: 'feeling', from: hurt, to: hurt });
ok('only a need mark can carry a level', setLevel(f, f.marks[0].id, 3) === f);
n = setDetail(n, id, { category: 'Connection', family: 'Being able to count', word: 'trust', custom: '  my own\u0000 word ' });
ok('detail keeps what the person chose, cleaned', n.marks[0].detail?.word === 'trust' && n.marks[0].detail?.custom === 'my own word');
ok('markLabel names the mark in the person’s own terms', markLabel(n.marks[0]) === 'A need: Connection, Being able to count, trust, my own word' && markLabel(f.marks[0]) === 'A feeling');
ok('detail can be cleared', setDetail(n, id, null).marks[0].detail === undefined);

// annotated
const a = annotated(w);
ok('annotated puts the mark names in brackets after the marked words, in order', a.includes('hurt [a feeling]') && a.includes('uneasy [a feeling] [saw or heard]') || a.includes('uneasy [saw or heard] [a feeling]'));
ok('an unmarked sentence is returned as typed', annotated(createWorkbench(S)) === S);

// keep and restore
const kept = serialize(n)!;
const back = parse(kept)!;
ok('a record round-trips', back.sentence === S && back.marks.length === 1 && back.marks[0].level === 4 && back.marks[0].detail?.word === 'trust');
ok('the record has no time, counter, history or identifier', JSON.stringify(Object.keys(JSON.parse(kept)).sort()) === '["marks","sentence","v"]' && (JSON.parse(kept).marks as object[]).every((m) => Object.keys(m).every((k) => ['id', 'kind', 'from', 'to', 'detail', 'level'].includes(k))));
ok('a record that is not one gives null', parse('nope') === null && parse('[]') === null && parse('{"v":2,"sentence":"a"}') === null && parse(null) === null && parse('x'.repeat(9000)) === null);
const hostile = JSON.stringify({ v: 1, sentence: S, marks: [{ kind: 'need', from: 0, to: 99999 }, { kind: 'evil', from: 0, to: 0 }, { kind: 'feeling', from: hurt, to: hurt, level: 3, __proto__: { x: 1 }, extra: 'x' }, { kind: 'need', from: need, to: need, level: 99 }, 5, null], __proto__: { polluted: true } });
const hb = parse(hostile)!;
ok('hostile or ragged records keep only what fits', hb.marks.length === 2 && hb.marks[0].kind === 'feeling' && hb.marks[0].level === undefined && hb.marks[1].level === undefined && !('polluted' in {}));
ok('a record too large to keep gives null', serialize({ sentence: S, next: 1, marks: Array.from({ length: 60 }, (_, i) => ({ id: i + 1, kind: 'need' as const, from: 0, to: 1, detail: { custom: 'x'.repeat(60), word: 'y'.repeat(60), family: 'z'.repeat(60), category: 'q'.repeat(60) } })) }) === null);

// No scoring
const names = Object.keys(core);
ok('nothing is exported that scores, totals, ranks or tracks', !names.some((x) => /score|total|average|progress|streak|rank|count|trend|grade|rate/i.test(x)), names.join(','));
