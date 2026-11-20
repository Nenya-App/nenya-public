// "Remember on this device" for the phrase workbench: off by default, one record, no time or counter, validated on the way back, removed by Forget and by Forget me.
const store: Record<string, string> = {};
(globalThis as any).localStorage = { get length() { return Object.keys(store).length; }, key: (i: number) => Object.keys(store)[i] ?? null, getItem: (k: string) => (k in store ? store[k] : null), setItem: (k: string, v: string) => { store[k] = String(v); }, removeItem: (k: string) => { delete store[k]; } };
(globalThis as any).window = { addEventListener() {}, removeEventListener() {} };
import { ok } from './helpers.mts';
import { PHRASES_KEY, forgetPhrases, keepPhrases, loadPhrases, phrasesKept } from '../src/lib/workbenchMemory.ts';
import { addMark, createWorkbench, setLevel } from '../src/lib/phraseWorkbench.ts';
import { initialView, reduce } from '../src/lib/workbenchView.ts';
const dm = await import('../src/lib/deviceMemory.ts');

ok('nothing is kept by default', !phrasesKept() && loadPhrases() === null && Object.keys(store).length === 0);
const run = (s: ReturnType<typeof initialView>, ...as: Parameters<typeof reduce>[1][]) => as.reduce(reduce, s);
ok('the switch starts off, and turning it on or off is announced', initialView().remember === false && /Kept on this device/.test(run(initialView(), { t: 'remember', on: true }).announce));

let w = addMark(createWorkbench('I need rest, and I felt tired.'), { kind: 'need', from: 2, to: 2, detail: { category: 'Physical wellbeing', word: 'rest' } });
w = setLevel(w, w.marks[0].id, 1);
ok('keeping stores one record under one key', keepPhrases(w) && phrasesKept() && Object.keys(store).join() === PHRASES_KEY);
const back = loadPhrases()!;
ok('it comes back whole: sentence, mark, detail and level', back.sentence === w.sentence && back.marks.length === 1 && back.marks[0].level === 1 && back.marks[0].detail?.word === 'rest');
ok('the record holds no time, counter, history or identifier', Object.keys(JSON.parse(store[PHRASES_KEY])).sort().join() === 'marks,sentence,v');
keepPhrases(createWorkbench('A second sentence.'));
ok('only the latest sentence is kept; the earlier one is replaced', loadPhrases()!.sentence === 'A second sentence.' && Object.keys(store).length === 1);
store[PHRASES_KEY] = '{broken';
ok('a damaged record is ignored, not trusted', loadPhrases() === null);
const restored = reduce(initialView(), { t: 'restore', wb: back });
ok('restoring puts the person back on Mark with the slider on for a need that had a level, and the switch on', restored.step === 1 && restored.remember === true && restored.sliderOn[back.marks[0].id] === true && restored.draft === back.sentence);
ok('Forget turns the switch off and says so', run(restored, { t: 'forget' }).remember === false && /Forgotten/.test(run(restored, { t: 'forget' }).announce));
keepPhrases(w); forgetPhrases();
ok('forgetPhrases removes the record', !phrasesKept() && loadPhrases() === null);
keepPhrases(w); dm.wipeDevice({ keepOwner: true });
ok('"Forget me" and Emergency Exit remove it with every other nenya key', !phrasesKept());
(globalThis as any).localStorage = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }, removeItem() { throw new Error('blocked'); } };
ok('blocked storage keeps nothing and does not throw', keepPhrases(w) === false && loadPhrases() === null && phrasesKept() === false);
